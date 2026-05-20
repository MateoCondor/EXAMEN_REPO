package ec.edu.monster.view;

import ec.edu.monster.model.entity.Invoice;
import ec.edu.monster.model.entity.InvoiceItem;
import ec.edu.monster.model.entity.Report;
import ec.edu.monster.model.entity.ReportItem;
import ec.edu.monster.util.MoneyUtil;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Scanner;

public class ReportView {
    private final Scanner scanner;
    private final DateTimeFormatter formatter = DateTimeFormatter
            .ofPattern("dd/MM/yyyy HH:mm", Locale.of("es", "EC"));

    public ReportView() {
        this.scanner = new Scanner(System.in);
    }

    public String requestSoccerGameCode() {
        System.out.print("\n📊 Ingrese el CÓDIGO del partido para generar los reportes: ");
        return scanner.nextLine().trim();
    }

    /**
     * Muestra el reporte consolidado de recaudación por localidades.
     */
    public void displayGeneralReport(String gameCode, Report report) {
        System.out.println("\n==================================================");
        System.out.println("      📈 RECAUDACIÓN POR LOCALIDAD: " + gameCode);
        System.out.println("==================================================");
        System.out.printf("| %-20s | %-10s | %-10s |\n", "LOCALIDAD", "BOLETOS v.", "TOTAL RECAUD.");
        System.out.println("--------------------------------------------------");

        for (ReportItem item : report.getItems()) {
            System.out.printf("| %-20s | %-10d | $%-9.2f |\n",
                    item.locationCode(),
                    item.tickets(),
                    MoneyUtil.applyTax(item.amount()));
        }
        System.out.println("--------------------------------------------------");
        System.out.printf("  💰 RECAUDACIÓN TOTAL DEL PARTIDO: $%.2f\n", MoneyUtil.applyTax(report.getTotal()));
        System.out.println("==================================================");
    }

    /**
     * Muestra el listado histórico de todas las facturas emitidas para el partido.
     */
    public void displayInvoices(List<Invoice> invoices) {
        System.out.println("\n==================================================");
        System.out.println("         🧾 HISTORIAL DE FACTURAS EMITIDAS        ");
        System.out.println("==================================================");

        if (invoices == null || invoices.isEmpty()) {
            System.out.println(" No se registran facturas emitidas para este partido.");
            System.out.println("==================================================");
            return;
        }

        for (Invoice inv : invoices) {
            System.out.printf(" 📄 Factura ID: %-5d | Cédula: %-10s | Fecha: %s\n",
                    inv.id(), inv.dni(), inv.date().format(formatter));
            System.out.println("   --------------------------------------------");
            System.out.printf("   | %-15s | %-10s | %-10s |\n", "LOCALIDAD", "CANTIDAD", "SUBTOTAL");
            System.out.println("   --------------------------------------------");

            for (InvoiceItem item : inv.items()) {
                System.out.printf("   | %-15s | %-10d | $%-9.2f |\n",
                        item.locationCode(), item.quantity(), item.total());
            }
            System.out.printf("   [ Total Facturado: $%.2f ]\n", inv.total());
            System.out.println("==================================================");
        }
    }

    public void displayError(String mensaje) {
        System.out.println("\n❌ Error en el módulo de reportes: " + mensaje);
    }
}