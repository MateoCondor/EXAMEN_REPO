package ec.edu.monster.service;

import ec.edu.monster.entity.LocalidadPartido;
import ec.edu.monster.entity.PartidoFutbol;
import ec.edu.monster.repository.LocalidadPartidoRepository;
import ec.edu.monster.repository.PartidoFutbolRepository;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import java.util.Date;
import java.util.List;

@Stateless
public class FederacionFutbolService {

    @Inject
    private PartidoFutbolRepository partidoRepository;

    @Inject
    private LocalidadPartidoRepository localidadRepository;

    public List<PartidoFutbol> obtenerPartidosDisponibles() {
        return partidoRepository.findDisponibles(new Date());
    }

    public List<LocalidadPartido> obtenerLocalidadesPorPartido(String codigoPartido) throws BusinessException {
        validarCodigoPartido(codigoPartido);
        return localidadRepository.findDisponiblesByPartido(codigoPartido);
    }

    public boolean decrementarDisponibilidad(String codigoPartido, String codigoLocalidad, int cantidad) throws BusinessException {
        validarCodigoPartido(codigoPartido);
        if (codigoLocalidad == null || codigoLocalidad.trim().isEmpty()) {
            throw new BusinessException("Codigo de localidad requerido");
        }
        if (cantidad <= 0) {
            throw new BusinessException("Cantidad debe ser mayor a cero");
        }

        LocalidadPartido localidad = localidadRepository.findByPartidoAndCodigoLocalidad(codigoPartido, codigoLocalidad);
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
        PartidoFutbol partido = partidoRepository.findByCodigo(codigoPartido);
        if (partido == null) {
            throw new BusinessException("Partido no existe");
        }
    }
}
