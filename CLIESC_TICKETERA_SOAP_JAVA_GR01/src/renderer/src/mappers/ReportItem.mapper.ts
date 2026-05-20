import { ReportItem } from '@renderer/entities/ReportItem'
import { Mapper, ReportItemResponse } from '@renderer/types'

export class ReportItemMapper implements Mapper<ReportItemResponse, ReportItem> {
  toEntity(dto: ReportItemResponse) {
    return new ReportItem(dto.codigoLocalidad, dto.cantidadVendida, dto.totalRecaudado)
  }
}
