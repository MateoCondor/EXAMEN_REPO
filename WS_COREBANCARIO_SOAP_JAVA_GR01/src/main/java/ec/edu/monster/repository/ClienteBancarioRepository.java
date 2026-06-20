package ec.edu.monster.repository;

import ec.edu.monster.entity.ClienteBancario;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.NoResultException;

@ApplicationScoped
public class ClienteBancarioRepository {

    @PersistenceContext(unitName = "ec.edu.monster_WS_COREBANCARIO_SOAP_JAVA_GR01_war_1.0PU")
    private EntityManager em;

    public ClienteBancario findByCedula(String cedula) {
        try {
            return em.createQuery("SELECT c FROM ClienteBancario c WHERE c.cedula = :cedula", ClienteBancario.class)
                     .setParameter("cedula", cedula)
                     .getSingleResult();
        } catch (NoResultException e) {
            return null;
        }
    }
}
