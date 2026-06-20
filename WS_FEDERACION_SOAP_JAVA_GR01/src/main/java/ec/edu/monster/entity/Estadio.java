package ec.edu.monster.entity;

import jakarta.json.bind.annotation.JsonbTransient;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlTransient;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "estadio")
@XmlAccessorType(XmlAccessType.FIELD)
@XmlRootElement(name = "estadio")
public class Estadio implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @Column(length = 20, nullable = false)
    private String codigo;

    @Column(length = 120, nullable = false)
    private String nombre;

    @Column(length = 80, nullable = false)
    private String ciudad;

    @Column(nullable = false)
    private int capacidad;

    @OneToMany(mappedBy = "estadio")
    @JsonbTransient
    @XmlTransient
    private List<LocalidadPartido> localidades = new ArrayList<>();

    public Estadio() {
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCiudad() {
        return ciudad;
    }

    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }

    public int getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(int capacidad) {
        this.capacidad = capacidad;
    }

    public List<LocalidadPartido> getLocalidades() {
        return localidades;
    }

    public void setLocalidades(List<LocalidadPartido> localidades) {
        this.localidades = localidades;
    }
}