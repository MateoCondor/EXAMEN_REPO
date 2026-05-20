package ec.edu.monster.controller;

import ec.edu.monster.model.client.SoccerGameClient;
import ec.edu.monster.model.entity.SoccerGame;
import ec.edu.monster.model.exceptions.ApiException;
import ec.edu.monster.view.SoccerGameView;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class SoccerGameController {
    private final SoccerGameClient client;
    private final SoccerGameView view;

    /**
     * Coordina la obtención de datos desde el cliente y su posterior renderizado en
     * la vista.
     */
    public void listSoccerGames() {
        try {
            // 1. Llamada a la fachada de datos (Client) que ya devuelve Entities parseadas
            List<SoccerGame> games = client.getAll();

            // 2. Pasar los datos a la vista para ser mostrados
            view.displayGames(games);

        } catch (ApiException e) {
            // Captura los errores mapeados dinámicamente desde el JSON de tu API
            view.displayError(e.getMessage());
        } catch (Exception e) {
            // Fallback para cualquier otro error inesperado del sistema
            view.displayError("Ocurrió un problema inesperado en el sistema.");
        }
    }
}