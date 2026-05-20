package ec.edu.monster.view;

import ec.edu.monster.model.entity.Location;
import ec.edu.monster.util.MoneyUtil;

import java.util.List;
import java.util.Scanner;

public class LocationView {
    private final Scanner scanner;

    public LocationView() {
        this.scanner = new Scanner(System.in);
    }

    /**
     * Solicita al usuario que ingrese el código del partido que desea consultar.
     */
    public String requestSoccerGameCode() {
        System.out.print("\n🔍 Ingrese el CÓDIGO del partido para consultar localidades: ");
        return scanner.nextLine().trim();
    }

    /**
     * Muestra las localidades disponibles en formato tabular.
     */
    public void displayLocations(String gameCode, List<Location> locations) {
        if (locations == null || locations.isEmpty()) {
            System.out.println("\n⚠️ No se encontraron localidades disponibles para el partido: " + gameCode);
            return;
        }

        System.out.println("\n==================================================");
        System.out.println("      🏟️ LOCALIDADES PARA EL PARTIDO: " + gameCode);
        System.out.println("==================================================");
        System.out.printf("| %-20s | %-10s | %-10s |\n", "LOCALIDAD", "DISPONIB.", "PRECIO");
        System.out.println("--------------------------------------------------");

        for (Location loc : locations) {
            System.out.printf("| %-20s | %-10d | $%-9.2f |\n",
                    loc.code(),
                    loc.availability(),
                    MoneyUtil.applyTax(loc.price()));
        }
        System.out.println("==================================================");
    }

    public void displayError(String mensaje) {
        System.out.println("\n❌ Error al cargar localidades: " + mensaje);
    }
}