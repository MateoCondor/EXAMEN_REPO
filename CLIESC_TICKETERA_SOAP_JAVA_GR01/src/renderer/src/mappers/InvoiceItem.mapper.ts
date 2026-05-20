import { InvoiceItem } from '@renderer/entities/InvoiceItem'
import { InvoiceItemResponse, Mapper } from '@renderer/types'

export class InvoiceItemMapper implements Mapper<InvoiceItemResponse, InvoiceItem> {
  toEntity(dto: InvoiceItemResponse) {
    return new InvoiceItem(dto.codigoLocalidad, dto.cantidad, dto.total)
  }
}
