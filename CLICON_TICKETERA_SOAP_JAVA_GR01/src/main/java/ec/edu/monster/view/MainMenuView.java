package ec.edu.monster.view;

import java.util.Scanner;

public class MainMenuView {
    private final Scanner scanner;

    public MainMenuView() {
        this.scanner = new Scanner(System.in);
    }

    /**
     * Pinta el menú principal en la consola y captura la opción elegida por el
     * usuario.
     * 
     * @return El número entero de la opción seleccionada.
     */
    public int showMenu() {
        System.out.println("\n========================================");
        System.out.println("             TICKET PREMIUM             ");
        System.out.println("========================================");
        System.out.println(" 1. ⚽ Ver Partidos");
        System.out.println(" 2. 🏟️ Ver Localidades");
        System.out.println(" 3. 🎫 Comprar Boletos");
        System.out.println(" 4. 📊 Reportes de Ventas");
        System.out.println(" 5. 🚪 Cerrar Sesión");
        System.out.println("========================================");
        System.out.print("👉 Seleccione una opción: ");

        return leerEntero();
    }

    /**
     * Utilidad para leer un entero de forma segura evitando que colapse la consola
     * si el usuario ingresa letras por error.
     */
    private int leerEntero() {
        while (true) {
            try {
                String entrada = scanner.nextLine().trim();
                return Integer.parseInt(entrada);
            } catch (NumberFormatException e) {
                System.out.print("⚠️ Opción inválida. Por favor, ingrese un número: ");
            }
        }
    }

    /**
     * Muestra un mensaje de despedida simple al cerrar sesión.
     */
    public void showGoodbyeMessage() {
        System.out.println("\n👋 Cerrando sesión en TicketPremium. ¡Hasta luego!");
    }

    /**
     * Muestra un mensaje genérico de error para opciones fuera del rango (1-5).
     */
    public void showInvalidOptionMessage() {
        System.out.println("❌ Opción no válida. Intente nuevamente dentro del rango del menú.");
    }
}