package ec.edu.monster.controller;

import ec.edu.monster.model.client.AuthClient;
import ec.edu.monster.model.dto.LoginResponse;
import ec.edu.monster.model.exceptions.ApiException;
import ec.edu.monster.view.LoginView;
import ec.edu.monster.view.LoginView.LoginData;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class LoginController {
    private final LoginView view;
    private final AuthClient client;

    public LoginResponse run() {
        int maxAttempts = 3;
        int currentAttempt = 1;

        while (currentAttempt <= maxAttempts) {
            try {
                LoginData credentials = view.showLogin();
                LoginResponse response = client.login(credentials.username(), credentials.password());
                view.showWelcome(response.username());
                return response;
            } catch (ApiException e) {
                view.showError(e.getMessage());
            } finally {
                ++currentAttempt;
            }
        }

        view.showError("Has excedido los intentos de inicio de sesión. Intentalo más tarde.");

        return null;
    }
}
