package ec.edu.monster.repository;

import ec.edu.monster.entity.Usuario;
import jakarta.ejb.Stateless;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;

@Stateless
public class UsuarioRepository {

    @PersistenceContext(unitName = "ec.edu.monster_WS_TICKETERA_SOAP_JAVA_GR01_war_1.0PU")
    private EntityManager entityManager;

    public Usuario findByUsername(String username) {
        List<Usuario> results = entityManager
                .createQuery("SELECT u FROM Usuario u WHERE u.username = :username", Usuario.class)
                .setParameter("username", username)
                .getResultList();
        return results.isEmpty() ? null : results.get(0);
    }

    public Usuario findByCedula(String cedula) {
        List<Usuario> results = entityManager
                .createQuery("SELECT u FROM Usuario u WHERE u.cedula = :cedula", Usuario.class)
                .setParameter("cedula", cedula)
                .getResultList();
        return results.isEmpty() ? null : results.get(0);
    }

    public Usuario create(Usuario usuario) {
        entityManager.persist(usuario);
        return usuario;
    }

    public void delete(Usuario usuario) {
        entityManager.remove(entityManager.contains(usuario) ? usuario : entityManager.merge(usuario));
    }

    public boolean existsByUsername(String username) {
        return findByUsername(username) != null;
    }
}
