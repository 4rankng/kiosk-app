export const statusOptions = [
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Đang xử lý', value: 'pending' },
  { label: 'Đã hủy', value: 'cancelled' },
]

export const statusColorMap: Record<string, string> = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
}
