package ec.edu.monster.model.dto;

import java.time.ZonedDateTime;

public record PurchaseResponse(
        Long idFactura,
        ZonedDateTime fecha,
        Double subtotal,
        Double iva,
        Double total,
        String cedula) {
}