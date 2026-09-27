import { Button } from '@/components/base/buttons/button'

interface MutateDialogHeaderProps {
  titleId: string
  title: string
  description: string
}

/**
 * Title + description block shared by the customer/company mutate dialogs.
 */
export function MutateDialogHeader({ titleId, title, description }: MutateDialogHeaderProps) {
  return (
    <div className='flex flex-col gap-1 text-start'>
      <h2 id={titleId} className='text-md font-semibold text-primary'>
        {title}
      </h2>
      <p className='text-sm text-tertiary'>
        {description}
      </p>
    </div>
  )
}

interface MutateDialogFooterProps {
  onCancel: () => void
  isPending: boolean
  isEdit: boolean
}

/**
 * Cancel/submit buttons shared by the customer/company mutate dialogs.
 */
export function MutateDialogFooter({ onCancel, isPending, isEdit }: MutateDialogFooterProps) {
  return (
    <div className='flex flex-col-reverse gap-x-2 gap-y-2 border-t border-secondary pt-4 sm:flex-row sm:justify-end'>
      <Button color='secondary' type='button' onPress={onCancel}>Hủy bỏ</Button>
      <Button
        type='submit'
        isLoading={isPending}
        showTextWhileLoading
      >
        {isPending ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
      </Button>
    </div>
  )
}
