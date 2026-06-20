package ec.edu.monster.service;

import ec.edu.monster.entity.Cliente;
import ec.edu.monster.entity.Usuario;
import ec.edu.monster.repository.ClienteRepository;
import ec.edu.monster.repository.UsuarioRepository;
import ec.edu.monster.rest.dto.LoginResponse;
import ec.edu.monster.rest.dto.RegistroRequest;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

@Stateless
public class AuthService {

    @Inject
    private UsuarioRepository usuarioRepository;

    @Inject
    private ClienteRepository clienteRepository;

    public LoginResponse login(String username, String password) throws TicketeraBusinessException {
        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            throw new TicketeraBusinessException("Usuario y contraseña son requeridos");
        }

        Usuario usuario = usuarioRepository.findByUsername(username.trim().toUpperCase());
        if (usuario == null || !usuario.getPassword().equals(password.trim())) {
            throw new TicketeraBusinessException("Usuario o contraseña incorrectos");
        }

        return new LoginResponse(usuario.getUsername(), usuario.getRol(), usuario.getCedula());
    }

    public LoginResponse registrarCliente(RegistroRequest request) throws TicketeraBusinessException {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()
                || request.getPassword() == null || request.getPassword().trim().isEmpty()
                || request.getCedula() == null || request.getCedula().trim().isEmpty()
                || request.getNombre() == null || request.getNombre().trim().isEmpty()
                || request.getApellido() == null || request.getApellido().trim().isEmpty()) {
            throw new TicketeraBusinessException("Todos los campos obligatorios deben estar llenos");
        }

        String username = request.getUsername().trim().toUpperCase();
        if (usuarioRepository.existsByUsername(username)) {
            throw new TicketeraBusinessException("Username ya existe");
        }

        if (clienteRepository.findByCedula(request.getCedula().trim()) != null) {
            throw new TicketeraBusinessException("Cliente con esa cedula ya existe");
        }

        Cliente cliente = new Cliente();
        cliente.setCedula(request.getCedula().trim());
        cliente.setNombre(request.getNombre().trim());
        cliente.setApellido(request.getApellido().trim());
        cliente.setTelefono(request.getTelefono() != null ? request.getTelefono().trim() : null);
        cliente.setCorreo(request.getCorreo() != null ? request.getCorreo().trim() : null);
        clienteRepository.create(cliente);

        Usuario usuario = new Usuario();
        usuario.setUsername(username);
        usuario.setPassword(request.getPassword().trim());
        usuario.setRol("cliente");
        usuario.setCedula(cliente.getCedula());
        usuarioRepository.create(usuario);

        return new LoginResponse(usuario.getUsername(), usuario.getRol(), usuario.getCedula());
    }
}
