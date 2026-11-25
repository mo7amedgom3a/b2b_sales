import { useRef, useState } from 'react'
import { story } from '../content/ar'
import { Reveal } from '../motion/Reveal'
import {
  ArrowLeft,
  MessagesSquare,
  Quote,
  SearchCheck,
  TrendingUp,
  TriangleAlert,
  Trophy,
  Wrench,
} from 'lucide-react'
import { Avatar } from '../ui/Avatar'
import { SecHead } from '../ui/SecHead'
import { Tag } from '../ui/Tag'
import { Todo } from '../ui/Todo'
import { InlineVideo } from '../ui/InlineVideo'

export function SuccessStory() {
  const [playing, setPlaying] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)

  // The side button starts the video in place and brings the frame into view.
  const play = () => {
    setPlaying(true)
    frameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <section className="section story" id="stories">
      <div className="ma-container">
        <SecHead index="09" title={story.title} lead={story.challenge} icon={Trophy} />

        <div className="story__grid">
          <Reveal>
            <div className="gap-table">
              <div className="gap-row gap-row--head">
                <span>
                  <SearchCheck aria-hidden="true" /> الفجوة التي كشفها التشخيص
                </span>
                <span>
                  <Wrench aria-hidden="true" /> الحل
                </span>
              </div>
              {story.rows.map(([gap, solution]) => (
                <div className="gap-row" key={gap} data-fx="rise">
                  <span className="gap-row__gap">
                    <TriangleAlert aria-hidden="true" />
                    {gap}
                  </span>
                  <span className="gap-row__solution">
                    <ArrowLeft className="gap-row__arrow" aria-hidden="true" />
                    {solution}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="story-results">
              <div>
                <p className="story-results__label">
                  <TrendingUp aria-hidden="true" /> النتيجة — خلال 6 أشهر
                </p>
              </div>
              {story.results.map((result, index) => (
                <div className="story-result" key={result.label} data-fx="rise">
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
            <div ref={frameRef}>
              <InlineVideo
                className="story-video__frame"
                youtubeId={story.youtubeId}
                title={story.videoTitle}
                poster="/assets/testimonials/testimonial-cover.jpg"
                posterAlt="فريق الأصول العقارية في مقر العمل"
                playing={playing}
                onPlay={play}
                start={story.youtubeStart}
                label={story.videoTitle}
                fallback={story.videoNote}
              />
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div>
              <Tag tone="cream">من العميل</Tag>
              <p className="story-quote" style={{ marginBlockStart: 14 }}>
                {story.quote}
              </p>
             
              
            </div>
          </Reveal>
        </div>

        <div className="testimonials">
          <div className="testimonials__head">
            <h3>
              <MessagesSquare aria-hidden="true" />
              {story.testimonialsTitle}
            </h3>
          </div>
          <div className="testimonials__grid">
            {story.testimonials.map((item, index) => (
              <Reveal className={`testimonial `} key={item.name} delay={index * 0.05}>
                <span className="testimonial__mark" aria-hidden="true">
                  <Quote />
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
    </section>
  )
}
