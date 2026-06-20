package ec.edu.monster.rest;

import java.util.Date;

public class FechaPartidoResponse {

    private String codigoPartido;
    private Date fecha;

    public FechaPartidoResponse() {
    }

    public FechaPartidoResponse(String codigoPartido, Date fecha) {
        this.codigoPartido = codigoPartido;
        this.fecha = fecha;
    }

    public String getCodigoPartido() {
        return codigoPartido;
    }

    public void setCodigoPartido(String codigoPartido) {
        this.codigoPartido = codigoPartido;
    }

    public Date getFecha() {
        return fecha;
    }

    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }
}