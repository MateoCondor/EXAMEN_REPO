package ec.edu.monster.rest.dto;

import java.util.List;

public class CompraRequest {

    private String codigoPartido;
    private String cedula;
    private List<LineaCompra> lineas;

    public CompraRequest() {
    }

    public String getCodigoPartido() {
        return codigoPartido;
    }

    public void setCodigoPartido(String codigoPartido) {
        this.codigoPartido = codigoPartido;
    }

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public List<LineaCompra> getLineas() {
        return lineas;
    }

    public void setLineas(List<LineaCompra> lineas) {
        this.lineas = lineas;
    }

    public static class LineaCompra {
        private String codigoLocalidad;
        private int cantidad;

        public LineaCompra() {
        }

        public String getCodigoLocalidad() {
            return codigoLocalidad;
        }

        public void setCodigoLocalidad(String codigoLocalidad) {
            this.codigoLocalidad = codigoLocalidad;
        }

        public int getCantidad() {
            return cantidad;
        }

        public void setCantidad(int cantidad) {
            this.cantidad = cantidad;
        }
    }
}
