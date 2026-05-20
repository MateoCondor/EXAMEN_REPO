package ec.edu.monster.model.entity;

public record InvoiceItem(
        String locationCode,
        Integer quantity,
        Double total) {
}