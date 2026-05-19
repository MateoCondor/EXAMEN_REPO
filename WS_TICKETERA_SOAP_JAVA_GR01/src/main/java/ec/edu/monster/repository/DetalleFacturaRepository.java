package ec.edu.monster.repository;

import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Stateless
public class DetalleFacturaRepository {

    @PersistenceContext(unitName = "ec.edu.monster_WS_TICKETERA_SOAP_JAVA_GR01_war_1.0PU")
    private EntityManager entityManager;

    public List<Object[]> reportePorPartido(String codigoPartido) {
        return entityManager
                .createQuery(
                        "SELECT d.codigoLocalidad, SUM(d.cantidad), SUM(d.total) "
                                + "FROM DetalleFactura d "
                                + "WHERE d.codigoPartido = :codigoPartido "
                                + "GROUP BY d.codigoLocalidad",
                        Object[].class)
                .setParameter("codigoPartido", codigoPartido)
                .getResultList();
    }
}
