package ec.edu.monster.rest.dto;

import java.util.Date;
import java.util.List;

public class FacturaDTO {
    private Long idFactura;
    private Date fecha;
    private double total;
    private String cedula;
    private List<FacturaLineaDTO> lineas;

    public FacturaDTO() {}

    public Long getIdFactura() { return idFactura; }
    public void setIdFactura(Long idFactura) { this.idFactura = idFactura; }

    public Date getFecha() { return fecha; }
    public void setFecha(Date fecha) { this.fecha = fecha; }

    public double getTotal() { return total; }
    public void setTotal(double total) { this.total = total; }

    public String getCedula() { return cedula; }
    public void setCedula(String cedula) { this.cedula = cedula; }

    public List<FacturaLineaDTO> getLineas() { return lineas; }
    public void setLineas(List<FacturaLineaDTO> lineas) { this.lineas = lineas; }

    public static class FacturaLineaDTO {
        private String codigoLocalidad;
        private int cantidad;
        private double total;

        public FacturaLineaDTO() {}

        public String getCodigoLocalidad() { return codigoLocalidad; }
        public void setCodigoLocalidad(String codigoLocalidad) { this.codigoLocalidad = codigoLocalidad; }

        public int getCantidad() { return cantidad; }
        public void setCantidad(int cantidad) { this.cantidad = cantidad; }

        public double getTotal() { return total; }
        public void setTotal(double total) { this.total = total; }
    }
}
