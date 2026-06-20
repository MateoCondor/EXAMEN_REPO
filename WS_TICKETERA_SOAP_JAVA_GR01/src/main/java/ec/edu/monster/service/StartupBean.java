package ec.edu.monster.service;

import ec.edu.monster.entity.Usuario;
import ec.edu.monster.repository.UsuarioRepository;
import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;

@Singleton
@Startup
public class StartupBean {

    @Inject
    private UsuarioRepository usuarioRepository;

    @PostConstruct
    public void init() {
        if (!usuarioRepository.existsByUsername("MONSTER")) {
            Usuario admin = new Usuario();
            admin.setUsername("MONSTER");
            admin.setPassword("MONSTER9");
            admin.setRol("admin");
            admin.setCedula(null);
            usuarioRepository.create(admin);
        }
    }
}
