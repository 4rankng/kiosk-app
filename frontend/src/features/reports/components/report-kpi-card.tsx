import { type FC } from 'react'

interface ReportKpiCardProps {
  icon: FC<{ className?: string }>
  label: string
  value: string | number
  hint: string
  /** Extra class for the label line (e.g. a warning/success tone). */
  labelClassName?: string
  /** Extra class for the value line (e.g. a warning/success tone). */
  valueClassName?: string
  /** Extra class for the trailing icon. */
  iconClassName?: string
}

/** Summary KPI card shared by the report pages (customers, products). */
export function ReportKpiCard({
  icon: Icon,
  label,
  value,
  hint,
  labelClassName = 'text-tertiary',
  valueClassName = 'text-primary',
  iconClassName = 'text-fg-quaternary',
}: ReportKpiCardProps) {
  return (
    <div className='rounded-lg border border-primary bg-primary p-4'>
      <div className='flex items-center justify-between'>
        <span className={`text-sm font-medium ${labelClassName}`}>{label}</span>
        <Icon className={`size-4 ${iconClassName}`} />
      </div>
      <div className={`mt-2 font-heading text-display-md font-semibold tabular-nums ${valueClassName}`}>
        {value}
      </div>
      <p className='mt-1 text-xs text-tertiary'>{hint}</p>
    </div>
  )
}
