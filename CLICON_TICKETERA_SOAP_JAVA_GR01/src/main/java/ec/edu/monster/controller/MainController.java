package ec.edu.monster.controller;

import ec.edu.monster.view.MainMenuView;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class MainController {
    private final MainMenuView view;
    private boolean running = true;
    private final SoccerGameController soccerGameController;
    private final LocationController locationController;
    private final PurchaseController purchaseController;
    private final ReportController reportController;

    public void start() {
        while (running) {
            int opcion = view.showMenu();

            switch (opcion) {
                case 1 -> listarPartidos();
                case 2 -> verLocalidades();
                case 3 -> realizarCompra();
                case 4 -> mostrarReportes();
                case 5 -> {
                    view.showGoodbyeMessage();
                    running = false;
                }
                default -> view.showInvalidOptionMessage();
            }
        }
    }

    private void listarPartidos() {
        soccerGameController.listSoccerGames();
    }

    private void verLocalidades() {
        locationController.showLocationsByGame();
    }

    private void realizarCompra() {
        purchaseController.executePurchaseFlow();
    }

    private void mostrarReportes() {
        reportController.showReportsFlow();
    }
}