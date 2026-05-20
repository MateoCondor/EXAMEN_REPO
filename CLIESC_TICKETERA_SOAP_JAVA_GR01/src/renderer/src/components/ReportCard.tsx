import { Report } from '@renderer/entities/Report'
import { applyTax, formatMoney } from '@renderer/utils/money.api'

interface Props {
  data: Report
}

export function ReportCard({ data }: Props) {
  return (
    <article className="card card--primary space-y-2">
      <header>
        <h2 className="text-xl font-semibold">Resumen de ventas</h2>
      </header>

      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="py-2">Localidad</th>
            <th className="py-2">Vendidos</th>
            <th className="py-2">Total recaudado</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item) => (
            <tr key={`${item.locationCode}-row`}>
              <td className="py-2">{item.locationCode}</td>
              <td className="py-2">{item.tickets}</td>
              <td className="py-2">{formatMoney(applyTax(item.amount))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-t-slate-600">
            <th className="py-2" colSpan={2}>
              Total
            </th>
            <td className="py-2">{formatMoney(applyTax(data.total))}</td>
          </tr>
        </tfoot>
      </table>
    </article>
  )
}
