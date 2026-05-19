package ec.edu.monster.rest;

public class RestError {

    private String mensaje;

    public RestError() {
    }

    public RestError(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}
