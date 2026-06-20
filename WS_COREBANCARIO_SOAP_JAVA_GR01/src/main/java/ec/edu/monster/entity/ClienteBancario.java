package ec.edu.monster.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "cliente_bancario")
public class ClienteBancario implements Serializable {

    @Id
    @Column(name = "cedula", length = 20, nullable = false)
    private String cedula;

    @Column(name = "nombre", length = 120, nullable = false)
    private String nombre;

    @Column(name = "genero", length = 1, nullable = false)
    private String genero;

    @Temporal(TemporalType.DATE)
    @Column(name = "fecha_nacimiento", nullable = false)
    private Date fechaNacimiento;

    @Column(name = "num_cuenta", length = 20, nullable = false, unique = true)
    private String numCuenta;

    @Column(name = "saldo", nullable = false)
    private double saldo;

    public ClienteBancario() {
    }

    // Getters and Setters

    public String getCedula() {
        return cedula;
    }

    public void setCedula(String cedula) {
        this.cedula = cedula;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }

    public Date getFechaNacimiento() {
        return fechaNacimiento;
    }

    public void setFechaNacimiento(Date fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }

    public String getNumCuenta() {
        return numCuenta;
    }

    public void setNumCuenta(String numCuenta) {
        this.numCuenta = numCuenta;
    }

    public double getSaldo() {
        return saldo;
    }

    public void setSaldo(double saldo) {
        this.saldo = saldo;
    }
}
