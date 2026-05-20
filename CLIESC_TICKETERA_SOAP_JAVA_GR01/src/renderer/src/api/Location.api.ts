import { LocationResponse } from '@renderer/types'
import { api } from './api'

export class LocationApi {
  private static readonly endpoint = '/localidades'

  static getBySoccerGame(code: string) {
    return api.get<LocationResponse[]>(`${this.endpoint}/${code}`)
  }
}
