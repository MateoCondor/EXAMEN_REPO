package ec.edu.monster.model.entity;

import java.time.ZonedDateTime;
import java.util.List;

public record Invoice(
        Long id,
        ZonedDateTime date,
        String dni,
        Double total,
        List<InvoiceItem> items) {
}