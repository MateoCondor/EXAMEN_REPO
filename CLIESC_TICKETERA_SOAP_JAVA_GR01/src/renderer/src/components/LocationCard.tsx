import { Location } from '@renderer/entities/Location'
import { applyTax, computeTax, formatMoney, LOCALE_TAX } from '@renderer/utils/money.api'

interface Props {
  data: Location
  variant?: 'primary' | 'secondary'
}

export function LocationCard({ data, variant = 'primary' }: Props) {
  return (
    <article className={`card card--${variant}`}>
      <header className="pb-2 border-b border-b-slate-600 flex flex-col gap-y-1">
        <h3 className="text-lg font-semibold">Localidad {data.code}</h3>
        <p className="text-muted">Disponibles: {data.availability}</p>
      </header>
      <ul className="pt-2">
        <li className="flex justify-between">
          <span className="text-muted text-sm">Precio base: </span>
          <span className="text-muted text-sm">{formatMoney(data.price)}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-muted text-sm">IVA ({LOCALE_TAX * 100}%) : </span>
          <span className="text-muted text-sm">{formatMoney(computeTax(data.price))}</span>
        </li>
        <li className="flex justify-between">
          <span className="font-semibold text-sm">Total: </span>
          <span className="text-sky-400 font-semibold text-sm">
            {formatMoney(applyTax(data.price))}
          </span>
        </li>
      </ul>
    </article>
  )
}
