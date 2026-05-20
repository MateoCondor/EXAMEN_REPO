package ec.edu.monster.model.entity;

import java.time.ZonedDateTime;

public record SoccerGame(
        String code,
        String homeTeam,
        String visitingTeam,
        ZonedDateTime date,
        String place) {
}