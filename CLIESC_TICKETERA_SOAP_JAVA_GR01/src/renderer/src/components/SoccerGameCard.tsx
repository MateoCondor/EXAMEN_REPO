import { SoccerGame } from '@renderer/entities/SoccerGame'

interface Props {
  data: SoccerGame
  variant?: 'primary' | 'secondary'
}

export function SoccerGameCard({ data, variant = 'primary' }: Props) {
  return (
    <article className={`card card--${variant} flex flex-col gap-y-2`}>
      <header className="flex justify-between">
        <h3 className="font-semibold text-lg">
          {data.homeTeam} vs {data.visitingTeam}
        </h3>
        <span className={`badge bagde--${variant === 'primary' ? 'secondary' : 'primary'}`}>
          #{data.code}
        </span>
      </header>
      <p className="text-muted text-sm">{data.date.toLocaleDateString()}</p>
      <p className="text-muted text-sm">{data.place}</p>
    </article>
  )
}
