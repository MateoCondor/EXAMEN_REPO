package ec.edu.monster.entity;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "amortizacion")
public class Amortizacion implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "credito_id", nullable = false)
    private Credito credito;

    @Column(name = "numero_cuota", nullable = false)
    private int numeroCuota;

    @Column(name = "valor_cuota", nullable = false)
    private double valorCuota;

    @Column(name = "interes", nullable = false)
    private double interes;

    @Column(name = "capital", nullable = false)
    private double capital;

    @Column(name = "saldo", nullable = false)
    private double saldo;

    public Amortizacion() {
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Credito getCredito() {
        return credito;
    }

    public void setCredito(Credito credito) {
        this.credito = credito;
    }

    public int getNumeroCuota() {
        return numeroCuota;
    }

    public void setNumeroCuota(int numeroCuota) {
        this.numeroCuota = numeroCuota;
    }

    public double getValorCuota() {
        return valorCuota;
    }

    public void setValorCuota(double valorCuota) {
        this.valorCuota = valorCuota;
    }

    public double getInteres() {
        return interes;
    }

    public void setInteres(double interes) {
        this.interes = interes;
    }

    public double getCapital() {
        return capital;
    }

    public void setCapital(double capital) {
        this.capital = capital;
    }

    public double getSaldo() {
        return saldo;
    }

    public void setSaldo(double saldo) {
        this.saldo = saldo;
    }
}
