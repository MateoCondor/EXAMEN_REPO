package ec.edu.monster.service;

import ec.edu.monster.entity.Cliente;
import ec.edu.monster.entity.Usuario;
import ec.edu.monster.repository.ClienteRepository;
import ec.edu.monster.repository.UsuarioRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import java.util.List;

@Stateless
public class ClienteService {

    @Inject
    private ClienteRepository clienteRepository;

    @Inject
    private UsuarioRepository usuarioRepository;

    public List<Cliente> listar() {
        return clienteRepository.findAll();
    }

    public Cliente obtener(String cedula) throws TicketeraBusinessException {
        validarCedula(cedula);
        Cliente cliente = clienteRepository.findByCedula(cedula);
        if (cliente == null) {
            throw new TicketeraBusinessException("Cliente no existe");
        }
        return cliente;
    }

    public Cliente crear(Cliente cliente) throws TicketeraBusinessException {
        validarCliente(cliente);
        if (clienteRepository.findByCedula(cliente.getCedula()) != null) {
            throw new TicketeraBusinessException("Cliente ya existe");
        }
        Cliente created = clienteRepository.create(cliente);
        
        // Auto-crear usuario para el cliente
        if (!usuarioRepository.existsByUsername(cliente.getCedula())) {
            Usuario usuario = new Usuario();
            usuario.setUsername(cliente.getCedula());
            usuario.setPassword(cliente.getCedula());
            usuario.setRol("cliente");
            usuario.setCedula(cliente.getCedula());
            usuarioRepository.create(usuario);
        }
        
        return created;
    }

    public Cliente actualizar(String cedula, Cliente cliente) throws TicketeraBusinessException {
        validarCedula(cedula);
        validarCliente(cliente);
        Cliente actual = clienteRepository.findByCedula(cedula);
        if (actual == null) {
            throw new TicketeraBusinessException("Cliente no existe");
        }
        actual.setNombre(cliente.getNombre());
        actual.setApellido(cliente.getApellido());
        actual.setTelefono(cliente.getTelefono());
        actual.setCorreo(cliente.getCorreo());
        return clienteRepository.update(actual);
    }

    public void eliminar(String cedula) throws TicketeraBusinessException {
        validarCedula(cedula);
        Cliente actual = clienteRepository.findByCedula(cedula);
        if (actual == null) {
            throw new TicketeraBusinessException("Cliente no existe");
        }
        
        // Eliminar usuario asociado
        Usuario usuario = usuarioRepository.findByCedula(cedula);
        if (usuario != null) {
            usuarioRepository.delete(usuario);
        }
        
        clienteRepository.delete(actual);
    }

    private void validarCedula(String cedula) throws TicketeraBusinessException {
        if (cedula == null || cedula.trim().isEmpty()) {
            throw new TicketeraBusinessException("Cedula requerida");
        }
    }

    private void validarCliente(Cliente cliente) throws TicketeraBusinessException {
        if (cliente == null) {
            throw new TicketeraBusinessException("Cliente requerido");
        }
        validarCedula(cliente.getCedula());
        if (cliente.getNombre() == null || cliente.getNombre().trim().isEmpty()) {
            throw new TicketeraBusinessException("Nombre requerido");
        }
        if (cliente.getApellido() == null || cliente.getApellido().trim().isEmpty()) {
            throw new TicketeraBusinessException("Apellido requerido");
        }
    }
}