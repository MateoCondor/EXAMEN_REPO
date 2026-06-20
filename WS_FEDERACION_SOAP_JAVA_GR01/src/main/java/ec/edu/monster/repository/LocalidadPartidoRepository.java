package ec.edu.monster.repository;

import ec.edu.monster.entity.LocalidadPartido;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Stateless
public class LocalidadPartidoRepository {

    @PersistenceContext(unitName = "ec.edu.monster_WS_FEDERACION_SOAP_JAVA_GR01_war_1.0PU")
    private EntityManager entityManager;

    public LocalidadPartido findById(Long id) {
        return entityManager.find(LocalidadPartido.class, id);
    }

    public List<LocalidadPartido> findByEstadio(String codigoEstadio) {
        return entityManager
                .createQuery(
                        "SELECT l FROM LocalidadPartido l WHERE l.estadio.codigo = :codigo ORDER BY l.codigoLocalidad",
                        LocalidadPartido.class)
                .setParameter("codigo", codigoEstadio)
                .getResultList();
    }

    public List<LocalidadPartido> findDisponiblesByEstadio(String codigoEstadio) {
        return entityManager
                .createQuery(
                        "SELECT l FROM LocalidadPartido l WHERE l.estadio.codigo = :codigo AND l.disponibilidad > 0 ORDER BY l.codigoLocalidad",
                        LocalidadPartido.class)
                .setParameter("codigo", codigoEstadio)
                .getResultList();
    }

    public List<LocalidadPartido> findDisponiblesByPartido(String codigoPartido) {
        return entityManager
                .createQuery(
                        "SELECT l FROM LocalidadPartido l WHERE l.estadio.codigo = (SELECT p.estadio.codigo FROM PartidoFutbol p WHERE p.codigo = :codigo) AND l.disponibilidad > 0 ORDER BY l.codigoLocalidad",
                        LocalidadPartido.class)
                .setParameter("codigo", codigoPartido)
                .getResultList();
    }

    public LocalidadPartido findByPartidoAndCodigoLocalidad(String codigoPartido, String codigoLocalidad) {
        try {
            return entityManager
                    .createQuery(
                            "SELECT l FROM LocalidadPartido l WHERE l.estadio.codigo = (SELECT p.estadio.codigo FROM PartidoFutbol p WHERE p.codigo = :codigoPartido) AND l.codigoLocalidad = :codigoLocalidad",
                            LocalidadPartido.class)
                    .setParameter("codigoPartido", codigoPartido)
                    .setParameter("codigoLocalidad", codigoLocalidad)
                    .getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

    public LocalidadPartido findByEstadioAndCodigoLocalidad(String codigoEstadio, String codigoLocalidad) {
        try {
            return entityManager
                    .createQuery(
                            "SELECT l FROM LocalidadPartido l WHERE l.estadio.codigo = :codigoEstadio AND l.codigoLocalidad = :codigoLocalidad",
                            LocalidadPartido.class)
                    .setParameter("codigoEstadio", codigoEstadio)
                    .setParameter("codigoLocalidad", codigoLocalidad)
                    .getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

    public LocalidadPartido create(LocalidadPartido localidad) {
        entityManager.persist(localidad);
        return localidad;
    }

    public LocalidadPartido update(LocalidadPartido localidad) {
        return entityManager.merge(localidad);
    }

    public void delete(LocalidadPartido localidad) {
        entityManager.remove(entityManager.contains(localidad) ? localidad : entityManager.merge(localidad));
    }
}
