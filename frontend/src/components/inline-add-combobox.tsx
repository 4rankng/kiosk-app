import { useState } from 'react'
import { Plus, Check, X } from 'lucide-react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface InlineAddComboboxProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  onCreate: (name: string) => Promise<string>
  placeholder?: string
  emptyMessage?: string
}

export function InlineAddCombobox({
  options,
  value,
  onChange,
  onCreate,
  placeholder = 'Chọn...',
  emptyMessage = 'Chưa có lựa chọn',
}: InlineAddComboboxProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  async function handleCreate() {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    setIsCreating(true)
    try {
      const newValue = await onCreate(trimmed)
      onChange(newValue)
      setIsAdding(false)
      setInputValue('')
    } finally {
      setIsCreating(false)
    }
  }

  if (isAdding) {
    return (
      <div className='flex items-center gap-1'>
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder='Nhập tên mới...'
          className='h-9'
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleCreate() }
            if (e.key === 'Escape') { setIsAdding(false); setInputValue('') }
          }}
        />
        <Button type='button' variant='ghost' size='icon' className='h-8 w-8 shrink-0' onClick={handleCreate} disabled={isCreating}>
          <Check className='h-4 w-4' />
        </Button>
        <Button type='button' variant='ghost' size='icon' className='h-8 w-8 shrink-0' onClick={() => { setIsAdding(false); setInputValue('') }}>
          <X className='h-4 w-4' />
        </Button>
      </div>
    )
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className='h-9 w-full'>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.length === 0 && (
          <div className='px-2 py-1.5 text-sm text-muted-foreground'>{emptyMessage}</div>
        )}
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
        <div
          className='flex cursor-pointer items-center px-2 py-1.5 text-sm text-primary hover:bg-accent'
          onClick={() => setIsAdding(true)}
        >
          <Plus className='mr-1 h-3 w-3' />
          Thêm mới...
        </div>
      </SelectContent>
    </Select>
  )
}
