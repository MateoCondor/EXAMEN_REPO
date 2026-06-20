package ec.edu.monster.client.dto;

public class CreditoResponse {
    private boolean aprobado;
    private String mensaje;

    public CreditoResponse() {}

    public boolean isAprobado() { return aprobado; }
    public void setAprobado(boolean aprobado) { this.aprobado = aprobado; }
    
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
}
