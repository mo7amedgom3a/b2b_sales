import { CircleHelp, MessageCircleQuestion, MessagesSquare } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AnimateIcon, AnimatedPlus } from '../ui/animated-icons'
import { faq, site } from '../content/ar'
import { Reveal } from '../motion/Reveal'
import { Button } from '../ui/Button'
import { SecHead } from '../ui/SecHead'
import { Todo } from '../ui/Todo'

export function Faq() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <section className="section faq" id="faq">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="ma-container">
        <div className="faq__grid">
          <Reveal className="faq__aside">
            <SecHead index="12" title={faq.title} icon={CircleHelp} />
            <p className="faq__aside-note">
              <MessageCircleQuestion aria-hidden="true" />
              لم تجد سؤالك؟ تحدث مع مستشار مبيعات وسنوضح لك كيف يُبنى المسار على فريقك وقطاعك.
            </p>
            <Button href={site.whatsappHref} target="_blank" rel="noopener noreferrer" variant="soft">
              <MessagesSquare aria-hidden="true" />
              تحدث مع مستشار
            </Button>
          </Reveal>

          <Reveal delay={0.08}>
            <Accordion className="faq__list" type="single" collapsible defaultValue="faq-0">
              {faq.items.map((item, index) => (
                <AccordionItem value={`faq-${index}`} key={item.q}>
                  <AccordionTrigger
                    indicator={
                      <AnimateIcon animateOnHover>
                        <AnimatedPlus size={14} />
                      </AnimateIcon>
                    }
                  >
                    <span className="faq-item__q">
                      <CircleHelp className="faq-item__q-icon" aria-hidden="true" />
                      {item.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    {item.a}
                    {'todo' in item && item.todo ? <Todo>{item.todo}</Todo> : null}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
