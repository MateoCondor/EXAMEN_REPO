package ec.edu.monster.model.entity;

public record ReportItem(
        String locationCode,
        Integer tickets,
        Double amount) {
}