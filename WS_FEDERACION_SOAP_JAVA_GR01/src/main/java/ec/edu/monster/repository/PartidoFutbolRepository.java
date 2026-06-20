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

    public List<PartidoFutbol> findAll() {
        return entityManager
                .createQuery("SELECT p FROM PartidoFutbol p ORDER BY p.fecha", PartidoFutbol.class)
                .getResultList();
    }

    public List<PartidoFutbol> findDisponibles(Date now) {
        return entityManager
                .createQuery("SELECT p FROM PartidoFutbol p WHERE p.fecha IS NOT NULL AND p.fecha >= :now ORDER BY p.fecha", PartidoFutbol.class)
                .setParameter("now", now)
                .getResultList();
    }

    public PartidoFutbol create(PartidoFutbol partido) {
        entityManager.persist(partido);
        return partido;
    }

    public PartidoFutbol update(PartidoFutbol partido) {
        return entityManager.merge(partido);
    }

    public void delete(PartidoFutbol partido) {
        entityManager.remove(entityManager.contains(partido) ? partido : entityManager.merge(partido));
    }
}
