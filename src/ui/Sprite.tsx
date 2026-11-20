import sprite from '../assets/sprite.svg?raw'

/** Inlines the design-kit sprite so <use href="#ma-logo"> works in every browser. */
export function Sprite() {
  return (
    <div
      aria-hidden="true"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
      dangerouslySetInnerHTML={{ __html: sprite }}
    />
  )
}
