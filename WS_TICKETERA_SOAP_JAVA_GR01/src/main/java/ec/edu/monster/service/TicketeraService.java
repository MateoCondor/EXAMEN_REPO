package ec.edu.monster.service;

import ec.edu.monster.entity.Cliente;
import ec.edu.monster.entity.DetalleFactura;
import ec.edu.monster.entity.Boleto;
import ec.edu.monster.entity.Factura;
import ec.edu.monster.repository.BoletoRepository;
import ec.edu.monster.repository.ClienteRepository;
import ec.edu.monster.repository.DetalleFacturaRepository;
import ec.edu.monster.repository.FacturaRepository;
import ec.edu.monster.rest.dto.CompraRequest;
import ec.edu.monster.client.CoreBancarioClient;
import ec.edu.monster.client.dto.CreditoResponse;
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

    @Inject
    private ClienteRepository clienteRepository;

    @Inject
    private BoletoRepository boletoRepository;

    @Inject
    private CoreBancarioClient coreBancarioClient;

    public List<PartidoFutbolDTO> obtenerPartidosDisponibles() throws TicketeraBusinessException {
        return soapClient.obtenerPartidosDisponibles();
    }

    public List<LocalidadPartidoDTO> obtenerLocalidadesPorPartido(String codigoPartido) throws TicketeraBusinessException {
        validarCodigoPartido(codigoPartido);
        return soapClient.obtenerLocalidadesPorPartido(codigoPartido);
    }

    public Factura comprar(String codigoPartido, String codigoLocalidad, int cantidad, String cedula, String formaPago, Integer plazo) throws TicketeraBusinessException {
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
        double descuento = 0;
        double iva;
        double total;
        
        if ("EFECTIVO".equalsIgnoreCase(formaPago)) {
            descuento = subtotal * 0.12;
            double subtotalConDescuento = subtotal - descuento;
            iva = subtotalConDescuento * IVA_RATE;
            total = subtotalConDescuento + iva;
        } else {
            iva = subtotal * IVA_RATE;
            total = subtotal + iva;
            
            if ("CREDITO".equalsIgnoreCase(formaPago)) {
                CreditoResponse credResp = coreBancarioClient.evaluar(cedula, total, plazo == null ? 0 : plazo);
                if (!credResp.isAprobado()) {
                    throw new TicketeraBusinessException("Credito rechazado: " + credResp.getMensaje());
                }
            }
        }

        Factura factura = new Factura();
        factura.setFecha(new Date());
        factura.setSubtotal(subtotal);
        factura.setDescuento(descuento);
        factura.setIva(iva);
        factura.setTotal(total);
        factura.setCedula(cedula);
        factura.setFormaPago(formaPago);

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

    public Factura comprarMultiplesLocalidades(CompraRequest request) throws TicketeraBusinessException {
        String cedula = request.getCedula();
        String formaPago = request.getFormaPago();
        Integer plazo = request.getPlazo();
        List<CompraRequest.LineaCompra> lineas = request.getLineas();

        if (cedula == null || cedula.trim().isEmpty()) {
            throw new TicketeraBusinessException("Cedula requerida");
        }
        Cliente cliente = clienteRepository.findByCedula(cedula);
        if (cliente == null) {
            throw new TicketeraBusinessException("Cliente no existe");
        }
        if (lineas == null || lineas.isEmpty()) {
            throw new TicketeraBusinessException("Debe seleccionar al menos una localidad");
        }

        double subtotal = 0;

        // Validar todas las localidades primero
        for (CompraRequest.LineaCompra linea : lineas) {
            if (linea.getAsientos() == null || linea.getAsientos().isEmpty()) {
                throw new TicketeraBusinessException("Debe seleccionar al menos un asiento para " + linea.getCodigoLocalidad());
            }
            if (linea.getCodigoPartido() == null || linea.getCodigoPartido().trim().isEmpty()) {
                throw new TicketeraBusinessException("Codigo de partido requerido para localidad " + linea.getCodigoLocalidad());
            }

            LocalidadPartidoDTO localidad = buscarLocalidad(linea.getCodigoPartido(), linea.getCodigoLocalidad());
            if (localidad == null) {
                throw new TicketeraBusinessException("Localidad " + linea.getCodigoLocalidad() + " no existe en partido " + linea.getCodigoPartido());
            }
            if (localidad.getDisponibilidad() < linea.getAsientos().size()) {
                throw new TicketeraBusinessException("Stock insuficiente para " + linea.getCodigoLocalidad() + " en partido " + linea.getCodigoPartido());
            }
            
            // Validar si los asientos ya están ocupados
            for (CompraRequest.LineaCompra.AsientoCompra asiento : linea.getAsientos()) {
                if (boletoRepository.isAsientoOcupado(linea.getCodigoPartido(), linea.getCodigoLocalidad(), asiento.getSeccion(), asiento.getNumeroAsiento())) {
                    throw new TicketeraBusinessException("El asiento " + asiento.getNumeroAsiento() + " en " + asiento.getSeccion() + " ya está ocupado.");
                }
            }

            subtotal += linea.getAsientos().size() * localidad.getPrecio();
        }

        double descuento = 0;
        double iva;
        double total;
        
        if ("EFECTIVO".equalsIgnoreCase(formaPago)) {
            descuento = subtotal * 0.12;
            double subtotalConDescuento = subtotal - descuento;
            iva = subtotalConDescuento * IVA_RATE;
            total = subtotalConDescuento + iva;
        } else {
            iva = subtotal * IVA_RATE;
            total = subtotal + iva;
            
            if ("CREDITO".equalsIgnoreCase(formaPago)) {
                CreditoResponse credResp = coreBancarioClient.evaluar(cedula, total, plazo == null ? 0 : plazo);
                if (!credResp.isAprobado()) {
                    throw new TicketeraBusinessException("Credito rechazado: " + credResp.getMensaje());
                }
            }
        }

        // Crear factura
        Factura factura = new Factura();
        factura.setFecha(new Date());
        factura.setSubtotal(subtotal);
        factura.setDescuento(descuento);
        factura.setIva(iva);
        factura.setTotal(total);
        factura.setCedula(cedula);
        factura.setFormaPago(formaPago);

        // Crear detalles, registrar boletos y decrementar disponibilidad
        for (CompraRequest.LineaCompra linea : lineas) {
            LocalidadPartidoDTO localidad = buscarLocalidad(linea.getCodigoPartido(), linea.getCodigoLocalidad());
            double precioUnitario = localidad.getPrecio();
            int cantidad = linea.getAsientos().size();
            double totalLinea = cantidad * precioUnitario;

            DetalleFactura detalle = new DetalleFactura();
            detalle.setFactura(factura);
            detalle.setCodigoPartido(linea.getCodigoPartido());
            detalle.setCodigoLocalidad(linea.getCodigoLocalidad());
            detalle.setCantidad(cantidad);
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setTotal(totalLinea);

            factura.getDetalles().add(detalle);
            
            // Crear Boletos
            for (CompraRequest.LineaCompra.AsientoCompra asiento : linea.getAsientos()) {
                Boleto boleto = new Boleto();
                boleto.setFactura(factura);
                boleto.setCodigoPartido(linea.getCodigoPartido());
                boleto.setCodigoLocalidad(linea.getCodigoLocalidad());
                boleto.setSeccion(asiento.getSeccion());
                boleto.setNumeroAsiento(asiento.getNumeroAsiento());
                boleto.setNombreAsistente(asiento.getNombreAsistente());
                boleto.setEstado("COMPRADO");
                boletoRepository.create(boleto);
            }

            // Decrementar disponibilidad
            boolean ok = soapClient.decrementarDisponibilidad(linea.getCodigoPartido(), linea.getCodigoLocalidad(), cantidad);
            if (!ok) {
                throw new TicketeraBusinessException("No se pudo decrementar disponibilidad para " + linea.getCodigoLocalidad());
            }
        }

        facturaRepository.create(factura);
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

    public List<ec.edu.monster.rest.dto.FacturaDTO> obtenerFacturasPorPartido(String codigoPartido) throws TicketeraBusinessException {
        validarCodigoPartido(codigoPartido);
        List<Factura> facturas = facturaRepository.buscarPorPartido(codigoPartido);
        List<ec.edu.monster.rest.dto.FacturaDTO> dtos = new ArrayList<>();
        for (Factura f : facturas) {
            ec.edu.monster.rest.dto.FacturaDTO dto = new ec.edu.monster.rest.dto.FacturaDTO();
            dto.setIdFactura(f.getIdFactura());
            dto.setFecha(f.getFecha());
            dto.setTotal(f.getTotal());
            dto.setCedula(f.getCedula());
            dto.setFormaPago(f.getFormaPago());
            dto.setDescuento(f.getDescuento());
            
            List<ec.edu.monster.rest.dto.FacturaDTO.FacturaLineaDTO> lineas = new ArrayList<>();
            for (DetalleFactura d : f.getDetalles()) {
                ec.edu.monster.rest.dto.FacturaDTO.FacturaLineaDTO linea = new ec.edu.monster.rest.dto.FacturaDTO.FacturaLineaDTO();
                linea.setCodigoPartido(d.getCodigoPartido());
                linea.setCodigoLocalidad(d.getCodigoLocalidad());
                linea.setCantidad(d.getCantidad());
                linea.setTotal(d.getTotal());
                lineas.add(linea);
            }
            dto.setLineas(lineas);
            dtos.add(dto);
        }
        return dtos;
    }

    public List<ec.edu.monster.rest.dto.FacturaDTO> obtenerFacturasPorCliente(String cedula) throws TicketeraBusinessException {
        if (cedula == null || cedula.trim().isEmpty()) {
            throw new TicketeraBusinessException("Cedula requerida");
        }
        List<Factura> facturas = facturaRepository.buscarPorCliente(cedula);
        List<ec.edu.monster.rest.dto.FacturaDTO> dtos = new ArrayList<>();
        for (Factura f : facturas) {
            ec.edu.monster.rest.dto.FacturaDTO dto = new ec.edu.monster.rest.dto.FacturaDTO();
            dto.setIdFactura(f.getIdFactura());
            dto.setFecha(f.getFecha());
            dto.setTotal(f.getTotal());
            dto.setCedula(f.getCedula());
            dto.setFormaPago(f.getFormaPago());
            dto.setDescuento(f.getDescuento());
            
            List<ec.edu.monster.rest.dto.FacturaDTO.FacturaLineaDTO> lineas = new ArrayList<>();
            for (DetalleFactura d : f.getDetalles()) {
                ec.edu.monster.rest.dto.FacturaDTO.FacturaLineaDTO linea = new ec.edu.monster.rest.dto.FacturaDTO.FacturaLineaDTO();
                linea.setCodigoPartido(d.getCodigoPartido());
                linea.setCodigoLocalidad(d.getCodigoLocalidad());
                linea.setCantidad(d.getCantidad());
                linea.setTotal(d.getTotal());
                lineas.add(linea);
            }
            dto.setLineas(lineas);
            dtos.add(dto);
        }
        return dtos;
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
