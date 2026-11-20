type ProgressProps = {
  label: string
  value: number
  showValue?: boolean
}

export function Progress({ label, value, showValue = true }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className="ma-progress">
      <div className="ma-progress__row">
        <span>{label}</span>
        {showValue ? <span>{clamped}%</span> : null}
      </div>
      <div
        className="ma-progress__track"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="ma-progress__bar" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}
