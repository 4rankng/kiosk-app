import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getBusinessEntities } from '@/services/business-entities'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface BusinessEntitySelectorProps {
  selected: string
  onSelect: (id: string) => void
}

export function BusinessEntitySelector({ selected, onSelect }: BusinessEntitySelectorProps) {
  const { data: entities = [] } = useQuery({
    queryKey: ['business-entities'],
    queryFn: getBusinessEntities,
  })

  // Auto-select first entity if none is selected
  useEffect(() => {
    if (!selected && entities.length > 0) {
      onSelect(entities[0].id)
    }
  }, [selected, entities, onSelect])

  return (
    <div className='space-y-2 pt-2'>
      <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
        Cơ sở xuất phiếu in:
      </p>
      <RadioGroup value={selected} onValueChange={onSelect} className='flex flex-wrap gap-2'>
        {entities.map((entity) => {
          const isSelected = selected === entity.id
          return (
            <label
              key={entity.id}
              htmlFor={entity.id}
              className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-background hover:bg-muted/50 text-foreground'
              }`}
            >
              <RadioGroupItem value={entity.id} id={entity.id} className='sr-only' />
              <span className={`h-2 w-2 rounded-full ${isSelected ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
              <span>Cơ sở {entity.name.replace('Hộ kinh doanh ', '')}</span>
            </label>
          )
        })}
      </RadioGroup>
    </div>
  )
}
