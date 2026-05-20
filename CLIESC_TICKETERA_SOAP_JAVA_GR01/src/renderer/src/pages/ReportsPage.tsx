import { InvoiceCard } from '@renderer/components/InvoiceCard'
import { ReportCard } from '@renderer/components/ReportCard'
import { SoccerGameCard } from '@renderer/components/SoccerGameCard'
import { SoccerGameSelect } from '@renderer/components/SoccerGameSelect'
import { TitlePage } from '@renderer/components/TitlePage'
import { SoccerGame } from '@renderer/entities/SoccerGame'
import { useInvoiceList } from '@renderer/hooks/useInvoiceList'
import { useReport } from '@renderer/hooks/useReport'
import { useState } from 'react'

export function ReportsPage() {
  const [soccerGameSelected, setSoccerGameSelected] = useState<SoccerGame | null>(null)
  const { data: report, getBySoccerGame: getReport } = useReport()
  const { data: invoices, getBySoccerGame: getInvoices } = useInvoiceList()

  const handleSelectChange = (item: SoccerGame | null) => {
    setSoccerGameSelected(item)

    if (!item) return
    getReport(item.code)
    getInvoices(item.code)
  }

  return (
    <main className="main">
      <TitlePage
        title="Resumen de ventas"
        description="Genera un reporte por partido con ventas y recaudacion total."
      />
      <section className="card card--primary space-y-2">
        <h2 className="text-xl font-semibold">Buscar</h2>
        <SoccerGameSelect value={soccerGameSelected} onChange={handleSelectChange} />
      </section>
      {soccerGameSelected && (
        <section className="card card--primary space-y-2">
          <h2 className="text-xl font-semibold">Partido</h2>
          <SoccerGameCard variant="secondary" data={soccerGameSelected} />
        </section>
      )}
      {report && <ReportCard data={report} />}
      {invoices && (
        <section className="card card--primary space-y-2">
          <h2 className="text-xl font-semibold">Facturas</h2>
          {invoices.map((item) => (
            <InvoiceCard key={`${item.id}-invoice`} data={item} variant="secondary" />
          ))}
        </section>
      )}
    </main>
  )
}
