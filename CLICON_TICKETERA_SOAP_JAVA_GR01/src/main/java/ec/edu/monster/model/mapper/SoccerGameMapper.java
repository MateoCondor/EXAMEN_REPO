package ec.edu.monster.model.mapper;

import ec.edu.monster.model.dto.SoccerGameResponse;
import ec.edu.monster.model.entity.SoccerGame;

public class SoccerGameMapper {
    public static SoccerGame toEntity(SoccerGameResponse dto) {
        if (dto == null)
            return null;

        return new SoccerGame(
                dto.codigo(),
                dto.equipoLocal(),
                dto.equipoVisita(),
                dto.fecha(), // ZonedDateTime mapeado automáticamente por Gson
                dto.lugar());
    }
}