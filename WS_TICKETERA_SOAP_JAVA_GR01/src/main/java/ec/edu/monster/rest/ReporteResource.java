package ec.edu.monster.rest;

import ec.edu.monster.service.TicketeraBusinessException;
import ec.edu.monster.service.TicketeraService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("reporte")
@Produces(MediaType.APPLICATION_JSON)
public class ReporteResource {

    @Inject
    private TicketeraService ticketeraService;

    @GET
    @Path("{codigoPartido}")
    public Response obtenerReporte(@PathParam("codigoPartido") String codigoPartido) {
        try {
            return Response.ok(ticketeraService.obtenerReporte(codigoPartido)).build();
        } catch (TicketeraBusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new RestError(ex.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("{codigoPartido}/facturas")
    public Response obtenerFacturas(@PathParam("codigoPartido") String codigoPartido) {
        try {
            return Response.ok(ticketeraService.obtenerFacturasPorPartido(codigoPartido)).build();
        } catch (TicketeraBusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new RestError(ex.getMessage()))
                    .build();
        }
    }
}
