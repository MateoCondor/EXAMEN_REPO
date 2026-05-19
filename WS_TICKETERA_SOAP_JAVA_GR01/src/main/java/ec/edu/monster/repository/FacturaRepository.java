package ec.edu.monster.repository;

import ec.edu.monster.entity.Factura;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Stateless
public class FacturaRepository {

    @PersistenceContext(unitName = "ec.edu.monster_WS_TICKETERA_SOAP_JAVA_GR01_war_1.0PU")
    private EntityManager entityManager;

    public void create(Factura factura) {
        entityManager.persist(factura);
    }
}
