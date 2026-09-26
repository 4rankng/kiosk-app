import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, ChevronRight } from '@untitledui/icons'
import { Dialog, Modal, ModalOverlay } from '@/components/application/modals/modal'
import { useSearch } from '@/context/search-provider'
import { cn } from '@/lib/utils'
import { sidebarData } from './layout/data/sidebar-data'
import { type NavLink } from './layout/types'

type CommandItem = {
  id: string
  parent?: string
  title: string
  url: NavLink['url']
}

export function CommandMenu() {
  const navigate = useNavigate()
  const { open, setOpen } = useSearch()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  /** Every close path (Escape, outside click, selection) resets the palette. */
  const handleOpenChange = (v: boolean) => {
    setOpen(v)
    if (!v) {
      setQuery('')
      setActiveIndex(0)
    }
  }

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result: CommandItem[] = []
    for (const group of sidebarData.navGroups) {
      for (const navItem of group.items) {
        if (navItem.items) {
          for (const sub of navItem.items) {
            const haystack = `${navItem.title} ${sub.title}`.toLowerCase()
            if (q === '' || haystack.includes(q)) {
              result.push({
                id: `${navItem.title}-${sub.url}`,
                parent: navItem.title,
                title: sub.title,
                url: sub.url,
              })
            }
          }
        } else if (q === '' || navItem.title.toLowerCase().includes(q)) {
          result.push({
            id: `${navItem.url}-${navItem.title}`,
            title: navItem.title,
            url: navItem.url,
          })
        }
      }
    }
    return result
  }, [query])

  const select = (item: CommandItem) => {
    handleOpenChange(false)
    navigate({ to: item.url })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, items.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && items[activeIndex]) {
      e.preventDefault()
      select(items[activeIndex])
    }
  }

  return (
    <ModalOverlay
      isOpen={open}
      onOpenChange={handleOpenChange}
      className='items-start pt-[12vh] pb-6 sm:items-start'
    >
      <Modal className='w-full max-w-lg overflow-hidden'>
        <Dialog aria-label='Tìm kiếm'>
          <div onKeyDown={handleKeyDown}>
            <div className='border-b border-secondary px-4'>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Nhập lệnh hoặc tìm kiếm...'
                aria-label='Nhập lệnh hoặc tìm kiếm'
                className='h-12 w-full bg-transparent text-sm text-secondary outline-hidden placeholder:text-fg-quaternary'
              />
            </div>
            <div
              role='listbox'
              aria-label='Kết quả điều hướng'
              className='max-h-72 overflow-y-auto p-1.5'
            >
              {items.length === 0 ? (
                <p className='px-4 py-8 text-center text-sm text-tertiary'>
                  Không tìm thấy kết quả.
                </p>
              ) : (
                items.map((item, index) => (
                  <button
                    key={item.id}
                    type='button'
                    role='option'
                    aria-selected={index === activeIndex}
                    onClick={() => select(item)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-secondary',
                      index === activeIndex && 'bg-primary_hover'
                    )}
                  >
                    <ArrowRight aria-hidden='true' className='size-3 text-fg-quaternary' />
                    {item.parent ? (
                      <span className='flex items-center gap-1'>
                        {item.parent}
                        {' '}
                        <ChevronRight aria-hidden='true' className='size-3.5 text-fg-quaternary' />
                        {' '}
                        {item.title}
                      </span>
                    ) : (
                      item.title
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
