package ec.edu.monster.controller;

import ec.edu.monster.model.client.LocationClient;
import ec.edu.monster.model.entity.Location;
import ec.edu.monster.model.exceptions.ApiException;
import ec.edu.monster.view.LocationView;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RequiredArgsConstructor
public class LocationController {
    private final LocationClient client;
    private final LocationView view;

    /**
     * Coordina el flujo para capturar el código de partido y listar sus
     * localidades.
     */
    public void showLocationsByGame() {
        // 1. Pedir el código del partido a través de la vista
        String gameCode = view.requestSoccerGameCode();

        if (gameCode.isEmpty()) {
            view.displayError("El código del partido no puede estar vacío.");
            return;
        }

        try {
            // 2. Consultar al cliente (capa de datos)
            List<Location> locations = client.getBySoccerGame(gameCode);

            // 3. Enviar los resultados a la vista
            view.displayLocations(gameCode, locations);

        } catch (ApiException e) {
            // Captura los errores dinámicos de tu JSON de error
            view.displayError(e.getMessage());
        } catch (Exception e) {
            view.displayError("Ocurrió un problema inesperado al buscar las localidades.");
        }
    }
}