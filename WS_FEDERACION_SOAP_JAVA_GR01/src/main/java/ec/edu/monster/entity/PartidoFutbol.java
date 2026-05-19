package ec.edu.monster.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "partido_futbol")
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "partidoFutbol")
public class PartidoFutbol implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(length = 20, nullable = false)
    private String codigo;

    @Column(name = "equipo_local", length = 80, nullable = false)
    private String equipoLocal;

    @Column(name = "equipo_visita", length = 80, nullable = false)
    private String equipoVisita;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date fecha;

    @Column(length = 120)
    private String lugar;

    @OneToMany(mappedBy = "partido", cascade = CascadeType.ALL)
    @XmlTransient
    private List<LocalidadPartido> localidades = new ArrayList<>();

    public PartidoFutbol() {
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getEquipoLocal() {
        return equipoLocal;
    }

    public void setEquipoLocal(String equipoLocal) {
        this.equipoLocal = equipoLocal;
    }

    public String getEquipoVisita() {
        return equipoVisita;
    }

    public void setEquipoVisita(String equipoVisita) {
        this.equipoVisita = equipoVisita;
    }

    public Date getFecha() {
        return fecha;
    }

    public void setFecha(Date fecha) {
        this.fecha = fecha;
    }

    public String getLugar() {
        return lugar;
    }

    public void setLugar(String lugar) {
        this.lugar = lugar;
    }

    public List<LocalidadPartido> getLocalidades() {
        return localidades;
    }

    public void setLocalidades(List<LocalidadPartido> localidades) {
        this.localidades = localidades;
    }
}
