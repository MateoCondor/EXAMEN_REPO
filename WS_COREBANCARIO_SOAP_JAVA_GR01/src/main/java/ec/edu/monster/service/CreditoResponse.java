package ec.edu.monster.service;

public class CreditoResponse {
    private boolean aprobado;
    private String mensaje;
    private double maxMonto;

    public CreditoResponse() {}

    public CreditoResponse(boolean aprobado, String mensaje, double maxMonto) {
        this.aprobado = aprobado;
        this.mensaje = mensaje;
        this.maxMonto = maxMonto;
    }

    public boolean isAprobado() {
        return aprobado;
    }

    public void setAprobado(boolean aprobado) {
        this.aprobado = aprobado;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public double getMaxMonto() {
        return maxMonto;
    }

    public void setMaxMonto(double maxMonto) {
        this.maxMonto = maxMonto;
    }
}
