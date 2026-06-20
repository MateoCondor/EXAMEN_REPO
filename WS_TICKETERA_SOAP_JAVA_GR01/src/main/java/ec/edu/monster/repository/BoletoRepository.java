package ec.edu.monster.repository;

import ec.edu.monster.entity.Boleto;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Stateless
public class BoletoRepository {

    @PersistenceContext(unitName = "ec.edu.monster_WS_TICKETERA_SOAP_JAVA_GR01_war_1.0PU")
    private EntityManager em;

    public Boleto create(Boleto boleto) {
        em.persist(boleto);
        return boleto;
    }

    public List<Boleto> findByPartidoAndLocalidad(String codigoPartido, String codigoLocalidad) {
        return em.createQuery("SELECT b FROM Boleto b WHERE b.codigoPartido = :codigoPartido AND b.codigoLocalidad = :codigoLocalidad", Boleto.class)
                 .setParameter("codigoPartido", codigoPartido)
                 .setParameter("codigoLocalidad", codigoLocalidad)
                 .getResultList();
    }

    public boolean isAsientoOcupado(String codigoPartido, String codigoLocalidad, String seccion, String numeroAsiento) {
        Long count = em.createQuery("SELECT count(b) FROM Boleto b WHERE b.codigoPartido = :codigoPartido AND b.codigoLocalidad = :codigoLocalidad AND b.seccion = :seccion AND b.numeroAsiento = :numeroAsiento", Long.class)
                       .setParameter("codigoPartido", codigoPartido)
                       .setParameter("codigoLocalidad", codigoLocalidad)
                       .setParameter("seccion", seccion)
                       .setParameter("numeroAsiento", numeroAsiento)
                       .getSingleResult();
        return count > 0;
    }
}
