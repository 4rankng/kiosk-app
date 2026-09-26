import { useMemo, useState } from 'react'
import { Check, X } from '@untitledui/icons'
import { Button } from '@/components/base/buttons/button'
import { InputBase } from '@/components/base/input/input'
import { ComboBox } from '@/components/base/select/combobox'
import { SelectItem } from '@/components/base/select/select-item'
import type { SelectItemType } from '@/components/base/select/select-shared'

interface InlineAddComboboxProps {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  onCreate: (name: string) => Promise<string>
  placeholder?: string
  emptyMessage?: string
}

/** Pseudo-item id for the "create new" action row inside the dropdown. */
const CREATE_ITEM_ID = '__create__'

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
  const [filterText, setFilterText] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const comboItems: SelectItemType[] = useMemo(
    () => [
      ...options.map((opt) => ({ id: opt.value, label: opt.label })),
      ...(options.length === 0
        ? [{ id: '__empty__', label: emptyMessage, isDisabled: true } satisfies SelectItemType]
        : []),
      { id: CREATE_ITEM_ID, label: 'Thêm mới...' },
    ],
    [options, emptyMessage]
  )

  const filteredItems = useMemo(
    () =>
      filterText
        ? comboItems.filter((item) => item.label?.toLowerCase().includes(filterText.toLowerCase()))
        : comboItems
    , [comboItems, filterText]
  )

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
        <InputBase
          size='sm'
          autoFocus
          wrapperClassName='h-9'
          placeholder='Nhập tên mới...'
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); handleCreate() }
            if (e.key === 'Escape') { setIsAdding(false); setInputValue('') }
          }}
        />
        <Button
          color='tertiary'
          iconLeading={Check}
          className='size-9 shrink-0'
          aria-label='Xác nhận thêm mới'
          onPress={handleCreate}
          isDisabled={isCreating}
        />
        <Button
          color='tertiary'
          iconLeading={X}
          className='size-9 shrink-0'
          aria-label='Hủy bỏ'
          onPress={() => { setIsAdding(false); setInputValue('') }}
        />
      </div>
    )
  }

  return (
    <ComboBox
      size='sm'
      shortcut={false}
      placeholder={placeholder}
      aria-label={placeholder}
      items={filteredItems}
      selectedKey={value || null}
      onSelectionChange={(key) => {
        if (key === null) return
        if (key === CREATE_ITEM_ID) {
          setIsAdding(true)
          setFilterText('')
          return
        }
        onChange(String(key))
      }}
      onInputChange={setFilterText}
    >
      {(item) =>
        item.id === CREATE_ITEM_ID ? (
          <SelectItem id={item.id} onAction={() => setIsAdding(true)}>
            {item.label}
          </SelectItem>
        ) : (
          <SelectItem id={item.id}>{item.label}</SelectItem>
        )
      }
    </ComboBox>
  )
}
