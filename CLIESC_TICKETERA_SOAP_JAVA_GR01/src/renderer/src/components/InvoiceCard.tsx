import { Invoice } from '@renderer/entities/Invoice'
import { applyTax, formatMoney } from '@renderer/utils/money.api'

interface Props {
  data: Invoice
  variant?: 'primary' | 'secondary'
}

export function InvoiceCard({ data, variant = 'primary' }: Props) {
  return (
    <article className={`card card--${variant}`}>
      <header className="pb-2 border-b border-b-slate-600 ">
        <h3 className="text-sm font-semibold">Factura #{data.id}</h3>
        <p className="text-xs text-muted">Fecha: {data.date.toLocaleDateString()}</p>
        <p className="text-xs text-muted">Cédula: {data.dni}</p>
      </header>
      <footer className="pt-2">
        {data.items.map((item) => (
          <p className="flex justify-between" key={`${item.locationCode}-invoice-item`}>
            <span className="text-muted text-xs">
              {item.quantity}x {item.locationCode}
            </span>
            <span className="text-muted text-xs">{formatMoney(applyTax(item.total))}</span>
          </p>
        ))}
        <p className="text-right">
          <span className="text-xs text-sky-400">{formatMoney(data.total)}</span>
        </p>
      </footer>
    </article>
  )
}
