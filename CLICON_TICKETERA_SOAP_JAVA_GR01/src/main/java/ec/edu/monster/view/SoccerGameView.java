package ec.edu.monster.view;

import ec.edu.monster.model.entity.SoccerGame;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

public class SoccerGameView {

    // Formateador amigable: "miércoles 10 de junio - 20:00"
    private final DateTimeFormatter formatter = DateTimeFormatter
            .ofPattern("eeee dd 'de' MMMM - HH:mm", Locale.of("es", "EC"));

    /**
     * Imprime de forma elegante una tabla con todos los partidos disponibles.
     */
    public void displayGames(List<SoccerGame> games) {
        if (games == null || games.isEmpty()) {
            System.out.println("\n⚠️ No hay partidos disponibles en este momento.");
            return;
        }

        System.out
                .println("\n=========================================================================================");
        System.out.println("                               ⚽ PARTIDOS DISPONIBLES ⚽                                ");
        System.out.println("=========================================================================================");
        // %-10s -> Alínea a la izquierda con 10 caracteres de ancho mínimo, etc.
        System.out.printf("| %-10s | %-20s | %-20s | %-12s | %-15s |\n", "CÓDIGO", "LOCAL", "VISITANTE", "LUGAR",
                "FECHA/HORA");
        System.out.println("-----------------------------------------------------------------------------------------");

        for (SoccerGame game : games) {
            String fechaFormateada = game.date().format(formatter);

            System.out.printf("| %-10s | %-20s | %-20s | %-12s | %-15s |\n",
                    game.code(),
                    game.homeTeam(),
                    game.visitingTeam(),
                    game.place(),
                    fechaFormateada);
        }
        System.out.println("=========================================================================================");
    }

    /**
     * Muestra un mensaje de error estilizado en caso de fallos del API Executor.
     */
    public void displayError(String mensaje) {
        System.out.println("\n❌ Error al cargar los partidos: " + mensaje);
    }
}