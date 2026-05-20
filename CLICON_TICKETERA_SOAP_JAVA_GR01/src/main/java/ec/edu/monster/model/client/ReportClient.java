package ec.edu.monster.model.client;

import ec.edu.monster.model.dto.InvoiceResponse;
import ec.edu.monster.model.dto.ReportItemResponse;
import ec.edu.monster.model.entity.Invoice;
import ec.edu.monster.model.entity.Report;
import ec.edu.monster.model.mapper.InvoiceMapper;
import ec.edu.monster.model.mapper.ReportMapper;
import ec.edu.monster.model.service.ReportService;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class ReportClient {
    private final ReportService service;

    public Report getReportBySoccerGame(String code) {
        List<ReportItemResponse> dtos = ApiExecutor.execute(
                service.getReportBySoccerGame(code),
                Map.of(404, "No existe reporte para el partido especificado"));
        // El ReportMapper se encarga de transformar la lista e internamente armar la
        // entidad Report que calcula el total
        return ReportMapper.toEntity(dtos);
    }

    public List<Invoice> getInvoicesBySoccerGame(String code) {
        List<InvoiceResponse> dtos = ApiExecutor.execute(
                service.getInvoicesBySoccerGame(code),
                Map.of(404, "No se encontraron facturas para el partido especificado"));

        return dtos.stream()
                .map(InvoiceMapper::toEntity)
                .collect(Collectors.toList());
    }
}