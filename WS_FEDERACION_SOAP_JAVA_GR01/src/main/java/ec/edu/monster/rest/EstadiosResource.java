package ec.edu.monster.rest;

import ec.edu.monster.entity.Estadio;
import ec.edu.monster.service.BusinessException;
import ec.edu.monster.service.FederacionFutbolService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("estadios")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class EstadiosResource {

    @Inject
    private FederacionFutbolService federacionService;

    @GET
    public Response listar() {
        return Response.ok(federacionService.listarEstadios()).build();
    }

    @GET
    @Path("{codigo}")
    public Response obtener(@PathParam("codigo") String codigo) {
        Estadio estadio = federacionService.obtenerEstadio(codigo);
        if (estadio == null) {
            return Response.status(Response.Status.NOT_FOUND).entity(new RestError("Estadio no existe")).build();
        }
        return Response.ok(estadio).build();
    }

    @POST
    public Response crear(Estadio estadio) {
        try {
            return Response.status(Response.Status.CREATED).entity(federacionService.crearEstadio(estadio)).build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new RestError(ex.getMessage())).build();
        }
    }

    @PUT
    @Path("{codigo}")
    public Response actualizar(@PathParam("codigo") String codigo, Estadio estadio) {
        try {
            return Response.ok(federacionService.actualizarEstadio(codigo, estadio)).build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new RestError(ex.getMessage())).build();
        }
    }

    @DELETE
    @Path("{codigo}")
    public Response eliminar(@PathParam("codigo") String codigo) {
        try {
            federacionService.eliminarEstadio(codigo);
            return Response.noContent().build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new RestError(ex.getMessage())).build();
        }
    }
}