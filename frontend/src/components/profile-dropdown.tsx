import { User01 } from '@untitledui/icons'
import useDialogState from '@/hooks/use-dialog-state'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/base/buttons/button'
import { Dropdown } from '@/components/base/dropdown/dropdown'
import { SignOutDialog } from '@/components/sign-out-dialog'

export function ProfileDropdown() {
  const [open, setOpen] = useDialogState()
  const { auth } = useAuthStore()
  const user = auth.user

  return (
    <>
      <Dropdown.Root>
        <Button
          aria-label='Tài khoản'
          color='tertiary'
          size='sm'
          iconLeading={User01}
          className='rounded-full'
        />
        <Dropdown.Popover className='w-56'>
          <Dropdown.Menu aria-label='Tài khoản'>
            <Dropdown.Section>
              <Dropdown.SectionHeader className='px-2.5 py-2'>
                <div className='flex flex-col gap-1.5'>
                  <p className='text-sm font-medium text-secondary'>
                    {user?.name ?? '—'}
                  </p>
                  <p className='text-xs text-tertiary'>
                    {user?.email ?? '—'}
                  </p>
                </div>
              </Dropdown.SectionHeader>
              <Dropdown.Separator />
              <Dropdown.Item onAction={() => setOpen(true)} label='Đăng xuất' />
            </Dropdown.Section>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown.Root>

      <SignOutDialog open={!!open} onOpenChange={setOpen} />
    </>
  )
}
