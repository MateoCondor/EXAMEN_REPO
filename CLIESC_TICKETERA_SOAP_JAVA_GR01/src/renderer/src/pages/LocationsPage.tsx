import { LocationCard } from '@renderer/components/LocationCard'
import { SoccerGameCard } from '@renderer/components/SoccerGameCard'
import { SoccerGameSelect } from '@renderer/components/SoccerGameSelect'
import { TitlePage } from '@renderer/components/TitlePage'
import { SoccerGame } from '@renderer/entities/SoccerGame'
import { useLocationList } from '@renderer/hooks/useLocationList'
import { useState } from 'react'

export function LocationsPage() {
  const [soccerGameSelected, setSoccerGameSelected] = useState<SoccerGame | null>(null)
  const { data, getBySoccerGame } = useLocationList()

  const handleSelectChange = (item: SoccerGame | null) => {
    setSoccerGameSelected(item)

    if (item) getBySoccerGame(item.code)
  }

  return (
    <main className="main">
      <TitlePage
        title="Localidades por partido"
        description="Selecciona un partido para ver disponibilidad y precio por localidad."
      />
      <section className="card card--primary space-y-2">
        <h2 className="text-xl font-semibold">Buscar</h2>
        <SoccerGameSelect value={soccerGameSelected} onChange={handleSelectChange} />
      </section>
      {soccerGameSelected && (
        <section className="card card--primary space-y-2">
          <h2 className="text-xl font-semibold">Partido</h2>
          <SoccerGameCard variant="secondary" data={soccerGameSelected} />
          <h2 className="text-xl font-semibold">Localidades</h2>
          <div className="space-y-2">
            {data?.map((item) => (
              <LocationCard key={`${item.code}-card`} data={item} variant="secondary" />
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
