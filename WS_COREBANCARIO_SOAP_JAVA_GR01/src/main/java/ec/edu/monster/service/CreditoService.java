package ec.edu.monster.service;

import ec.edu.monster.entity.Amortizacion;
import ec.edu.monster.entity.ClienteBancario;
import ec.edu.monster.entity.Credito;
import ec.edu.monster.repository.ClienteBancarioRepository;
import ec.edu.monster.repository.CreditoRepository;
import ec.edu.monster.repository.MovimientoRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import ec.edu.monster.repository.AmortizacionRepository;
import ec.edu.monster.rest.AmortizacionDTO;

@ApplicationScoped
public class CreditoService {

    @Inject
    private ClienteBancarioRepository clienteRepo;

    @Inject
    private MovimientoRepository movimientoRepo;

    @Inject
    private CreditoRepository creditoRepo;

    @Inject
    private AmortizacionRepository amortizacionRepo;

    @Transactional
    public CreditoResponse evaluarCredito(String cedula, double monto, int plazo) throws CoreException {
        ClienteBancario cliente = clienteRepo.findByCedula(cedula);
        if (cliente == null) {
            throw new CoreException("Cliente no existe en cliente_bancario");
        }

        Calendar cal30 = Calendar.getInstance();
        cal30.add(Calendar.DAY_OF_YEAR, -30);
        Date date30DaysAgo = cal30.getTime();

        Long depositosLastMonth = movimientoRepo.countDepositsInLastMonth(cliente.getNumCuenta(), date30DaysAgo);
        if (depositosLastMonth == null || depositosLastMonth < 1) {
            throw new CoreException("Debe tener al menos 1 DEPOSITO en los ultimos 30 dias");
        }

        int age = calculateAge(cliente.getFechaNacimiento());
        if (age < 25 || !"M".equalsIgnoreCase(cliente.getGenero())) {
            throw new CoreException("La edad debe ser >= 25 y el genero debe ser 'M'");
        }

        if (creditoRepo.hasActiveCredit(cedula)) {
            throw new CoreException("El cliente ya tiene un credito activo");
        }

        Calendar cal90 = Calendar.getInstance();
        cal90.add(Calendar.DAY_OF_YEAR, -90);
        Date date90DaysAgo = cal90.getTime();

        double avgDepositos = movimientoRepo.findPromedioDepositos(cliente.getNumCuenta(), date90DaysAgo);
        double avgRetiros = movimientoRepo.findPromedioRetiros(cliente.getNumCuenta(), date90DaysAgo);

        double maxCredit = ((avgDepositos - avgRetiros) * 0.35) * 6;

        if (maxCredit < monto) {
            return new CreditoResponse(false, "El monto solicitado excede el credito maximo permitido (" + maxCredit + ")", maxCredit);
        }

        Credito credito = new Credito();
        credito.setCedula(cedula);
        credito.setMonto(monto);
        credito.setPlazo(plazo);
        credito.setTasa(0.165);
        credito.setEstado("ACTIVO");
        credito.setFechaCreacion(new Date());

        List<AmortizacionDTO> dtos = simularAmortizacion(monto, plazo);
        List<Amortizacion> amortizaciones = new ArrayList<>();
        
        for (AmortizacionDTO dto : dtos) {
            Amortizacion amortizacion = new Amortizacion();
            amortizacion.setCredito(credito);
            amortizacion.setNumeroCuota(dto.getNumeroCuota());
            amortizacion.setValorCuota(dto.getValorCuota());
            amortizacion.setInteres(dto.getInteres());
            amortizacion.setCapital(dto.getCapital());
            amortizacion.setSaldo(dto.getSaldo());
            amortizaciones.add(amortizacion);
        }
        credito.setAmortizaciones(amortizaciones);
        
        creditoRepo.save(credito);

        for (Amortizacion a : amortizaciones) {
            amortizacionRepo.save(a);
        }

        return new CreditoResponse(true, "Credito aprobado exitosamente", maxCredit);
    }

    private int calculateAge(Date birthDate) {
        Calendar dob = Calendar.getInstance();
        dob.setTime(birthDate);
        Calendar today = Calendar.getInstance();
        int age = today.get(Calendar.YEAR) - dob.get(Calendar.YEAR);
        if (today.get(Calendar.DAY_OF_YEAR) < dob.get(Calendar.DAY_OF_YEAR)) {
            age--;
        }
        return age;
    }

    public List<AmortizacionDTO> simularAmortizacion(double monto, int plazo) {
        double r = 0.165 / 12.0;
        double cuota = monto / ((1 - Math.pow(1 + r, -plazo)) / r);
        double saldo = monto;

        List<AmortizacionDTO> dtos = new ArrayList<>();
        for (int i = 1; i <= plazo; i++) {
            double interes = saldo * r;
            double capital = cuota - interes;
            saldo = saldo - capital;
            
            if (saldo < 0) saldo = 0;

            dtos.add(new AmortizacionDTO(i, cuota, interes, capital, saldo));
        }
        return dtos;
    }
}
