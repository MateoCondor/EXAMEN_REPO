package ec.edu.monster.repository;

import ec.edu.monster.entity.Cliente;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Stateless
public class ClienteRepository {

    @PersistenceContext(unitName = "ec.edu.monster_WS_TICKETERA_SOAP_JAVA_GR01_war_1.0PU")
    private EntityManager entityManager;

    public List<Cliente> findAll() {
        return entityManager
                .createQuery("SELECT c FROM Cliente c ORDER BY c.apellido, c.nombre", Cliente.class)
                .getResultList();
    }

    public Cliente findByCedula(String cedula) {
        return entityManager.find(Cliente.class, cedula);
    }

    public Cliente create(Cliente cliente) {
        entityManager.persist(cliente);
        return cliente;
    }

    public Cliente update(Cliente cliente) {
        return entityManager.merge(cliente);
    }

    public void delete(Cliente cliente) {
        entityManager.remove(entityManager.contains(cliente) ? cliente : entityManager.merge(cliente));
    }
}