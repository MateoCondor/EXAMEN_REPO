package ec.edu.monster.model.entity;

import java.time.ZonedDateTime;

public record Purchase(
        Long invoiceId,
        String dni,
        ZonedDateTime date,
        Double subtotal,
        Double tax,
        Double total) {
}