package ec.edu.monster.rest;

import ec.edu.monster.service.BusinessException;
import ec.edu.monster.service.FederacionFutbolService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.Date;

@Path("partidos/{codigoPartido}/fecha")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class PartidoFechasResource {

    @Inject
    private FederacionFutbolService federacionService;

    @GET
    public Response obtener(@PathParam("codigoPartido") String codigoPartido) {
        try {
            Date fecha = federacionService.obtenerFechaPartido(codigoPartido);
            return Response.ok(new FechaPartidoResponse(codigoPartido, fecha)).build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new RestError(ex.getMessage())).build();
        }
    }

    @PUT
    public Response actualizar(@PathParam("codigoPartido") String codigoPartido, FechaPartidoRequest request) {
        try {
            Date fecha = federacionService.actualizarFechaPartido(codigoPartido, request != null ? request.getFecha() : null);
            return Response.ok(new FechaPartidoResponse(codigoPartido, fecha)).build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new RestError(ex.getMessage())).build();
        }
    }

    @DELETE
    public Response eliminar(@PathParam("codigoPartido") String codigoPartido) {
        try {
            federacionService.eliminarFechaPartido(codigoPartido);
            return Response.noContent().build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new RestError(ex.getMessage())).build();
        }
    }
}