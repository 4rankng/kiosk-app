export const statusOptions = [
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đang xử lý', value: 'pending' },
  { label: 'Đã hủy', value: 'cancelled' },
]

export const statusColorMap: Record<string, string> = {
  completed: '',
  pending: '',
  cancelled: 'text-destructive',
}
