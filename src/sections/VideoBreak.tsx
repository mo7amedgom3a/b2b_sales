import { Clock3 } from 'lucide-react'
import { useState } from 'react'
import { Icon } from '../ui/Icon'
import { video } from '../content/ar'
import { GlassText } from '../motion/GlassText'
import { Reveal } from '../motion/Reveal'
import { Button } from '../ui/Button'
import { Tag } from '../ui/Tag'
import { Todo } from '../ui/Todo'
import { VideoDialog } from '../ui/VideoDialog'

export function VideoBreak() {
  const [open, setOpen] = useState(false)

  return (
    <section className="section video-band" id="video">
      <div className="ma-container video-band__center">
        <Reveal>
          <span className="video-band__kicker">
            <span className="eyebrow__dot" aria-hidden="true" />
            {video.kicker}
          </span>
          <h2 className="video-band__title">
            <GlassText>{video.title}</GlassText>
          </h2>
          <p className="video-band__line">
            {video.line} <Todo>اسم المتحدث</Todo>
          </p>
          <div className="video-band__meta">
            <Clock3 className="icon-clock" aria-hidden="true" />
            <span>دقيقتان</span>
            <span aria-hidden="true">·</span>
            <span>بدون تسجيل</span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="video-glow">
            <div className="video-frame video-frame--wide">
              <img
                src={video.poster}
                alt="مشهد من الفيديو التعريفي لماستري"
                loading="lazy"
                width="960"
                height="540"
              />
              <span className="video-frame__veil" aria-hidden="true" />
              <Tag tone="ink" className="video-frame__tag">
                فيديو تعريفي
              </Tag>
              <button
                className="video-frame__play video-frame__play--center"
                type="button"
                onClick={() => setOpen(true)}
                aria-label={video.cta}
              >
                <span className="circle" aria-hidden="true">
                  <Icon name="play" />
                </span>
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <div className="video-band__actions">
            <Button variant="on-ink" size="lg" onClick={() => setOpen(true)}>
              {video.cta}
              <Icon name="play" size={18} />
            </Button>
          </div>
        </Reveal>
      </div>

      <VideoDialog
        open={open}
        onOpenChange={setOpen}
        title={video.title}
        youtubeId={video.youtubeId}
        note={video.todo}
      />
    </section>
  )
}
