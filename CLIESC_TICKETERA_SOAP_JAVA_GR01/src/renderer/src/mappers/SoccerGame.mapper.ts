import { SoccerGame } from '@renderer/entities/SoccerGame'
import { Mapper, SoccerGameResponse } from '@renderer/types'

export class SoccerGameMapper implements Mapper<SoccerGameResponse, SoccerGame> {
  toEntity(dto: SoccerGameResponse) {
    return new SoccerGame(
      dto.codigo,
      dto.equipoLocal,
      dto.equipoVisita,
      new Date(dto.fecha.replace(/\[.*\]$/, '')),
      dto.lugar
    )
  }
}
