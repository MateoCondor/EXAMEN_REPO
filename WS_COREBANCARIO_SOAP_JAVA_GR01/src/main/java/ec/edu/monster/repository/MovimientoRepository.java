package ec.edu.monster.repository;

import ec.edu.monster.entity.Movimiento;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Date;

@ApplicationScoped
public class MovimientoRepository {

    @PersistenceContext(unitName = "ec.edu.monster_WS_COREBANCARIO_SOAP_JAVA_GR01_war_1.0PU")
    private EntityManager em;

    public Double findPromedioDepositos(String numCuenta, Date since) {
        Double avg = em.createQuery("SELECT AVG(m.valor) FROM Movimiento m WHERE m.numCuenta = :numCuenta AND m.tipo = 'DEPOSITO' AND m.fecha >= :since", Double.class)
                       .setParameter("numCuenta", numCuenta)
                       .setParameter("since", since)
                       .getSingleResult();
        return avg != null ? avg : 0.0;
    }

    public Double findPromedioRetiros(String numCuenta, Date since) {
        Double avg = em.createQuery("SELECT AVG(m.valor) FROM Movimiento m WHERE m.numCuenta = :numCuenta AND m.tipo = 'RETIRO' AND m.fecha >= :since", Double.class)
                       .setParameter("numCuenta", numCuenta)
                       .setParameter("since", since)
                       .getSingleResult();
        return avg != null ? avg : 0.0;
    }

    public Long countDepositsInLastMonth(String numCuenta, Date since) {
        return em.createQuery("SELECT COUNT(m) FROM Movimiento m WHERE m.numCuenta = :numCuenta AND m.tipo = 'DEPOSITO' AND m.fecha >= :since", Long.class)
                 .setParameter("numCuenta", numCuenta)
                 .setParameter("since", since)
                 .getSingleResult();
    }
}
