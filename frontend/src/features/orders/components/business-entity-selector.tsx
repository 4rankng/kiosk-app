import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getBusinessEntities } from '@/services/business-entities'
import { RadioGroup, Radio } from 'react-aria-components'
import { cx } from '@/utils/cx'

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
      <p className='text-xs font-semibold uppercase tracking-wider text-tertiary'>
        Cơ sở xuất phiếu in:
      </p>
      <RadioGroup
        value={selected}
        onChange={onSelect}
        aria-label='Cơ sở xuất phiếu in'
        className='flex flex-wrap gap-2'
      >
        {entities.map((entity) => (
          <Radio
            key={entity.id}
            value={entity.id}
            className={(state) =>
              cx(
                'flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors outline-brand focus-visible:outline-2 focus-visible:outline-offset-2',
                state.isSelected
                  ? 'border-brand bg-brand-secondary/50 text-brand-secondary'
                  : 'border-secondary bg-primary text-secondary hover:bg-secondary'
              )
            }
          >
            {({ isSelected }) => (
              <>
                <span
                  className={cx(
                    'size-2 rounded-full',
                    isSelected ? 'bg-brand-solid' : 'bg-quaternary'
                  )}
                />
                <span>Cơ sở {entity.name.replace('Hộ kinh doanh ', '')}</span>
              </>
            )}
          </Radio>
        ))}
      </RadioGroup>
    </div>
  )
}
