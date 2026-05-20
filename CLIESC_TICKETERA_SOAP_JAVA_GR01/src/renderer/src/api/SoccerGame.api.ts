import { SoccerGameResponse } from '@renderer/types'
import { api } from './api'

export class SoccerGameApi {
  private static readonly endpoint = '/partidos'

  static getAll() {
    return api.get<SoccerGameResponse[]>(`${this.endpoint}`)
  }
}
