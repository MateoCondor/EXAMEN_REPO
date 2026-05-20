package ec.edu.monster.model.dto;

public record LocationResponse(
        String codigoLocalidad,
        Integer disponibilidad,
        Double precio) {
}