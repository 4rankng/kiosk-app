import { useId } from 'react'
import { ModalOverlay, Modal, Dialog } from '@/components/application/modals/modal'
import { Button } from '@/components/base/buttons/button'
import { cx } from '@/utils/cx'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: React.ReactNode
  disabled?: boolean
  desc: React.JSX.Element | string
  cancelBtnText?: string
  confirmText?: React.ReactNode
  destructive?: boolean
  isLoading?: boolean
  className?: string
  children?: React.ReactNode
} & (
  | { form: string; handleConfirm?: undefined }
  | { form?: undefined; handleConfirm: () => void }
)

export function ConfirmDialog(props: ConfirmDialogProps) {
  const {
    open,
    onOpenChange,
    title,
    desc,
    children,
    className,
    confirmText,
    cancelBtnText,
    destructive = false,
    isLoading,
    disabled = false,
    form,
    handleConfirm,
  } = props
  const titleId = useId()

  return (
    <ModalOverlay isOpen={open} onOpenChange={onOpenChange} isDismissable={false}>
      <Modal className={cx('w-full max-w-md', className)}>
        <Dialog aria-labelledby={titleId}>
          {({ close }) => (
            <div className='flex flex-col gap-5 p-5 sm:p-6'>
              <div className='flex flex-col gap-1 text-start'>
                <h2 id={titleId} className='text-md font-semibold text-primary'>
                  {title}
                </h2>
                <div className='text-sm text-tertiary'>{desc}</div>
              </div>
              {children}
              <div className='flex flex-col-reverse gap-x-2 gap-y-2 sm:flex-row sm:justify-end'>
                <Button color='secondary' onPress={close} isDisabled={isLoading}>
                  {cancelBtnText ?? 'Hủy'}
                </Button>
                <Button
                  type={form ? 'submit' : 'button'}
                  form={form}
                  onPress={handleConfirm}
                  color={destructive ? 'primary-destructive' : 'primary'}
                  isDisabled={disabled || isLoading}
                  isLoading={isLoading}
                >
                  {confirmText ?? 'Tiếp tục'}
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  )
}
