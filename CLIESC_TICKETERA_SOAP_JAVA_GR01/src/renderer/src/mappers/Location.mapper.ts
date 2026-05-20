import { Location } from '@renderer/entities/Location'
import { LocationResponse, Mapper } from '@renderer/types'

export class LocationMapper implements Mapper<LocationResponse, Location> {
  toEntity(dto: LocationResponse) {
    return new Location(dto.codigoLocalidad, dto.disponibilidad, dto.precio)
  }
}
