import * as Accordion from '@radix-ui/react-accordion'
import { Plus } from 'lucide-react'
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
            <SecHead index="12" title={faq.title} />
            <p>
              لم تجد سؤالك؟ تحدث مع مستشار مبيعات وسنوضح لك كيف يُبنى المسار على فريقك وقطاعك.
            </p>
            <Button href={site.whatsappHref} target="_blank" rel="noopener noreferrer" variant="soft">
              تحدث مع مستشار
            </Button>
          </Reveal>

          <Reveal delay={0.08}>
            <Accordion.Root className="faq__list" type="single" collapsible defaultValue="faq-0">
              {faq.items.map((item, index) => (
                <Accordion.Item className="faq-item" value={`faq-${index}`} key={item.q}>
                  <Accordion.Header>
                    <Accordion.Trigger className="faq-item__trigger">
                      <span>{item.q}</span>
                      <span className="faq-item__icon" aria-hidden="true">
                        <Plus />
                      </span>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content className="faq-item__content">
                    <div className="faq-item__inner">
                      {item.a}
                      {'todo' in item && item.todo ? <Todo>{item.todo}</Todo> : null}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
