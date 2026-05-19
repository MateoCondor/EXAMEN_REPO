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

    public List<LocalidadPartido> findDisponiblesByPartido(String codigoPartido) {
        return entityManager
                .createQuery(
                        "SELECT l FROM LocalidadPartido l WHERE l.partido.codigo = :codigo AND l.disponibilidad > 0",
                        LocalidadPartido.class)
                .setParameter("codigo", codigoPartido)
                .getResultList();
    }

    public LocalidadPartido findByPartidoAndCodigoLocalidad(String codigoPartido, String codigoLocalidad) {
        try {
            return entityManager
                    .createQuery(
                            "SELECT l FROM LocalidadPartido l WHERE l.partido.codigo = :codigoPartido AND l.codigoLocalidad = :codigoLocalidad",
                            LocalidadPartido.class)
                    .setParameter("codigoPartido", codigoPartido)
                    .setParameter("codigoLocalidad", codigoLocalidad)
                    .getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
    }

    public LocalidadPartido update(LocalidadPartido localidad) {
        return entityManager.merge(localidad);
    }
}
