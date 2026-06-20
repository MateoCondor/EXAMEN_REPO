package ec.edu.monster.repository;

import ec.edu.monster.entity.Estadio;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Stateless
public class EstadioRepository {

    @PersistenceContext(unitName = "ec.edu.monster_WS_FEDERACION_SOAP_JAVA_GR01_war_1.0PU")
    private EntityManager entityManager;

    public Estadio findByCodigo(String codigo) {
        return entityManager.find(Estadio.class, codigo);
    }

    public Estadio findByNombre(String nombre) {
        List<Estadio> items = entityManager
                .createQuery("SELECT e FROM Estadio e WHERE e.nombre = :nombre", Estadio.class)
                .setParameter("nombre", nombre)
                .setMaxResults(1)
                .getResultList();
        return items.isEmpty() ? null : items.get(0);
    }

    public List<Estadio> findAll() {
        return entityManager.createQuery("SELECT e FROM Estadio e ORDER BY e.nombre", Estadio.class)
                .getResultList();
    }

    public Estadio create(Estadio estadio) {
        entityManager.persist(estadio);
        return estadio;
    }

    public Estadio update(Estadio estadio) {
        return entityManager.merge(estadio);
    }

    public void delete(Estadio estadio) {
        entityManager.remove(entityManager.contains(estadio) ? estadio : entityManager.merge(estadio));
    }
}