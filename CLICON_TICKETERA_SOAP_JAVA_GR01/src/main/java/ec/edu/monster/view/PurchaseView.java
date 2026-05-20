package ec.edu.monster.view;

import ec.edu.monster.model.entity.Purchase;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Scanner;

public class PurchaseView {
    private final Scanner scanner;
    private final DateTimeFormatter formatter = DateTimeFormatter
            .ofPattern("dd/MM/yyyy - HH:mm:ss", Locale.of("es", "EC"));

    public PurchaseView() {
        this.scanner = new Scanner(System.in);
    }

    public String requestString(String mensaje) {
        System.out.print(mensaje);
        return scanner.nextLine().trim();
    }

    public int requestAmount(String mensaje) {
        while (true) {
            System.out.print(mensaje);
            try {
                String entrada = scanner.nextLine().trim();
                int cantidad = Integer.parseInt(entrada);
                if (cantidad > 0)
                    return cantidad;
                System.out.println("⚠️ La cantidad debe ser mayor a 0.");
            } catch (NumberFormatException e) {
                System.out.println("⚠️ Por favor, ingrese un número entero válido.");
            }
        }
    }

    /**
     * Pregunta al usuario si desea seguir añadiendo localidades al carrito.
     */
    public boolean requestKeepAdding() {
        while (true) {
            System.out.print("➕ ¿Desea agregar otra localidad a esta compra? (s/n): ");
            String respuesta = scanner.nextLine().trim().toLowerCase();
            if (respuesta.equals("s"))
                return true;
            if (respuesta.equals("n"))
                return false;
            System.out.println("⚠️ Respuesta inválida. Ingrese 's' para sí o 'n' para no.");
        }
    }

    public void displayReceipt(Purchase purchase) {
        System.out.println("\n========================================");
        System.out.println("         🎟️ COMPRA COMPLETADA 🎟️         ");
        System.out.println("========================================");
        System.out.printf(" No. Factura : %d\n", purchase.invoiceId());
        System.out.printf(" Cédula/DNI  : %s\n", purchase.dni());
        System.out.printf(" Fecha       : %s\n", purchase.date().format(formatter));
        System.out.println("----------------------------------------");
        System.out.printf(" Subtotal    : $%.2f\n", purchase.subtotal());
        System.out.printf(" IVA (15%%)   : $%.2f\n", purchase.tax());
        System.out.printf(" TOTAL       : $%.2f\n", purchase.total());
        System.out.println("========================================");
        System.out.println("🎉 ¡Todos sus boletos se han reservado con éxito!");
    }

    public void displayError(String mensaje) {
        System.out.println("\n❌ Error al procesar la compra: " + mensaje);
    }
}