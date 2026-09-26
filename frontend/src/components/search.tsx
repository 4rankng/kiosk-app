import { SearchLg } from '@untitledui/icons'
import { Button, type ButtonProps } from '@/components/base/buttons/button'
import { useSearch } from '@/context/search-provider'
import { cn } from '@/lib/utils'

export function Search({
  className = '',
  placeholder = 'Tìm kiếm',
  ...props
}: React.ComponentProps<'button'> & { placeholder?: string }) {
  const { setOpen } = useSearch()
  return (
    <Button
      {...(props as ButtonProps)}
      color='secondary'
      size='sm'
      iconLeading={SearchLg}
      aria-keyshortcuts='Meta+K Control+K'
      className={cn(
        'relative w-full flex-1 justify-start sm:w-40 sm:pe-12 md:flex-none lg:w-52 xl:w-64',
        className
      )}
      onClick={() => setOpen(true)}
    >
      {placeholder}
      <kbd className='pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-secondary bg-primary px-1.5 font-mono text-xs font-medium text-tertiary sm:flex'>
        <span className='text-xs'>⌘</span>K
      </kbd>
    </Button>
  )
}
