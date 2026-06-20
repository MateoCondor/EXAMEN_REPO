package ec.edu.monster.service;

import ec.edu.monster.entity.Estadio;
import ec.edu.monster.entity.LocalidadPartido;
import ec.edu.monster.entity.PartidoFutbol;
import ec.edu.monster.repository.EstadioRepository;
import ec.edu.monster.repository.LocalidadPartidoRepository;
import ec.edu.monster.repository.PartidoFutbolRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Stateless
public class FederacionFutbolService {

    @Inject
    private PartidoFutbolRepository partidoRepository;

    @Inject
    private LocalidadPartidoRepository localidadRepository;

    @Inject
    private EstadioRepository estadioRepository;

    public List<PartidoFutbol> obtenerPartidosDisponibles() {
        return partidoRepository.findDisponibles(new Date());
    }

    public List<PartidoFutbol> listarPartidos() {
        return partidoRepository.findAll();
    }

    public List<ec.edu.monster.rest.FechaPartidoResponse> listarFechasPartidos() {
        List<ec.edu.monster.rest.FechaPartidoResponse> items = new ArrayList<>();
        for (PartidoFutbol partido : partidoRepository.findAll()) {
            items.add(new ec.edu.monster.rest.FechaPartidoResponse(partido.getCodigo(), partido.getFecha()));
        }
        return items;
    }

    public PartidoFutbol obtenerPartido(String codigoPartido) {
        if (codigoPartido == null || codigoPartido.trim().isEmpty()) {
            return null;
        }
        return partidoRepository.findByCodigo(codigoPartido);
    }

    public PartidoFutbol crearPartido(PartidoFutbol partido) throws BusinessException {
        validarPartido(partido);
        if (partidoRepository.findByCodigo(partido.getCodigo()) != null) {
            throw new BusinessException("Partido ya existe");
        }
        Estadio estadio = resolverEstadio(partido);
        partido.setEstadio(estadio);
        if (partido.getLugar() == null || partido.getLugar().trim().isEmpty()) {
            partido.setLugar(estadio.getNombre());
        }
        return partidoRepository.create(partido);
    }

    public PartidoFutbol actualizarPartido(String codigoPartido, PartidoFutbol partido) throws BusinessException {
        validarPartido(partido);
        PartidoFutbol actual = partidoRepository.findByCodigo(codigoPartido);
        if (actual == null) {
            throw new BusinessException("Partido no existe");
        }
        actual.setEquipoLocal(partido.getEquipoLocal());
        actual.setEquipoVisita(partido.getEquipoVisita());
        actual.setFecha(partido.getFecha());
        Estadio estadio = resolverEstadio(partido);
        actual.setEstadio(estadio);
        actual.setLugar((partido.getLugar() == null || partido.getLugar().trim().isEmpty()) ? estadio.getNombre() : partido.getLugar());
        return partidoRepository.update(actual);
    }

    public void eliminarPartido(String codigoPartido) throws BusinessException {
        PartidoFutbol actual = partidoRepository.findByCodigo(codigoPartido);
        if (actual == null) {
            throw new BusinessException("Partido no existe");
        }
        partidoRepository.delete(actual);
    }

    public List<Estadio> listarEstadios() {
        return estadioRepository.findAll();
    }

    public Estadio obtenerEstadio(String codigoEstadio) {
        if (codigoEstadio == null || codigoEstadio.trim().isEmpty()) {
            return null;
        }
        return estadioRepository.findByCodigo(codigoEstadio);
    }

    public Estadio crearEstadio(Estadio estadio) throws BusinessException {
        validarEstadio(estadio);
        if (estadioRepository.findByCodigo(estadio.getCodigo()) != null) {
            throw new BusinessException("Estadio ya existe");
        }
        return estadioRepository.create(estadio);
    }

    public Estadio actualizarEstadio(String codigoEstadio, Estadio estadio) throws BusinessException {
        validarEstadio(estadio);
        Estadio actual = estadioRepository.findByCodigo(codigoEstadio);
        if (actual == null) {
            throw new BusinessException("Estadio no existe");
        }
        actual.setNombre(estadio.getNombre());
        actual.setCiudad(estadio.getCiudad());
        actual.setCapacidad(estadio.getCapacidad());
        return estadioRepository.update(actual);
    }

    public void eliminarEstadio(String codigoEstadio) throws BusinessException {
        Estadio actual = estadioRepository.findByCodigo(codigoEstadio);
        if (actual == null) {
            throw new BusinessException("Estadio no existe");
        }
        estadioRepository.delete(actual);
    }

    public List<LocalidadPartido> obtenerLocalidadesPorPartido(String codigoPartido) throws BusinessException {
        validarCodigoPartido(codigoPartido);
        PartidoFutbol partido = partidoRepository.findByCodigo(codigoPartido);
        if (partido == null) {
            throw new BusinessException("Partido no existe");
        }
        return localidadRepository.findDisponiblesByPartido(codigoPartido);
    }

    public List<LocalidadPartido> listarLocalidadesPorEstadio(String codigoEstadio) throws BusinessException {
        validarCodigoEstadio(codigoEstadio);
        if (estadioRepository.findByCodigo(codigoEstadio) == null) {
            throw new BusinessException("Estadio no existe");
        }
        return localidadRepository.findByEstadio(codigoEstadio);
    }

    public LocalidadPartido crearLocalidadPorEstadio(String codigoEstadio, LocalidadPartido localidad) throws BusinessException {
        validarCodigoEstadio(codigoEstadio);
        validarLocalidad(localidad);
        Estadio estadio = estadioRepository.findByCodigo(codigoEstadio);
        if (estadio == null) {
            throw new BusinessException("Estadio no existe");
        }
        if (localidadRepository.findByEstadioAndCodigoLocalidad(codigoEstadio, localidad.getCodigoLocalidad()) != null) {
            throw new BusinessException("Localidad ya existe para el estadio");
        }
        localidad.setEstadio(estadio);
        return localidadRepository.create(localidad);
    }

    public LocalidadPartido actualizarLocalidadPorEstadio(String codigoEstadio, Long idLocalidad, LocalidadPartido localidad)
            throws BusinessException {
        validarCodigoEstadio(codigoEstadio);
        validarLocalidad(localidad);
        LocalidadPartido actual = localidadRepository.findById(idLocalidad);
        if (actual == null || actual.getEstadio() == null
                || !codigoEstadio.equalsIgnoreCase(actual.getEstadio().getCodigo())) {
            throw new BusinessException("Localidad no existe para el estadio");
        }
        actual.setCodigoLocalidad(localidad.getCodigoLocalidad());
        actual.setDisponibilidad(localidad.getDisponibilidad());
        actual.setPrecio(localidad.getPrecio());
        return localidadRepository.update(actual);
    }

    public void eliminarLocalidadPorEstadio(String codigoEstadio, Long idLocalidad) throws BusinessException {
        validarCodigoEstadio(codigoEstadio);
        LocalidadPartido actual = localidadRepository.findById(idLocalidad);
        if (actual == null || actual.getEstadio() == null
                || !codigoEstadio.equalsIgnoreCase(actual.getEstadio().getCodigo())) {
            throw new BusinessException("Localidad no existe para el estadio");
        }
        localidadRepository.delete(actual);
    }

    public Date obtenerFechaPartido(String codigoPartido) throws BusinessException {
        validarCodigoPartido(codigoPartido);
        PartidoFutbol partido = partidoRepository.findByCodigo(codigoPartido);
        if (partido == null) {
            throw new BusinessException("Partido no existe");
        }
        return partido.getFecha();
    }

    public Date actualizarFechaPartido(String codigoPartido, Date nuevaFecha) throws BusinessException {
        validarCodigoPartido(codigoPartido);
        if (nuevaFecha == null) {
            throw new BusinessException("Fecha requerida");
        }
        PartidoFutbol partido = partidoRepository.findByCodigo(codigoPartido);
        if (partido == null) {
            throw new BusinessException("Partido no existe");
        }
        partido.setFecha(nuevaFecha);
        partidoRepository.update(partido);
        return partido.getFecha();
    }

    public void eliminarFechaPartido(String codigoPartido) throws BusinessException {
        validarCodigoPartido(codigoPartido);
        PartidoFutbol partido = partidoRepository.findByCodigo(codigoPartido);
        if (partido == null) {
            throw new BusinessException("Partido no existe");
        }
        partido.setFecha(null);
        partidoRepository.update(partido);
    }

    public boolean decrementarDisponibilidad(String codigoPartido, String codigoLocalidad, int cantidad) throws BusinessException {
        validarCodigoPartido(codigoPartido);
        PartidoFutbol partido = partidoRepository.findByCodigo(codigoPartido);
        if (partido == null) {
            throw new BusinessException("Partido no existe");
        }
        if (codigoLocalidad == null || codigoLocalidad.trim().isEmpty()) {
            throw new BusinessException("Codigo de localidad requerido");
        }
        if (cantidad <= 0) {
            throw new BusinessException("Cantidad debe ser mayor a cero");
        }

        LocalidadPartido localidad = localidadRepository.findByEstadioAndCodigoLocalidad(
                partido.getEstadio().getCodigo(), codigoLocalidad);
        if (localidad == null) {
            throw new BusinessException("Localidad no existe para el partido");
        }
        if (localidad.getDisponibilidad() < cantidad) {
            throw new BusinessException("Stock insuficiente");
        }

        localidad.setDisponibilidad(localidad.getDisponibilidad() - cantidad);
        localidadRepository.update(localidad);
        return true;
    }

    private void validarCodigoPartido(String codigoPartido) throws BusinessException {
        if (codigoPartido == null || codigoPartido.trim().isEmpty()) {
            throw new BusinessException("Codigo de partido requerido");
        }
    }

    private void validarCodigoEstadio(String codigoEstadio) throws BusinessException {
        if (codigoEstadio == null || codigoEstadio.trim().isEmpty()) {
            throw new BusinessException("Codigo de estadio requerido");
        }
    }

    private void validarPartido(PartidoFutbol partido) throws BusinessException {
        if (partido == null) {
            throw new BusinessException("Partido requerido");
        }
        if (partido.getCodigo() == null || partido.getCodigo().trim().isEmpty()) {
            throw new BusinessException("Codigo de partido requerido");
        }
        if (partido.getEquipoLocal() == null || partido.getEquipoLocal().trim().isEmpty()) {
            throw new BusinessException("Equipo local requerido");
        }
        if (partido.getEquipoVisita() == null || partido.getEquipoVisita().trim().isEmpty()) {
            throw new BusinessException("Equipo visita requerido");
        }
        if (partido.getEstadio() == null && (partido.getLugar() == null || partido.getLugar().trim().isEmpty())) {
            throw new BusinessException("Estadio requerido");
        }
    }

    private void validarEstadio(Estadio estadio) throws BusinessException {
        if (estadio == null) {
            throw new BusinessException("Estadio requerido");
        }
        if (estadio.getCodigo() == null || estadio.getCodigo().trim().isEmpty()) {
            throw new BusinessException("Codigo de estadio requerido");
        }
        if (estadio.getNombre() == null || estadio.getNombre().trim().isEmpty()) {
            throw new BusinessException("Nombre de estadio requerido");
        }
        if (estadio.getCiudad() == null || estadio.getCiudad().trim().isEmpty()) {
            throw new BusinessException("Ciudad requerida");
        }
        if (estadio.getCapacidad() <= 0) {
            throw new BusinessException("Capacidad debe ser mayor a cero");
        }
    }

    private void validarLocalidad(LocalidadPartido localidad) throws BusinessException {
        if (localidad == null) {
            throw new BusinessException("Localidad requerida");
        }
        if (localidad.getCodigoLocalidad() == null || localidad.getCodigoLocalidad().trim().isEmpty()) {
            throw new BusinessException("Codigo de localidad requerido");
        }
        if (localidad.getDisponibilidad() < 0) {
            throw new BusinessException("Disponibilidad no puede ser negativa");
        }
        if (localidad.getPrecio() <= 0) {
            throw new BusinessException("Precio debe ser mayor a cero");
        }
    }

    private Estadio resolverEstadio(PartidoFutbol partido) throws BusinessException {
        if (partido.getEstadio() != null && partido.getEstadio().getCodigo() != null
                && !partido.getEstadio().getCodigo().trim().isEmpty()) {
            Estadio estadio = estadioRepository.findByCodigo(partido.getEstadio().getCodigo());
            if (estadio == null) {
                throw new BusinessException("Estadio no existe");
            }
            return estadio;
        }
        if (partido.getLugar() != null && !partido.getLugar().trim().isEmpty()) {
            Estadio estadio = estadioRepository.findByNombre(partido.getLugar().trim());
            if (estadio != null) {
                return estadio;
            }
        }
        throw new BusinessException("Estadio no existe");
    }
}
