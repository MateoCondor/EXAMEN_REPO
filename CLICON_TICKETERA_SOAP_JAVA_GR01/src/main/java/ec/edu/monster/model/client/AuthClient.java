package ec.edu.monster.model.client;

import ec.edu.monster.model.dto.LoginResponse;
import ec.edu.monster.model.exceptions.ApiException;

public class AuthClient {
    private final static String username = "MONSTER";
    private final static String password = "MONSTER9";

    public LoginResponse login(String username, String password) {
        if (AuthClient.username.compareTo(username) != 0 || AuthClient.password.compareTo(password) != 0)
            throw new ApiException("Usuario o constraseña incorrectas");

        return new LoginResponse(username);
    }
}
