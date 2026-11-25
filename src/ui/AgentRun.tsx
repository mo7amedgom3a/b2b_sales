import type { ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import AIToolCalls, { type ToolCallItem } from '@/components/kokonutui/ai-tool-calls'
import { cn } from '../lib/cx'

/** The tool-calls component folds this long after the last task ends. */
export const AGENT_FOLD_MS = 650

/** How long a run of tasks takes until its answer shows (sum of durations + fold). */
export function agentRunMs(calls: readonly ToolCallItem[]) {
  return calls.reduce((sum, call) => sum + (call.duration ?? 1000), 0) + AGENT_FOLD_MS
}

/**
 * Replaces "typing…" lines and skeleton bars: once the question is typed, the
 * agent's tasks stream in one by one with a live timer, fold into a single
 * «نُفّذت 3 مهام» line, and the answer (children) appears underneath.
 *
 * `active` is false while the prompt is still being typed (nothing is shown);
 * `runKey` changes per scene so every scene plays its own fresh run.
 */
export function AgentRun({
  active,
  runKey,
  calls,
  children,
  className,
}: {
  active: boolean
  runKey: string
  calls: readonly ToolCallItem[]
  children: ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  if (!active) return <div className={cn('agent-run agent-run--idle', className)} aria-hidden="true" />
  // Reduced motion: no playback, straight to the folded summary + answer.
  const shown = reduce ? calls.map((call) => ({ ...call, state: 'output-available' as const })) : [...calls]
  return (
    <div className={cn('agent-run', className)}>
      <AIToolCalls key={runKey} calls={shown} answer={children} />
    </div>
  )
}
