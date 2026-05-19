package ec.edu.monster.repository;

import ec.edu.monster.entity.PartidoFutbol;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Date;
import java.util.List;

@Stateless
public class PartidoFutbolRepository {

    @PersistenceContext(unitName = "ec.edu.monster_WS_FEDERACION_SOAP_JAVA_GR01_war_1.0PU")
    private EntityManager entityManager;

    public PartidoFutbol findByCodigo(String codigo) {
        return entityManager.find(PartidoFutbol.class, codigo);
    }

    public List<PartidoFutbol> findDisponibles(Date now) {
        return entityManager
                .createQuery("SELECT p FROM PartidoFutbol p WHERE p.fecha >= :now ORDER BY p.fecha", PartidoFutbol.class)
                .setParameter("now", now)
                .getResultList();
    }
}
