package ec.edu.monster.rest;

public class AmortizacionDTO {
    private int numeroCuota;
    private double valorCuota;
    private double interes;
    private double capital;
    private double saldo;

    public AmortizacionDTO() {}

    public AmortizacionDTO(int numeroCuota, double valorCuota, double interes, double capital, double saldo) {
        this.numeroCuota = numeroCuota;
        this.valorCuota = valorCuota;
        this.interes = interes;
        this.capital = capital;
        this.saldo = saldo;
    }

    public int getNumeroCuota() { return numeroCuota; }
    public void setNumeroCuota(int numeroCuota) { this.numeroCuota = numeroCuota; }

    public double getValorCuota() { return valorCuota; }
    public void setValorCuota(double valorCuota) { this.valorCuota = valorCuota; }

    public double getInteres() { return interes; }
    public void setInteres(double interes) { this.interes = interes; }

    public double getCapital() { return capital; }
    public void setCapital(double capital) { this.capital = capital; }

    public double getSaldo() { return saldo; }
    public void setSaldo(double saldo) { this.saldo = saldo; }
}
