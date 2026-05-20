package ec.edu.monster.model.dto;

public record InvoiceItemResponse(
        String codigoLocalidad,
        Integer cantidad,
        Double total) {
}