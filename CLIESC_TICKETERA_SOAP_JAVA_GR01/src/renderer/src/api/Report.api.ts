import { api } from './api'
import { InvoiceResponse, ReportItemResponse } from '@renderer/types'

export class ReportApi {
  private static readonly endpoint = '/reporte'

  static getReportBySoccerGame(code: string) {
    return api.get<ReportItemResponse[]>(`${this.endpoint}/${code}`)
  }

  static getInvoicesBySoccerGame(code: string) {
    return api.get<InvoiceResponse[]>(`${this.endpoint}/${code}/facturas`)
  }
}
