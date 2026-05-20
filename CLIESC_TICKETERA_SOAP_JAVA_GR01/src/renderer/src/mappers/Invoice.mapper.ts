import { Invoice } from '@renderer/entities/Invoice'
import { InvoiceResponse, Mapper } from '@renderer/types'
import { InvoiceItemMapper } from './InvoiceItem.mapper'

export class InvoiceMapper implements Mapper<InvoiceResponse, Invoice> {
  toEntity(dto: InvoiceResponse) {
    const itemMapper = new InvoiceItemMapper()
    const items = dto.lineas.map(itemMapper.toEntity)

    return new Invoice(
      dto.idFactura,
      new Date(dto.fecha.replace(/\[.*\]$/, '')),
      dto.cedula,
      dto.total,
      items
    )
  }
}
