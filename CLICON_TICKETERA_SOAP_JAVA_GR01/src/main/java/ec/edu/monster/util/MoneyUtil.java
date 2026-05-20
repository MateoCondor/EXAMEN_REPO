package ec.edu.monster.util;

public class MoneyUtil {
    public static final Double LocaleTax = .15;

    public static Double applyTax(Double value) {
        return value * (1 + LocaleTax);
    }

    public static Double computeTax(Double value) {
        return value * LocaleTax;
    }

    public static Double excludeTax(Double value) {
        return value * (1 - LocaleTax);
    }
}
