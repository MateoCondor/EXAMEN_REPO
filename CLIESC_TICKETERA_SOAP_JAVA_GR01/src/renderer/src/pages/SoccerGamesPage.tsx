import { SoccerGameCard } from '@renderer/components/SoccerGameCard'
import { TitlePage } from '@renderer/components/TitlePage'
import { useSoccerGameList } from '@renderer/hooks/useSoccerGameList'

export function SoccerGamesPage() {
  const { data } = useSoccerGameList()

  return (
    <main className="main">
      <TitlePage
        title="Partidos disponibles"
        description="Revisa los partidos activos y usa el codigo para consultar localidades, comprar o generar
          reporte."
      />
      <section className="flex flex-col gap-y-4">
        {data?.map((data) => (
          <SoccerGameCard key={`${data.code}-card`} data={data} />
        ))}
      </section>
    </main>
  )
}
