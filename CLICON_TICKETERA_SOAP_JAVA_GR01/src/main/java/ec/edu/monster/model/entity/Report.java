package ec.edu.monster.model.entity;

import java.util.List;

import lombok.Getter;

@Getter
public class Report {
    private final List<ReportItem> items;
    private final Double total;

    public Report(List<ReportItem> items) {
        this.items = items;
        this.total = items.stream()
                .mapToDouble(ReportItem::amount)
                .sum();
    }
}