import { useState } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { ChevronDown } from '@untitledui/icons'
import { Tooltip } from '@/components/base/tooltip/tooltip'
import { cn } from '@/lib/utils'
import { useLayout } from '@/context/layout-provider'
import { useSidebarUI } from './use-sidebar-ui'
import {
  type NavCollapsible,
  type NavLink,
  type NavGroup as NavGroupProps,
} from './types'

type NavGroupOwnProps = NavGroupProps & {
  /** Render expanded navigation even when the desktop rail is collapsed (mobile drawer). */
  forceExpanded?: boolean
}

const itemBase =
  'flex h-9 items-center gap-2 rounded-md px-2 text-sm font-semibold text-secondary outline-focus-ring transition duration-100 ease-linear select-none hover:bg-primary_hover hover:text-secondary_hover focus-visible:outline-2 focus-visible:-outline-offset-2'
const itemActive = 'bg-secondary text-secondary_hover hover:bg-secondary hover:text-secondary_hover'
const itemIcon = 'size-5 shrink-0 text-fg-quaternary transition-inherit-all group-hover/item:text-fg-quaternary_hover'

export function NavGroup({ title, items, forceExpanded = false }: NavGroupOwnProps) {
  const { collapsible } = useLayout()
  const { collapsed, setOpen } = useSidebarUI()
  const rail = collapsible === 'icon' && collapsed && !forceExpanded
  const href = useLocation({ select: (location) => location.href })

  return (
    <div className='flex flex-col gap-0.5 px-2'>
      {title && (
        <p className='px-2 py-1.5 text-xs font-semibold text-tertiary'>{title}</p>
      )}
      <ul className='flex flex-col gap-0.5'>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`

          if (rail) {
            return item.items ? (
              <RailGroupLink key={key} item={item} />
            ) : (
              <RailLink key={key} item={item} isActive={checkIsActive(href, item)} />
            )
          }

          return item.items ? (
            <NavCollapsibleItem key={key} item={item} href={href} />
          ) : (
            <NavLeafLink key={key} item={item} href={href} onNavigate={() => setOpen(false)} />
          )
        })}
      </ul>
    </div>
  )
}

function NavLeafLink({
  item,
  href,
  onNavigate,
}: {
  item: NavLink
  href: string
  onNavigate: () => void
}) {
  const active = checkIsActive(href, item)
  const Icon = item.icon

  return (
    <li>
      <Link to={item.url} onClick={onNavigate} className={cn('group/item', itemBase, active && itemActive)}>
        {Icon && <Icon aria-hidden='true' className={cn(itemIcon, active && 'text-fg-quaternary_hover')} />}
        <span className='truncate'>{item.title}</span>
        {item.badge && (
          <span className='ms-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-tertiary'>
            {item.badge}
          </span>
        )}
      </Link>
    </li>
  )
}

function NavCollapsibleItem({ item, href }: { item: NavCollapsible; href: string }) {
  const { setOpen } = useSidebarUI()
  const [open, setOpenState] = useState(true)
  const active = checkIsActive(href, item)
  const Icon = item.icon

  return (
    <li>
      <button
        type='button'
        aria-expanded={open}
        onClick={() => setOpenState((v) => !v)}
        className={cn('group/item w-full', itemBase, active && itemActive)}
      >
        {Icon && <Icon aria-hidden='true' className={cn(itemIcon, active && 'text-fg-quaternary_hover')} />}
        <span className='truncate text-left'>{item.title}</span>
        {item.badge && (
          <span className='ms-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-tertiary'>
            {item.badge}
          </span>
        )}
        <ChevronDown
          aria-hidden='true'
          className={cn(
            'size-4 shrink-0 text-fg-quaternary transition-transform duration-200',
            open && 'rotate-180',
            !item.badge && 'ms-auto'
          )}
        />
      </button>
      {open && (
        <ul className='mt-0.5 flex flex-col gap-0.5 pl-6'>
          {item.items.map((subItem) => (
            <li key={`${subItem.title}-${subItem.url}`}>
              <Link
                to={subItem.url}
                onClick={() => setOpen(false)}
                className={cn(itemBase, checkIsActive(href, subItem) && itemActive)}
              >
                {subItem.icon && <subItem.icon aria-hidden='true' className='size-5 shrink-0 text-fg-quaternary' />}
                <span className='truncate'>{subItem.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

function RailLink({ item, isActive }: { item: NavLink; isActive: boolean }) {
  const { setOpen } = useSidebarUI()
  const Icon = item.icon
  if (!Icon) return null

  return (
    <li>
      <Tooltip title={item.title} placement='right'>
        <Link
          to={item.url}
          onClick={() => setOpen(false)}
          aria-label={item.title}
          className={cn(
            'flex size-9 items-center justify-center rounded-md outline-focus-ring transition duration-100 ease-linear select-none hover:bg-primary_hover focus-visible:outline-2 focus-visible:-outline-offset-2',
            isActive && 'bg-secondary hover:bg-secondary'
          )}
        >
          <Icon
            aria-hidden='true'
            className={cn('size-5 shrink-0 text-fg-quaternary', isActive && 'text-fg-quaternary_hover')}
          />
        </Link>
      </Tooltip>
    </li>
  )
}

function RailGroupLink({ item }: { item: NavCollapsible }) {
  const { setOpen } = useSidebarUI()
  const first = item.items[0]
  const Icon = item.icon
  if (!first || !Icon) return null

  return (
    <li>
      <Tooltip title={item.title} placement='right'>
        <Link
          to={first.url}
          onClick={() => setOpen(false)}
          aria-label={item.title}
          className='flex size-9 items-center justify-center rounded-md outline-focus-ring transition duration-100 ease-linear select-none hover:bg-primary_hover focus-visible:outline-2 focus-visible:-outline-offset-2'
        >
          <Icon aria-hidden='true' className='size-5 shrink-0 text-fg-quaternary' />
        </Link>
      </Tooltip>
    </li>
  )
}

function checkIsActive(href: string, item: NavCollapsible | NavLink) {
  return (
    href === item.url || // /endpoint?search=param
    href.split('?')[0] === item.url || // endpoint
    !!item?.items?.filter((i) => i.url === href).length // if child nav is active
  )
}
