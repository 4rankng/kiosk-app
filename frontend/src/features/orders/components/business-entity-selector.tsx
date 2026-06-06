import { useQuery } from '@tanstack/react-query'
import { getBusinessEntities } from '@/services/business-entities'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface BusinessEntitySelectorProps {
  selected: string
  onSelect: (id: string) => void
}

export function BusinessEntitySelector({ selected, onSelect }: BusinessEntitySelectorProps) {
  const { data: entities = [] } = useQuery({
    queryKey: ['business-entities'],
    queryFn: getBusinessEntities,
  })

  return (
    <div className='space-y-2'>
      <p className='text-sm font-medium'>Lựa chọn Cơ sở xuất phiếu in:</p>
      <RadioGroup value={selected} onValueChange={onSelect}>
        {entities.map((entity) => (
          <div key={entity.id} className='flex items-center space-x-2'>
            <RadioGroupItem value={entity.id} id={entity.id} />
            <Label htmlFor={entity.id} className='cursor-pointer'>
              Cơ sở {entity.name.replace('Hộ kinh doanh ', '')}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
