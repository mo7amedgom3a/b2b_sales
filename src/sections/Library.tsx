import { BookOpen, Bot, Clock3, Landmark, Megaphone, RefreshCw, TrendingUp, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fallbackProducts } from '../content/products'
import { fetchSalesProductCards, SITE_URL } from '../lib/api'
import type { ApiProductCard } from '../lib/api'
import { formatDuration, formatNumber, formatPrice } from '../lib/format'
import { pickSalesProducts } from '../lib/products'
import { Reveal } from '../motion/Reveal'
import { Avatar } from '../ui/Avatar'
import { Button } from '../ui/Button'
import { Icon } from '../ui/Icon'
import { SecHead } from '../ui/SecHead'
import { Tag } from '../ui/Tag'

const tones = ['coral', 'yellow', 'sky', 'lilac', 'green', 'purple'] as const

function categoryGlyph(category: string | null) {
  const value = category ?? ''
  if (value.includes('المبيعات')) return TrendingUp
  if (value.includes('التسويق')) return Megaphone
  if (value.includes('الذكاء')) return Bot
  if (value.includes('المالية') || value.includes('المصرفي')) return Landmark
  if (value.includes('الفاعلية')) return UserRound
  return BookOpen
}

function ProductCard({ product, tone, index }: { product: ApiProductCard; tone: (typeof tones)[number]; index: number }) {
  const duration = formatDuration(product.duration_seconds)
  const category = product.category ?? 'دورة'
  const instructor = product.instructor_name?.trim()
  const Glyph = categoryGlyph(product.category)
  const instructorInitial = instructor
    ? instructor.replace(/^(أ\.|د\.|م\.|أ|د|م)\s*/u, '').trim().charAt(0)
    : '؟'
  const image = product.image ?? product.instructor_avatar ?? null
  const hasImage = Boolean(image)

  return (
    <a
      className={`product-card ${hasImage ? 'product-card--image' : 'product-card--flat'}`}
      href={`${SITE_URL}/courses/${product.slug}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {hasImage ? (
        <>
          <img className="product-card__bg" src={image ?? undefined} alt="" loading="lazy" aria-hidden="true" />
          <span className="product-card__scrim" aria-hidden="true" />
        </>
      ) : null}

      <div className={`product-card__media ${hasImage ? 'product-card__media--image' : `product-card__media--${tone}`}`}>
        <Tag tone="cream" className="product-card__tag">
          {category}
        </Tag>
        {hasImage ? null : <Glyph className="product-card__glyph" aria-hidden="true" />}
        <span className="product-card__index" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="product-card__body">
        <h3 className="product-card__title">{product.title}</h3>
        {instructor ? (
          <span className="product-card__inst">
            <Avatar
              initial={instructorInitial}
              tone={tone}
              size={26}
              photo={product.instructor_avatar ?? image ?? undefined}
              alt={instructor}
            />
            {instructor}
          </span>
        ) : null}
        <div className="product-card__meta">
          {duration ? (
            <span>
              <Clock3 aria-hidden="true" />
              {duration}
            </span>
          ) : null}
          <span>
            <BookOpen aria-hidden="true" />
            {formatNumber(product.lesson_count)} درساً
          </span>
        </div>
      </div>

      <div className="product-card__foot">
        <span className="product-card__price">{formatPrice(product.price)}</span>
        <span className="product-card__arrow" aria-hidden="true">
          <Icon name="arrow-out" size={14} />
        </span>
      </div>
    </a>
  )
}

export function Library() {
  const [products, setProducts] = useState<ApiProductCard[]>(fallbackProducts)
  const [live, setLive] = useState(false)

  // One request on mount, sales category only. It usually resolves before the
  // visitor scrolls here, and the fallback is the same category, so the grid
  // never swaps from mixed courses to sales courses in view.
  useEffect(() => {
    let cancelled = false
    fetchSalesProductCards(12)
      .then((page) => {
        if (cancelled) return
        const picked = pickSalesProducts(page.items, 6)
        if (picked.length > 0) {
          setProducts(picked)
          setLive(true)
        }
      })
      .catch(() => {
        // Keep the sales-catalog snapshot when the API is unreachable.
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="section section--band library" id="library">
      <div className="ma-container">
        <SecHead
          index="06"
          title="من مكتبة ماستري"
          lead="مختارات حقيقية من مكتبة ماستري، تُحدّث من المنصة: دورات في البيع والتسويق والقيادة والذكاء الاصطناعي."
        />

        <div className="library__source">
          <Tag tone="soft" className="library__live">
            <RefreshCw className={live ? 'icon-spin-slow' : undefined} aria-hidden="true" />
            {live ? 'بيانات محدّثة من منصة ماستري' : 'مختارات من المكتبة'}
          </Tag>
          <span className="library__hint">اختر دورة، أو ابدأ بمسار مبني على تشخيص فريقك.</span>
        </div>

        <div className="product-grid">
          {products.map((product, index) => (
            <Reveal className="product-card-wrap" key={product.slug} delay={index * 0.04}>
              <ProductCard product={product} tone={tones[index % tones.length] ?? 'coral'} index={index} />
            </Reveal>
          ))}
        </div>

        <div className="library__cta">
          <Button href="#booking" variant="primary">
            اعرف المسار المناسب لفريقك
          </Button>
          <Button href={`${SITE_URL}/courses`} target="_blank" rel="noopener noreferrer" variant="soft">
            تصفح المكتبة
            <Icon name="arrow-out" size={16} className="btn-arrow-out" />
          </Button>
        </div>
      </div>
    </section>
  )
}
