package ec.edu.monster.model.dto;

public record ReportItemResponse(
        String codigoLocalidad,
        Integer cantidadVendida,
        Double totalRecaudado) {
}