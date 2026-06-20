package ec.edu.monster.rest.dto;

import java.util.List;

public class CompraRequest {

    private String cedula;
    private String formaPago;
    private Integer plazo;
    private List<LineaCompra> lineas;

    public CompraRequest() {
    }

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public String getFormaPago() {
        return formaPago;
    }

    public void setFormaPago(String formaPago) {
        this.formaPago = formaPago;
    }

    public Integer getPlazo() {
        return plazo;
    }

    public void setPlazo(Integer plazo) {
        this.plazo = plazo;
    }

    public List<LineaCompra> getLineas() {
        return lineas;
    }

    public void setLineas(List<LineaCompra> lineas) {
        this.lineas = lineas;
    }

    public static class LineaCompra {
        private String codigoPartido;
        private String codigoLocalidad;
        private List<AsientoCompra> asientos;

        public LineaCompra() {
        }

        public String getCodigoPartido() {
            return codigoPartido;
        }

        public void setCodigoPartido(String codigoPartido) {
            this.codigoPartido = codigoPartido;
        }

        public String getCodigoLocalidad() {
            return codigoLocalidad;
        }

        public void setCodigoLocalidad(String codigoLocalidad) {
            this.codigoLocalidad = codigoLocalidad;
        }

        public List<AsientoCompra> getAsientos() {
            return asientos;
        }

        public void setAsientos(List<AsientoCompra> asientos) {
            this.asientos = asientos;
        }

        public static class AsientoCompra {
            private String seccion;
            private String numeroAsiento;
            private String nombreAsistente;

            public AsientoCompra() {}

            public String getSeccion() {
                return seccion;
            }

            public void setSeccion(String seccion) {
                this.seccion = seccion;
            }

            public String getNumeroAsiento() {
                return numeroAsiento;
            }

            public void setNumeroAsiento(String numeroAsiento) {
                this.numeroAsiento = numeroAsiento;
            }

            public String getNombreAsistente() {
                return nombreAsistente;
            }

            public void setNombreAsistente(String nombreAsistente) {
                this.nombreAsistente = nombreAsistente;
            }
        }
    }
}
