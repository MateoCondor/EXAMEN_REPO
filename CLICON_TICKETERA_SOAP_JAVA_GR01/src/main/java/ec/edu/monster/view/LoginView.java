package ec.edu.monster.view;

import java.util.Scanner;

public class LoginView {
    private final Scanner scanner = new Scanner(System.in);

    public record LoginData(String username, String password) {
    }

    public LoginData showLogin() {
        System.out.println("\n========================================");
        System.out.println("         CLICON RESTFUL - JAVA GR01       ");
        System.out.println("            INICIO DE SESIÓN              ");
        System.out.println("\n========================================");
        System.out.println("----------------------------------------");

        System.out.print("Usuario: ");
        String username = scanner.nextLine();

        System.out.print("Contraseña: ");
        String password = scanner.nextLine();

        System.out.println("----------------------------------------");

        return new LoginData(username, password);
    }

    public void showError(String message) {
        System.out.println("Error: " + message);
    }

    public void showWelcome(String username) {
        System.out.println("Bienvenido " + username);
    }
}
