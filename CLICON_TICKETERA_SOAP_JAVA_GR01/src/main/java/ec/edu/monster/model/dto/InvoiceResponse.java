package ec.edu.monster.model.dto;

import java.time.ZonedDateTime;
import java.util.List;

public record InvoiceResponse(
        Long idFactura,
        ZonedDateTime fecha,
        Double total,
        String cedula,
        List<InvoiceItemResponse> lineas) {
}