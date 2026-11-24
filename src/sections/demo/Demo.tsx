import { demo } from '../../content/ar'
import { DemoTable } from './DemoTable'

/** The animated platform table, right after the video. */
export function Demo() {
  return (
    <section className="section demo-section" id="demo">
      <div className="ma-container">
        <header className="demo-section__head">
          <span className="demo-section__kicker">
            <span className="eyebrow__dot" aria-hidden="true" />
            {demo.kicker}
          </span>
          <h2 className="demo-section__title">{demo.title}</h2>
          <p className="demo-section__lead">{demo.lead}</p>
        </header>
        <div className="demo-section__stage focus-glow">
          <DemoTable />
        </div>
      </div>
    </section>
  )
}
