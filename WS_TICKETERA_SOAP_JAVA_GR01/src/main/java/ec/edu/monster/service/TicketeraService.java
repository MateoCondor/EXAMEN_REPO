package ec.edu.monster.service;

import ec.edu.monster.entity.DetalleFactura;
import ec.edu.monster.entity.Factura;
import ec.edu.monster.repository.DetalleFacturaRepository;
import ec.edu.monster.repository.FacturaRepository;
import ec.edu.monster.soapclient.SoapFederacionClient;
import ec.edu.monster.soapclient.model.LocalidadPartidoDTO;
import ec.edu.monster.soapclient.model.PartidoFutbolDTO;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Stateless
public class TicketeraService {

    private static final double IVA_RATE = 0.15;

    @Inject
    private SoapFederacionClient soapClient;

    @Inject
    private FacturaRepository facturaRepository;

    @Inject
    private DetalleFacturaRepository detalleRepository;

    public List<PartidoFutbolDTO> obtenerPartidosDisponibles() throws TicketeraBusinessException {
        return soapClient.obtenerPartidosDisponibles();
    }

    public List<LocalidadPartidoDTO> obtenerLocalidadesPorPartido(String codigoPartido) throws TicketeraBusinessException {
        validarCodigoPartido(codigoPartido);
        return soapClient.obtenerLocalidadesPorPartido(codigoPartido);
    }

    public Factura comprar(String codigoPartido, String codigoLocalidad, int cantidad) throws TicketeraBusinessException {
        validarCodigoPartido(codigoPartido);
        if (codigoLocalidad == null || codigoLocalidad.trim().isEmpty()) {
            throw new TicketeraBusinessException("Codigo de localidad requerido");
        }
        if (cantidad <= 0) {
            throw new TicketeraBusinessException("Cantidad debe ser mayor a cero");
        }

        LocalidadPartidoDTO localidad = buscarLocalidad(codigoPartido, codigoLocalidad);
        if (localidad == null) {
            throw new TicketeraBusinessException("Localidad no existe o no tiene disponibilidad");
        }
        if (localidad.getDisponibilidad() < cantidad) {
            throw new TicketeraBusinessException("Stock insuficiente");
        }

        double subtotal = cantidad * localidad.getPrecio();
        double iva = subtotal * IVA_RATE;
        double total = subtotal + iva;

        Factura factura = new Factura();
        factura.setFecha(new Date());
        factura.setSubtotal(subtotal);
        factura.setIva(iva);
        factura.setTotal(total);

        DetalleFactura detalle = new DetalleFactura();
        detalle.setFactura(factura);
        detalle.setCodigoPartido(codigoPartido);
        detalle.setCodigoLocalidad(codigoLocalidad);
        detalle.setCantidad(cantidad);
        detalle.setPrecioUnitario(localidad.getPrecio());
        detalle.setTotal(total);

        factura.getDetalles().add(detalle);
        facturaRepository.create(factura);

        boolean ok = soapClient.decrementarDisponibilidad(codigoPartido, codigoLocalidad, cantidad);
        if (!ok) {
            throw new TicketeraBusinessException("No se pudo decrementar disponibilidad en Federacion");
        }

        return factura;
    }

    public List<ReporteItem> obtenerReporte(String codigoPartido) throws TicketeraBusinessException {
        validarCodigoPartido(codigoPartido);
        List<Object[]> rows = detalleRepository.reportePorPartido(codigoPartido);
        List<ReporteItem> items = new ArrayList<>();
        for (Object[] row : rows) {
            String codigoLocalidad = (String) row[0];
            long cantidadVendida = ((Number) row[1]).longValue();
            double totalRecaudado = ((Number) row[2]).doubleValue();
            items.add(new ReporteItem(codigoLocalidad, cantidadVendida, totalRecaudado));
        }
        return items;
    }

    private void validarCodigoPartido(String codigoPartido) throws TicketeraBusinessException {
        if (codigoPartido == null || codigoPartido.trim().isEmpty()) {
            throw new TicketeraBusinessException("Codigo de partido requerido");
        }
    }

    private LocalidadPartidoDTO buscarLocalidad(String codigoPartido, String codigoLocalidad) throws TicketeraBusinessException {
        List<LocalidadPartidoDTO> localidades = soapClient.obtenerLocalidadesPorPartido(codigoPartido);
        for (LocalidadPartidoDTO localidad : localidades) {
            if (codigoLocalidad.equalsIgnoreCase(localidad.getCodigoLocalidad())) {
                return localidad;
            }
        }
        return null;
    }
}
