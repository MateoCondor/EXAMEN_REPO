package ec.edu.monster.repository;

import ec.edu.monster.entity.Credito;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@ApplicationScoped
public class CreditoRepository {

    @PersistenceContext(unitName = "ec.edu.monster_WS_COREBANCARIO_SOAP_JAVA_GR01_war_1.0PU")
    private EntityManager em;

    public boolean hasActiveCredit(String cedula) {
        Long count = em.createQuery("SELECT COUNT(c) FROM Credito c WHERE c.cedula = :cedula AND c.estado = 'ACTIVO'", Long.class)
                       .setParameter("cedula", cedula)
                       .getSingleResult();
        return count > 0;
    }
    
    public void save(Credito credito) {
        em.persist(credito);
    }
}
