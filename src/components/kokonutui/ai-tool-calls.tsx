"use client";

/**
 * @author: @kokonutui
 * @description: AI Tool Calls
 * @version: 1.1.0
 * @date: 2026-10-31
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 *
 * Adapted for the Mastery landing: Arabic labels (overridable), RTL logical
 * classes, kit colour tokens (so data-theme dark works), and `tone` per call.
 */

import {
  CalendarCheck,
  ChevronDown,
  FileText,
  Search,
  Wrench,
} from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The states an AI SDK tool part goes through, so `part.state` can be passed
 * straight in. `output-available`, `output-error` and `output-denied` end
 * a call; the rest show it running.
 */
export type ToolCallState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-error"
  | "output-denied";

export interface ToolCallItem {
  /** Stable across renders, e.g. the part's `toolCallId`. */
  id: string;
  /** The tool's name, such as `web_search`. Picks the icon. */
  tool: string;
  /** While it runs, e.g. "Searching the web". Defaults to the tool's name. */
  running?: string;
  /** Once done, e.g. "Searched the web". Defaults to `running`. */
  done?: string;
  /** The main argument: a query, a URL, a file. */
  detail?: string;
  /** A short result, e.g. "8 results". */
  result?: string;
  /**
   * Where the call is. Give every call a state to drive the list from your
   * stream; leave them all out and the calls play through on `duration`.
   */
  state?: ToolCallState;
  /** Shown in place of the result when the call fails. */
  error?: string;
  /** Demo only: how long the call takes, in ms. */
  duration?: number;
  icon?: ReactNode;
  /** Kit colour for the icon tint; otherwise picked from the tool name. */
  tone?: ToolTone;
}

export type ToolTone = "sky" | "lilac" | "coral" | "yellow" | "green" | "neutral";

export interface ToolCallLabels {
  working: string;
  used: (count: number, failures: number) => string;
  failed: string;
  denied: string;
  seconds: (ms: number) => string;
}

const DEFAULT_LABELS: ToolCallLabels = {
  working: "يعمل الآن",
  used: (count, failures) => `نُفّذت ${count} ${count === 1 ? "مهمة" : "مهام"}${failures ? `، تعذّر ${failures}` : ""}`,
  failed: "تعذّر",
  denied: "رُفض",
  seconds: (ms) => `${(ms / 1000).toFixed(1)} ث`,
};

export interface AIToolCallsProps {
  /** The user's message, drawn as a bubble. Only the demo draws one by default. */
  prompt?: string;
  /** The calls in this reply, oldest first. Demo calls when omitted. */
  calls?: ToolCallItem[];
  /** The reply under the calls, shown once every call has ended. */
  answer?: ReactNode;
  className?: string;
  /** UI strings (Arabic by default). */
  labels?: Partial<ToolCallLabels>;
  /** Start folded / answered when everything is already done at mount. */
  foldDelay?: number;
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const FOLD_DELAY = 650;
const DEMO_DURATION = 1000;
const SEARCH_TOOL = /search/;
const READ_TOOL = /read|fetch|page|file/;
const BOOK_TOOL = /calendar|availab|book/;
const SEPARATORS = /[_-]+/g;

const DEMO_PROMPT = "Find me a quiet hotel in Alfama for Nov 14–16, under €200";

const DEMO_CALLS: ToolCallItem[] = [
  {
    id: "search",
    tool: "web_search",
    running: "Searching the web",
    done: "Searched the web",
    detail: "quiet hotels Alfama Lisbon",
    result: "8 results",
    duration: 1300,
  },
  {
    id: "read",
    tool: "read_page",
    running: "Reading",
    done: "Read",
    detail: "memmo-alfama.com/rooms",
    result: "1 page",
    duration: 900,
  },
  {
    id: "rooms",
    tool: "check_availability",
    running: "Checking rooms",
    done: "Checked rooms",
    detail: "Memmo Alfama · Nov 14–16",
    result: "€184 / night",
    duration: 1200,
  },
];

const DEMO_ANSWER =
  "Memmo Alfama has a terrace room free for Nov 14–16 at €184 a night. It sits on a pedestrian lane above the river, so it stays quiet after dark, and breakfast is included.";

const iconFor = (tool: string) => {
  if (SEARCH_TOOL.test(tool)) {
    return Search;
  }
  if (READ_TOOL.test(tool)) {
    return FileText;
  }
  if (BOOK_TOOL.test(tool)) {
    return CalendarCheck;
  }
  return Wrench;
};

const toneFor = (call: ToolCallItem): ToolTone => {
  if (call.tone) {
    return call.tone;
  }
  if (SEARCH_TOOL.test(call.tool)) {
    return "sky";
  }
  if (READ_TOOL.test(call.tool)) {
    return "lilac";
  }
  if (BOOK_TOOL.test(call.tool)) {
    return "coral";
  }
  return "neutral";
};

const ended = (state?: ToolCallState) =>
  state === "output-available" ||
  state === "output-error" ||
  state === "output-denied";

const failed = (state?: ToolCallState) =>
  state === "output-error" || state === "output-denied";

const runningLabel = (call: ToolCallItem) =>
  call.running ?? call.tool.replace(SEPARATORS, " ");

/**
 * Plays calls one after another on their `duration`, as the states a stream
 * would give them. Only runs while `active`.
 */
function usePlayback(calls: ToolCallItem[], active: boolean) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!active || current >= calls.length) {
      return;
    }
    const next = setTimeout(
      () => setCurrent((i) => i + 1),
      calls[current].duration ?? DEMO_DURATION
    );
    return () => clearTimeout(next);
  }, [active, current, calls]);

  return calls
    .slice(0, Math.min(current + 1, calls.length))
    .map<ToolCallItem>((call, i) => ({
      ...call,
      state: i < current ? "output-available" : "input-available",
    }));
}

/**
 * When each call started and ended, as this component saw it. Calls that
 * were already over when it mounted (an older message) have no times, so
 * their reply shows no duration rather than a wrong one.
 */
function useTimings(calls: ToolCallItem[]) {
  const times = useRef(new Map<string, { start?: number; end?: number }>());
  const mounted = useRef(false);
  const [now, setNow] = useState(0);
  const anyRunning = calls.some((call) => !ended(call.state));

  for (const call of calls) {
    const entry = times.current.get(call.id);
    if (!entry) {
      const fresh = mounted.current || !ended(call.state);
      times.current.set(call.id, fresh ? { start: performance.now() } : {});
    } else if (ended(call.state) && entry.start !== undefined && !entry.end) {
      entry.end = performance.now();
    }
  }

  useEffect(() => {
    mounted.current = true;
  }, []);

  useEffect(() => {
    if (!anyRunning) {
      return;
    }
    const tick = setInterval(() => setNow(performance.now()), 100);
    return () => clearInterval(tick);
  }, [anyRunning]);

  const elapsed = (id: string) => {
    const entry = times.current.get(id);
    if (entry?.start === undefined) {
      return;
    }
    return (entry.end ?? Math.max(now, entry.start)) - entry.start;
  };

  return { elapsed };
}

/** A value, or the demo's when the component runs as the demo. */
function withDemo<T>(value: T | undefined, isDemo: boolean, demo: T) {
  return value ?? (isDemo ? demo : undefined);
}

/** The calls as they stand: from props when they carry states, else played. */
function useCalls(source: ToolCallItem[]) {
  const playing = source.every((call) => call.state === undefined);
  const played = usePlayback(source, playing);
  return playing ? played : source;
}

/** What the header and the screen reader line say about the calls. */
function summarize(
  calls: ToolCallItem[],
  elapsed: (id: string) => number | undefined,
  labels: ToolCallLabels
) {
  const finished = calls.length > 0 && calls.every((call) => ended(call.state));
  const failures = calls.filter((call) => failed(call.state)).length;
  const durations = calls.map((call) => elapsed(call.id));
  const timed = calls.length > 0 && durations.every((d) => d !== undefined);
  return {
    finished,
    summary: labels.used(calls.length, failures),
    total: timed
      ? durations.reduce<number>((sum, d) => sum + (d ?? 0), 0)
      : undefined,
    active: calls.find((call) => !ended(call.state)),
  };
}

/**
 * Folds the list away a beat after the last call ends, then shows the
 * answer. A reply that was already done when it mounted starts folded.
 */
function useFold(finished: boolean, foldDelay: number) {
  const [doneAtMount] = useState(finished);
  const [open, setOpen] = useState(!doneAtMount);
  const [answered, setAnswered] = useState(doneAtMount);

  useEffect(() => {
    if (!finished) {
      setAnswered(false);
      return;
    }
    if (answered) {
      return;
    }
    const fold = setTimeout(() => {
      setOpen(false);
      setAnswered(true);
    }, foldDelay);
    return () => clearTimeout(fold);
  }, [finished, answered, foldDelay]);

  return { doneAtMount, open, setOpen, answered };
}

export default function AIToolCalls({
  prompt,
  calls: callsProp,
  answer,
  className,
  labels: labelsProp,
  foldDelay = FOLD_DELAY,
}: AIToolCallsProps) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const listId = useId();
  const isDemo = callsProp === undefined;
  const calls = useCalls(callsProp ?? DEMO_CALLS);
  const { elapsed } = useTimings(calls);
  const { finished, summary, total, active } = summarize(calls, elapsed, labels);
  const { doneAtMount, open, setOpen, answered } = useFold(finished, foldDelay);
  // The demo brings its own question and answer; a real reply only shows
  // what it's given, since the app draws the conversation around it.
  const shownPrompt = withDemo(prompt, isDemo, DEMO_PROMPT);
  const shownAnswer = withDemo(answer, isDemo, DEMO_ANSWER);

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn("tc flex w-full flex-col gap-3", className)}
        data-state={finished ? "done" : "running"}
      >
        {shownPrompt ? (
          <p className="tc-prompt max-w-[85%] self-end text-pretty rounded-2xl rounded-ee-md px-3.5 py-2 text-[14px] leading-snug">
            {shownPrompt}
          </p>
        ) : null}

        <div>
          <button
            aria-controls={listId}
            aria-expanded={open}
            className="tc-head group flex h-7 items-center gap-2 rounded-md text-[13px] outline-hidden"
            disabled={!finished}
            onClick={() => setOpen((o) => !o)}
            type="button"
          >
            <AnimatePresence initial={false} mode="popLayout">
              {finished ? (
                <motion.span
                  animate={{ opacity: 1 }}
                  className="flex items-center"
                  initial={{ opacity: 0 }}
                  key="stack"
                  transition={{ duration: 0.2 }}
                >
                  <IconStack calls={calls} still={doneAtMount} />
                </motion.span>
              ) : (
                <motion.span
                  className="flex size-5 items-center justify-center"
                  exit={{ opacity: 0 }}
                  key="spin"
                >
                  <Spinner />
                </motion.span>
              )}
            </AnimatePresence>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                className={cn(
                  "font-medium transition-colors duration-150",
                  finished ? "tc-muted group-hover:tc-ink" : "tc-ink"
                )}
                exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
                initial={{ opacity: 0, y: 4, filter: "blur(2px)" }}
                key={finished ? "used" : "working"}
                transition={{ duration: 0.2, ease: EASE_OUT }}
              >
                {finished ? summary : labels.working}
              </motion.span>
            </AnimatePresence>
            {total === undefined ? null : (
              <span className="tc-faint text-[11.5px] tabular-nums" dir="ltr">
                {labels.seconds(total)}
              </span>
            )}
            {finished && (
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "tc-faint size-3.5 transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
                  open ? "rotate-0" : "rotate-90"
                )}
              />
            )}
          </button>

          <AnimatePresence initial={false}>
            {open && calls.length > 0 && (
              <motion.div
                animate={{ height: "auto", opacity: 1 }}
                className="overflow-hidden"
                exit={{ height: 0, opacity: 0 }}
                id={listId}
                initial={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE_OUT }}
              >
                <ol className="tc-list ms-[9.5px] border-s pt-1 ps-[18px]">
                  <AnimatePresence initial={false}>
                    {calls.map((call) => (
                      <CallRow
                        call={call}
                        elapsed={elapsed(call.id)}
                        key={call.id}
                        labels={labels}
                      />
                    ))}
                  </AnimatePresence>
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {answered && shownAnswer ? (
            <motion.div
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              className="tc-answer"
              initial={
                doneAtMount ? false : { opacity: 0, filter: "blur(4px)", y: 4 }
              }
              transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.1 }}
            >
              {shownAnswer}
            </motion.div>
          ) : null}
        </AnimatePresence>
        <p aria-live="polite" className="sr-only">
          {finished ? summary : active && runningLabel(active)}
        </p>
      </div>
    </MotionConfig>
  );
}

function IconStack({
  calls,
  still,
}: {
  calls: ToolCallItem[];
  still: boolean;
}) {
  return calls.map((call, i) => {
    const Icon = iconFor(call.tool);
    return (
      <motion.span
        animate={{ x: 0, opacity: 1 }}
        className={cn(
          "tc-chip -ms-1.5 flex size-5 items-center justify-center rounded-full first:ms-0",
          failed(call.state) ? "tc-chip--fail" : `tc-chip--${toneFor(call)}`
        )}
        initial={still ? false : { x: 6 * i, opacity: 0 }}
        key={call.id}
        style={{ zIndex: calls.length - i }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
      >
        {call.icon ? <span className="tc-chip-icon">{call.icon}</span> : <Icon className="size-2.5" />}
      </motion.span>
    );
  });
}

function CallRow({
  call,
  elapsed,
  labels,
}: {
  call: ToolCallItem;
  elapsed?: number;
  labels: ToolCallLabels;
}) {
  const Icon = iconFor(call.tool);
  const running = !ended(call.state);
  const error = failed(call.state);
  let trailing: ReactNode = call.result;
  if (running) {
    trailing = elapsed === undefined ? null : labels.seconds(elapsed);
  } else if (error) {
    trailing =
      call.error ?? (call.state === "output-denied" ? labels.denied : labels.failed);
  }
  return (
    <motion.li
      animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
      className="list-none"
      data-state={running ? "running" : call.state}
      initial={{ height: 0, opacity: 0, filter: "blur(3px)" }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
    >
      <div className="flex h-8 items-center gap-2 text-[13px]">
        <span
          aria-hidden="true"
          className={cn("tc-ink-icon flex size-3.5 shrink-0 items-center justify-center", error ? "tc-tone--fail" : `tc-tone--${toneFor(call)}`)}
        >
          {call.icon ?? <Icon className="size-3.5" />}
        </span>
        <span
          className={cn(
            "shrink-0",
            running ? "tc-ink" : "tc-muted"
          )}
        >
          {running ? runningLabel(call) : (call.done ?? runningLabel(call))}
        </span>
        {call.detail ? (
          <span className="tc-faint min-w-0 truncate text-[12px]">
            {call.detail}
          </span>
        ) : null}
        <span className="ms-auto shrink-0 ps-2 text-[12px] tabular-nums">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              className={cn(
                "block",
                running && "tc-faint text-[11.5px]",
                !running && error && "tc-tone--fail",
                !(running || error) && "tc-result"
              )}
              exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
              initial={{ opacity: 0, y: 4, filter: "blur(2px)" }}
              dir={running ? "ltr" : undefined}
              key={running ? "time" : "result"}
              transition={{ duration: 0.18, ease: EASE_OUT }}
            >
              {trailing}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>
    </motion.li>
  );
}

function Spinner() {
  return (
    <motion.svg
      animate={{ rotate: 360 }}
      aria-hidden="true"
      className="tc-ink size-3.5"
      fill="none"
      transition={{
        duration: 0.6,
        ease: "linear",
        repeat: Number.POSITIVE_INFINITY,
      }}
      viewBox="0 0 16 16"
    >
      <circle
        cx="8"
        cy="8"
        opacity="0.15"
        r="6.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M8 1.75a6.25 6.25 0 0 1 6.25 6.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </motion.svg>
  );
}
