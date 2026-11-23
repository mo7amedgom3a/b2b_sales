import * as React from 'react'
import * as RechartsPrimitive from 'recharts'
import { cn } from '../lib/cx'

/**
 * reui.io / shadcn chart primitives (Recharts), adapted to the Mastery flat kit:
 * kit colour tokens, hairline grids, bordered tooltip with no shadow, RTL-first
 * axes. Charts are decorative-but-honest: they carry the «مثال توضيحي» label and
 * are paused off-screen by the sections that own them.
 */
export type ChartConfig = Record<string, { label?: React.ReactNode; color?: string }>

/** A kit colour as a CSS value, for chart configs and SVG fills. */
export function kitColor(color: string): string {
  return `var(--${color})`
}

/** Shared axis props: RTL-first (time runs right-to-left), no tick lines. */
export const rtlXAxis = { reversed: true, tickLine: false, axisLine: false, tickMargin: 8 } as const
export const rtlYAxis = {
  orientation: 'right',
  tickLine: false,
  axisLine: false,
  tickMargin: 8,
  width: 44,
} as const

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

export function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) throw new Error('useChart must be used within a <ChartContainer />')
  return context
}

export function ChartContainer({
  id,
  className,
  children,
  config,
  height = 200,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig
  children: React.ReactElement
  height?: number
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div data-chart={chartId} className={cn('ma-chart', className)} {...props}>
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer width="100%" height={height}>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colors = Object.entries(config).filter(([, item]) => item.color)
  if (!colors.length) return null
  const css = `[data-chart="${id}"] {\n${colors.map(([key, item]) => `  --color-${key}: ${item.color};`).join('\n')}\n}`
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}

export const ChartTooltip = RechartsPrimitive.Tooltip

type TooltipPayloadItem = {
  name?: string | number
  value?: number | string
  color?: string
  dataKey?: string | number
  payload?: Record<string, unknown>
}

type TooltipContentProps = {
  active?: boolean
  payload?: ReadonlyArray<TooltipPayloadItem>
  label?: string | number
  config?: ChartConfig
  valueSuffix?: string
  hideLabel?: boolean
  labelFormatter?: (label: React.ReactNode) => React.ReactNode
}

export function ChartTooltipContent({
  active,
  payload,
  label,
  config,
  valueSuffix = '',
  hideLabel = false,
  labelFormatter,
}: TooltipContentProps) {
  if (!active || !payload?.length) return null
  const labelText = labelFormatter ? labelFormatter(label) : label

  return (
    <div className="ma-chart__tip">
      {!hideLabel && labelText ? <div className="ma-chart__tip-label">{labelText}</div> : null}
      {payload
        .filter((item) => item.value !== undefined && item.value !== null)
        .map((item, index) => {
          const key = String(item.dataKey ?? item.name ?? 'value')
          const itemConfig = config?.[key]
          return (
            <div className="ma-chart__tip-row" key={`${key}-${index}`}>
              <span className="ma-chart__tip-ind" style={{ background: item.color ?? itemConfig?.color }} />
              <span className="ma-chart__tip-name">{itemConfig?.label ?? item.name}</span>
              <span className="ma-chart__tip-value">
                {typeof item.value === 'number' ? item.value.toLocaleString('en-US') : item.value}
                {valueSuffix}
              </span>
            </div>
          )
        })}
    </div>
  )
}

export const ChartLegend = RechartsPrimitive.Legend

export function ChartLegendContent({
  payload,
}: {
  payload?: ReadonlyArray<{ value?: string | number; color?: string; dataKey?: string | number }>
}) {
  const { config } = useChart()
  if (!payload?.length) return null
  return (
    <div className="ma-chart__legend">
      {payload.map((item, index) => {
        const key = String(item.dataKey ?? item.value ?? index)
        return (
          <span className="ma-chart__legend-item" key={key}>
            <span className="ma-chart__legend-dot" style={{ background: item.color }} />
            {config[key]?.label ?? item.value}
          </span>
        )
      })}
    </div>
  )
}
