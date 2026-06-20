package ec.edu.monster.rest;

import ec.edu.monster.entity.Factura;
import ec.edu.monster.rest.dto.CompraRequest;
import ec.edu.monster.rest.dto.CompraResponse;
import ec.edu.monster.service.TicketeraBusinessException;
import ec.edu.monster.service.TicketeraService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("comprar")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class CompraResource {

    @Inject
    private TicketeraService ticketeraService;

    @POST
    public Response comprar(CompraRequest request) {
        try {
            Factura factura = ticketeraService.comprarMultiplesLocalidades(request);

            CompraResponse response = new CompraResponse();
            response.setIdFactura(factura.getIdFactura());
            response.setFecha(factura.getFecha());
            response.setSubtotal(factura.getSubtotal());
            response.setDescuento(factura.getDescuento());
            response.setIva(factura.getIva());
            response.setTotal(factura.getTotal());
            response.setCedula(factura.getCedula());
            response.setFormaPago(factura.getFormaPago());

            return Response.ok(response).build();
        } catch (TicketeraBusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new RestError(ex.getMessage()))
                    .build();
        }
    }
}
