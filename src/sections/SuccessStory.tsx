import { useState } from 'react'
import { story } from '../content/ar'
import { Reveal } from '../motion/Reveal'
import { Button } from '../ui/Button'
import { Play } from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { SecHead } from '../ui/SecHead'
import { Tag } from '../ui/Tag'
import { Todo } from '../ui/Todo'
import { VideoDialog } from '../ui/VideoDialog'

export function SuccessStory() {
  const [open, setOpen] = useState(false)

  return (
    <section className="section story" id="stories">
      <div className="ma-container">
        <SecHead index="09" title={story.title} lead={story.challenge} />

        <div className="story__grid">
          <Reveal>
            <div className="gap-table">
              <div className="gap-row gap-row--head">
                <span>الفجوة التي كشفها التشخيص</span>
                <span>الحل</span>
              </div>
              {story.rows.map(([gap, solution]) => (
                <div className="gap-row" key={gap}>
                  <span className="gap-row__gap">{gap}</span>
                  <span className="gap-row__solution">{solution}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="story-results">
              <div>
                <p className="story-results__label">النتيجة — خلال 6 أشهر</p>
              </div>
              {story.results.map((result, index) => (
                <div className="story-result" key={result.label}>
                  <div className="story-result__value" dir={index < 2 ? 'ltr' : 'rtl'}>
                    {result.value}
                  </div>
                  <div className="story-result__label">{result.label}</div>
                </div>
              ))}
              <div className="story-results__label">
                <Todo>تأكيد الأرقام والمدة وموافقة العميل على النشر</Todo>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="story-video">
          <Reveal>
            <div className="story-video__frame">
              <img
                src="/assets/testimonials/testimonial-cover.jpg"
                alt="فريق الأصول العقارية في مقر العمل"
                loading="lazy"
                width="640"
                height="400"
              />
              <button className="story-video__play" type="button" onClick={() => setOpen(true)}>
                <span className="circle" aria-hidden="true">
                  <Play aria-hidden="true" />
                </span>
                {story.videoTitle}
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div>
              <Tag tone="cream">من العميل</Tag>
              <p className="story-quote" style={{ marginBlockStart: 14 }}>
                {story.quote}
              </p>
              <p className="story-quote__by">{story.quoteBy}</p>
              <span className="story-quote__placeholder">
                <Todo>الاقتباس واسم المتحدث من فيديو الأصول العقارية</Todo>
              </span>
              <div style={{ marginBlockStart: 18 }}>
                <Button variant="soft" onClick={() => setOpen(true)}>
                  شاهد فيديو القصة
                  <Play size={16} aria-hidden="true" />
                </Button>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="testimonials">
          <div className="testimonials__head">
            <h3>{story.testimonialsTitle}</h3>
          </div>
          <div className="testimonials__grid">
            {story.testimonials.map((item, index) => (
              <Reveal className={`testimonial `} key={item.name} delay={index * 0.05}>
                <span className="testimonial__mark" aria-hidden="true">
                  ”
                </span>
                <p className="testimonial__quote">{item.quote}</p>
                <div className="testimonial__person">
                  <Avatar initial={item.initial} tone={item.tone} size={36} />
                  <div>
                    <div className="testimonial__name">{item.name}</div>
                    <div className="testimonial__role">{item.role}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      <VideoDialog
        open={open}
        onOpenChange={setOpen}
        title={story.videoTitle}
        youtubeId={story.youtubeId}
        start={story.youtubeStart}
        note={story.videoNote}
      />
    </section>
  )
}
