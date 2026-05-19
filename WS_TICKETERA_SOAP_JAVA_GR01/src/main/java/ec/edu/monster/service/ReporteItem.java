package ec.edu.monster.service;

public class ReporteItem {

    private String codigoLocalidad;
    private long cantidadVendida;
    private double totalRecaudado;

    public ReporteItem() {
    }

    public ReporteItem(String codigoLocalidad, long cantidadVendida, double totalRecaudado) {
        this.codigoLocalidad = codigoLocalidad;
        this.cantidadVendida = cantidadVendida;
        this.totalRecaudado = totalRecaudado;
    }

    public String getCodigoLocalidad() {
        return codigoLocalidad;
    }

    public void setCodigoLocalidad(String codigoLocalidad) {
        this.codigoLocalidad = codigoLocalidad;
    }

    public long getCantidadVendida() {
        return cantidadVendida;
    }

    public void setCantidadVendida(long cantidadVendida) {
        this.cantidadVendida = cantidadVendida;
    }

    public double getTotalRecaudado() {
        return totalRecaudado;
    }

    public void setTotalRecaudado(double totalRecaudado) {
        this.totalRecaudado = totalRecaudado;
    }
}
