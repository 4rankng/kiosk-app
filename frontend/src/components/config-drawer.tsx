import { type SVGProps, useState } from 'react'
import { Check, RefreshCcw02, Settings01 } from '@untitledui/icons'
import { Dialog, DialogTrigger, Modal, ModalOverlay } from '@/components/application/modals/modal'
import { Button } from '@/components/base/buttons/button'
import { ButtonUtility } from '@/components/base/buttons/button-utility'
import { CloseButton } from '@/components/base/buttons/close-button'
import { useDirection } from '@/context/direction-provider'
import { type Collapsible, useLayout } from '@/context/layout-provider'
import { cn } from '@/lib/utils'
import { getCookie, setCookie } from '@/lib/cookies'
import { IconDir } from '@/assets/custom/icon-dir'
import { IconLayoutCompact } from '@/assets/custom/icon-layout-compact'
import { IconLayoutDefault } from '@/assets/custom/icon-layout-default'
import { IconLayoutFull } from '@/assets/custom/icon-layout-full'
import { IconSidebarFloating } from '@/assets/custom/icon-sidebar-floating'
import { IconSidebarInset } from '@/assets/custom/icon-sidebar-inset'
import { IconSidebarSidebar } from '@/assets/custom/icon-sidebar-sidebar'
import { useSidebarUI } from './layout/use-sidebar-ui'

/**
 * Reads the sidebar UI context when available. Outside the app shell (e.g.
 * tests) it falls back to local state mirrored with the persisted cookie, so
 * the drawer stays reactive without SidebarUIProvider.
 */
function useOptionalSidebarUI() {
  // Always call the same hooks (the context read never throws before running),
  // so hook order stays identical whether the provider exists or not.
  const [fallbackCollapsed, setFallbackCollapsed] = useState<boolean>(
    () => getCookie('sidebar_state') === 'false'
  )

  let sidebarUI: ReturnType<typeof useSidebarUI> | null
  try {
    // Stable in practice: useSidebarUI always runs useContext before throwing,
    // and provider presence is fixed for a mounted instance, so hook order
    // never changes across renders.
    // eslint-disable-next-line react-hooks/rules-of-hooks -- optional-context read; see comment above
    sidebarUI = useSidebarUI()
  } catch {
    sidebarUI = null
  }

  if (sidebarUI) return sidebarUI

  const setCollapsed = (v: boolean) => {
    setFallbackCollapsed(v)
    setCookie('sidebar_state', String(!v), 60 * 60 * 24 * 7)
  }
  return {
    collapsed: fallbackCollapsed,
    setCollapsed,
    open: false,
    setOpen: () => {},
  }
}

function SectionTitle({
  title,
  showReset = false,
  onReset,
  resetAriaLabel,
  className,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  /** Shown on the small per-section reset (RefreshCcw02) for accessibility and tests. */
  resetAriaLabel?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'mb-2 flex items-center gap-2 text-sm font-semibold text-tertiary',
        className
      )}
    >
      {title}
      {showReset && onReset && (
        <ButtonUtility
          size='xs'
          color='secondary'
          icon={RefreshCcw02}
          tooltip={resetAriaLabel}
          onClick={onReset}
        />
      )}
    </div>
  )
}

function RadioCard({
  value,
  label,
  icon: Icon,
  selected,
  onSelect,
}: {
  value: string
  label: string
  icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  selected: boolean
  onSelect: (value: string) => void
}) {
  return (
    <button
      type='button'
      role='radio'
      aria-checked={selected}
      aria-label={`Chọn ${label.toLowerCase()}`}
      aria-describedby={`${value}-description`}
      data-state={selected ? 'checked' : 'unchecked'}
      onClick={() => onSelect(value)}
      className='group/radio rounded-lg outline-focus-ring focus-visible:outline-2 focus-visible:-outline-offset-2'
    >
      <div
        className={cn(
          'relative rounded-[6px] transition duration-200 ease-in',
          selected
            ? 'shadow-2xl ring-2 ring-brand'
            : 'ring-1 ring-secondary'
        )}
      >
        {selected && (
          <span
            aria-hidden='true'
            className='absolute top-0 right-0 flex size-5 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-solid'
          >
            <Check aria-hidden='true' className='size-3 stroke-[3] text-white' />
          </span>
        )}
        <Icon
          aria-hidden='true'
          className={cn(
            'size-14 fill-brand stroke-brand',
            !selected && 'fill-fg-quaternary stroke-fg-quaternary'
          )}
        />
      </div>
      <div
        id={`${value}-description`}
        aria-live='polite'
        className='mt-1 text-xs text-tertiary'
      >
        {label}
      </div>
    </button>
  )
}

type RadioCardItem = {
  value: string
  label: string
  icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
}

function RadioCardGroup<T extends string>({
  ariaLabel,
  describedbyId,
  value,
  onChange,
  items,
}: {
  ariaLabel: string
  describedbyId: string
  value: T
  onChange: (value: T) => void
  items: RadioCardItem[]
}) {
  return (
    <div
      role='radiogroup'
      aria-label={ariaLabel}
      aria-describedby={describedbyId}
    >
      <div className='grid w-full max-w-md grid-cols-3 gap-4'>
        {items.map((item) => (
          <RadioCard
            key={item.value}
            value={item.value}
            label={item.label}
            icon={item.icon}
            selected={value === item.value}
            onSelect={(v) => onChange(v as T)}
          />
        ))}
      </div>
    </div>
  )
}

function SidebarConfig() {
  const { defaultVariant, variant, setVariant } = useLayout()
  return (
    <div className='max-md:hidden'>
      <SectionTitle
        title='Thanh bên'
        showReset={defaultVariant !== variant}
        onReset={() => setVariant(defaultVariant)}
        resetAriaLabel='Đặt lại kiểu thanh bên về mặc định'
      />
      <RadioCardGroup
        ariaLabel='Chọn kiểu thanh bên'
        describedbyId='sidebar-description'
        value={variant}
        onChange={setVariant}
        items={[
          { value: 'inset', label: 'Lồng', icon: IconSidebarInset },
          { value: 'floating', label: 'Nổi', icon: IconSidebarFloating },
          { value: 'sidebar', label: 'Thanh bên', icon: IconSidebarSidebar },
        ]}
      />
      <div id='sidebar-description' className='sr-only'>
        Chọn giữa thanh bên lồng, nổi, hoặc dạng chuẩn
      </div>
    </div>
  )
}

function LayoutConfig() {
  const sidebarUI = useOptionalSidebarUI()
  const { defaultCollapsible, collapsible, setCollapsible } = useLayout()

  const radioState =
    collapsible === 'offcanvas' ? 'offcanvas' : sidebarUI.collapsed ? 'icon' : 'default'

  const handleChange = (v: string) => {
    if (v === 'default') {
      setCollapsible('icon')
      sidebarUI.setCollapsed(false)
    } else {
      setCollapsible(v as Collapsible)
      sidebarUI.setCollapsed(true)
    }
  }

  return (
    <div className='max-md:hidden'>
      <SectionTitle
        title='Bố cục'
        showReset={radioState !== 'default'}
        onReset={() => {
          setCollapsible(defaultCollapsible)
          sidebarUI.setCollapsed(false)
        }}
        resetAriaLabel='Đặt lại bố cục về mặc định'
      />
      <RadioCardGroup
        ariaLabel='Chọn kiểu bố cục'
        describedbyId='layout-description'
        value={radioState}
        onChange={handleChange}
        items={[
          { value: 'default', label: 'Mặc định', icon: IconLayoutDefault },
          { value: 'icon', label: 'Thu gọn', icon: IconLayoutCompact },
          { value: 'offcanvas', label: 'Toàn phần', icon: IconLayoutFull },
        ]}
      />
      <div id='layout-description' className='sr-only'>
        Chọn giữa bố cục mở rộng, thu gọn biểu tượng, hoặc toàn phần
      </div>
    </div>
  )
}

function DirConfig() {
  const { defaultDir, dir, setDir } = useDirection()
  return (
    <div>
      <SectionTitle
        title='Hướng'
        showReset={defaultDir !== dir}
        onReset={() => setDir(defaultDir)}
        resetAriaLabel='Đặt lại hướng văn bản về mặc định'
      />
      <RadioCardGroup
        ariaLabel='Chọn hướng trang'
        describedbyId='direction-description'
        value={dir}
        onChange={setDir}
        items={[
          {
            value: 'ltr',
            label: 'Trái sang phải',
            icon: (props: SVGProps<SVGSVGElement>) => (
              <IconDir dir='ltr' {...props} />
            ),
          },
          {
            value: 'rtl',
            label: 'Phải sang trái',
            icon: (props: SVGProps<SVGSVGElement>) => (
              <IconDir dir='rtl' {...props} />
            ),
          },
        ]}
      />
      <div id='direction-description' className='sr-only'>
        Chọn hướng trang từ trái sang phải hoặc phải sang trái
      </div>
    </div>
  )
}

export function ConfigDrawer() {
  const sidebarUI = useOptionalSidebarUI()
  const { resetDir } = useDirection()
  const { resetLayout } = useLayout()

  const handleReset = () => {
    sidebarUI.setCollapsed(false)
    resetDir()
    resetLayout()
  }

  return (
    <DialogTrigger>
      <ButtonUtility icon={Settings01} tooltip='Mở cài đặt giao diện' color='tertiary' />
      <ModalOverlay>
        <Modal className='w-full max-w-sm'>
          <Dialog aria-label='Cài đặt'>
            <div className='flex flex-col'>
              <div className='flex items-start justify-between gap-2 px-6 pt-6 pb-4'>
                <div className='flex flex-col gap-0.5'>
                  <h2 className='text-md font-semibold text-secondary'>Cài đặt</h2>
                  <p className='text-sm text-tertiary'>
                    Tùy chỉnh giao diện và bố cục theo ý bạn.
                  </p>
                </div>
                <CloseButton size='sm' label='Đóng' />
              </div>
              <div className='space-y-6 overflow-y-auto px-6 pb-4'>
                <SidebarConfig />
                <LayoutConfig />
                <DirConfig />
              </div>
              <div className='flex justify-end border-t border-secondary px-6 py-4'>
                <Button
                  color='primary-destructive'
                  aria-label='Đặt lại tất cả cài đặt về mặc định'
                  onClick={handleReset}
                >
                  Đặt lại
                </Button>
              </div>
            </div>
          </Dialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  )
}
