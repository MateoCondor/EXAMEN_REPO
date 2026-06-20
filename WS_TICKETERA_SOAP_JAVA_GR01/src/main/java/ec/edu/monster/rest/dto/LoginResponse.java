package ec.edu.monster.rest.dto;

public class LoginResponse {
    private String username;
    private String rol;
    private String cedula;

    public LoginResponse() {
    }

    public LoginResponse(String username, String rol, String cedula) {
        this.username = username;
        this.rol = rol;
        this.cedula = cedula;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }
}
