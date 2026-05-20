import { Purchase } from '@renderer/entities/Purchase'
import { Mapper, PurchaseResponse } from '@renderer/types'

export class PurchaseMapper implements Mapper<PurchaseResponse, Purchase> {
  toEntity(dto: PurchaseResponse) {
    return new Purchase(
      dto.idFactura,
      dto.cedula,
      new Date(dto.fecha.replace(/\[.*\]$/, '')),
      dto.subtotal,
      dto.iva,
      dto.total
    )
  }
}
