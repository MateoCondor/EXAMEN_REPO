package ec.edu.monster;

import ec.edu.monster.controller.LocationController;
import ec.edu.monster.controller.LoginController;
import ec.edu.monster.controller.MainController;
import ec.edu.monster.controller.PurchaseController;
import ec.edu.monster.controller.ReportController;
import ec.edu.monster.controller.SoccerGameController;
import ec.edu.monster.model.client.ApiClient;
import ec.edu.monster.model.client.AuthClient;
import ec.edu.monster.model.client.LocationClient;
import ec.edu.monster.model.client.PurchaseClient;
import ec.edu.monster.model.client.ReportClient;
import ec.edu.monster.model.client.SoccerGameClient;
import ec.edu.monster.model.dto.LoginResponse;
import ec.edu.monster.model.service.LocationService;
import ec.edu.monster.model.service.PurchaseService;
import ec.edu.monster.model.service.ReportService;
import ec.edu.monster.model.service.SoccerGameService;
import ec.edu.monster.view.LocationView;
import ec.edu.monster.view.LoginView;
import ec.edu.monster.view.MainMenuView;
import ec.edu.monster.view.PurchaseView;
import ec.edu.monster.view.ReportView;
import ec.edu.monster.view.SoccerGameView;

public class App {

    public static void main(String[] args) {
        LoginController loginController = new LoginController(new LoginView(), new AuthClient());

        LoginResponse response = loginController.run();

        if (response == null) {
            return;
        }

        SoccerGameService soccerGameService = ApiClient.getInstance().getApi().create(SoccerGameService.class);
        SoccerGameClient soccerGameClient = new SoccerGameClient(soccerGameService);
        SoccerGameView soccerGameView = new SoccerGameView();
        SoccerGameController soccerGameController = new SoccerGameController(soccerGameClient, soccerGameView);

        LocationService locationService = ApiClient.getInstance().getApi().create(LocationService.class);
        LocationClient locationClient = new LocationClient(locationService);
        LocationView locationView = new LocationView();
        LocationController locationController = new LocationController(locationClient, locationView);

        PurchaseService purchaseService = ApiClient.getInstance().getApi().create(PurchaseService.class);
        PurchaseClient purchaseClient = new PurchaseClient(purchaseService);
        PurchaseView purchaseView = new PurchaseView();
        PurchaseController purchaseController = new PurchaseController(purchaseClient, purchaseView);

        ReportService reportService = ApiClient.getInstance().getApi().create(ReportService.class);
        ReportClient reportClient = new ReportClient(reportService);
        ReportView reportView = new ReportView();
        ReportController reportController = new ReportController(reportClient, reportView);

        MainMenuView mainView = new MainMenuView();
        MainController mainController = new MainController(mainView, soccerGameController, locationController,
                purchaseController, reportController);

        mainController.start();

        ApiClient.getInstance().shutdown();

        System.exit(0);
    }
}
