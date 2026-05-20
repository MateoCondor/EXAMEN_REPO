package ec.edu.monster.model.mapper;

import ec.edu.monster.model.dto.LocationResponse;
import ec.edu.monster.model.entity.Location;

public class LocationMapper {
    public static Location toEntity(LocationResponse dto) {
        if (dto == null)
            return null;

        return new Location(
                dto.codigoLocalidad(),
                dto.disponibilidad(),
                dto.precio());
    }
}