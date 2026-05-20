package ec.edu.monster.controller;

import ec.edu.monster.model.client.ReportClient;
import ec.edu.monster.model.entity.Invoice;
import ec.edu.monster.model.entity.Report;
import ec.edu.monster.model.exceptions.ApiException;
import ec.edu.monster.view.ReportView;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class ReportController {
    private final ReportClient client;
    private final ReportView view;

    /**
     * Solicita el código de partido y despliega de manera secuencial
     * el reporte financiero y el histórico de facturas.
     */
    public void showReportsFlow() {
        String gameCode = view.requestSoccerGameCode();

        if (gameCode.isEmpty()) {
            view.displayError("El código del partido es obligatorio para emitir reportes.");
            return;
        }

        try {
            // 1. Obtener y mostrar reporte agrupado por localidad (Suma calculada
            // dinámicamente)
            Report report = client.getReportBySoccerGame(gameCode);
            view.displayGeneralReport(gameCode, report);

            // 2. Obtener y mostrar el listado analítico de facturas detalladas
            List<Invoice> invoices = client.getInvoicesBySoccerGame(gameCode);
            view.displayInvoices(invoices);

        } catch (ApiException e) {
            // Atrapa el JSON de error enviado por tu API de forma prolija
            view.displayError(e.getMessage());
        } catch (Exception e) {
            view.displayError("Ocurrió un error inesperado al procesar los datos estadísticos.");
        }
    }
}