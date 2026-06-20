package ec.edu.monster.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "credito")
public class Credito implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "cedula", length = 20, nullable = false)
    private String cedula;

    @Column(name = "monto", nullable = false)
    private double monto;

    @Column(name = "plazo", nullable = false)
    private int plazo;

    @Column(name = "tasa", nullable = false)
    private double tasa;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "fecha_creacion", nullable = false)
    private Date fechaCreacion;
    
    @OneToMany(mappedBy = "credito", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Amortizacion> amortizaciones;

    public Credito() {
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public double getMonto() {
        return monto;
    }

    public void setMonto(double monto) {
        this.monto = monto;
    }

    public int getPlazo() {
        return plazo;
    }

    public void setPlazo(int plazo) {
        this.plazo = plazo;
    }

    public double getTasa() {
        return tasa;
    }

    public void setTasa(double tasa) {
        this.tasa = tasa;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Date getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(Date fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public List<Amortizacion> getAmortizaciones() {
        return amortizaciones;
    }

    public void setAmortizaciones(List<Amortizacion> amortizaciones) {
        this.amortizaciones = amortizaciones;
    }
}
