package ec.edu.monster.repository;

import ec.edu.monster.entity.Amortizacion;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@ApplicationScoped
public class AmortizacionRepository {

    @PersistenceContext(unitName = "ec.edu.monster_WS_COREBANCARIO_SOAP_JAVA_GR01_war_1.0PU")
    private EntityManager em;

    public void save(Amortizacion amortizacion) {
        em.persist(amortizacion);
    }

    public List<Amortizacion> findByCedula(String cedula) {
        return em.createQuery(
            "SELECT a FROM Amortizacion a WHERE a.credito.cedula = :cedula ORDER BY a.numeroCuota ASC",
            Amortizacion.class)
            .setParameter("cedula", cedula)
            .getResultList();
    }
}
