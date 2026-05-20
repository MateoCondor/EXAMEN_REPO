import { PurchaseRequest, PurchaseResponse } from '@renderer/types'
import { api } from './api'

export class PurchaseApi {
  private static readonly endpoint = 'comprar'

  static create(dto: PurchaseRequest) {
    return api.post<PurchaseResponse>(`${this.endpoint}`, dto)
  }
}
