package ec.edu.monster.model.dto;

import java.time.ZonedDateTime;

public record SoccerGameResponse(
        String codigo,
        String equipoLocal,
        String equipoVisita,
        ZonedDateTime fecha,
        String lugar) {
}