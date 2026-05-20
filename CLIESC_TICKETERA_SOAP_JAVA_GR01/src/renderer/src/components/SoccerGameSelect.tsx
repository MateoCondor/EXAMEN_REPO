import { SoccerGame } from '@renderer/entities/SoccerGame'
import { useSoccerGameList } from '@renderer/hooks/useSoccerGameList'

interface Props {
  value?: SoccerGame | null
  onChange?: (data: SoccerGame | null) => Promise<void> | void
}

export function SoccerGameSelect({ value, onChange }: Props) {
  const { data } = useSoccerGameList()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = data?.find((item) => item.code === e.target.value)
    onChange?.(selected ?? null)
  }

  return (
    <select
      className="select select--primary"
      id="soccer-game-select"
      onChange={handleChange}
      value={value?.code ?? ''}
    >
      <option value="">Seleccionar un partido</option>
      {data?.map((item) => (
        <option key={`${item.code}-option`} value={item.code}>
          {item.homeTeam} vs {item.visitingTeam}
        </option>
      ))}
    </select>
  )
}
