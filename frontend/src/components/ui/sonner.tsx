import { Toaster as Sonner, ToasterProps } from 'sonner'

export function Toaster({ ...props }: ToasterProps) {
  // Wrap in a status region so toast announcements are discoverable by
  // assistive technology. Individual toasts default to role="status" (polite);
  // error toasts use role="alert" (assertive).
  return (
    <div role='status' aria-live='polite' aria-label='Thông báo'>
      <Sonner
        theme='light'
        className='toaster group [&_div[data-content]]:w-full'
        style={
          {
            '--normal-bg': 'var(--popover)',
            '--normal-text': 'var(--popover-foreground)',
            '--normal-border': 'var(--border)',
          } as React.CSSProperties
        }
        {...props}
      />
    </div>
  )
}
