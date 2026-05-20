package ec.edu.monster.model.mapper;

import java.util.List;
import java.util.stream.Collectors;

import ec.edu.monster.model.dto.ReportItemResponse;
import ec.edu.monster.model.entity.Report;
import ec.edu.monster.model.entity.ReportItem;

public class ReportMapper {

    public static ReportItem toItemEntity(ReportItemResponse dto) {
        if (dto == null)
            return null;

        return new ReportItem(
                dto.codigoLocalidad(),
                dto.cantidadVendida(),
                dto.totalRecaudado());
    }

    public static Report toEntity(List<ReportItemResponse> dtoList) {
        if (dtoList == null)
            return new Report(List.of());

        List<ReportItem> items = dtoList.stream()
                .map(ReportMapper::toItemEntity)
                .collect(Collectors.toList());

        return new Report(items);
    }
}