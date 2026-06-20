package ec.edu.monster.rest;

import ec.edu.monster.entity.PartidoFutbol;
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

@Path("partidos")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class PartidosResource {

    @Inject
    private FederacionFutbolService federacionService;

    @GET
    public Response listar() {
        return Response.ok(federacionService.listarPartidos()).build();
    }

    @GET
    @Path("fechas")
    public Response listarFechas() {
        return Response.ok(federacionService.listarFechasPartidos()).build();
    }

    @GET
    @Path("disponibles")
    public Response disponibles() {
        return Response.ok(federacionService.obtenerPartidosDisponibles()).build();
    }

    @GET
    @Path("{codigo}")
    public Response obtener(@PathParam("codigo") String codigo) {
        PartidoFutbol partido = federacionService.obtenerPartido(codigo);
        if (partido == null) {
            return Response.status(Response.Status.NOT_FOUND).entity(new RestError("Partido no existe")).build();
        }
        return Response.ok(partido).build();
    }

    @POST
    public Response crear(PartidoFutbol partido) {
        try {
            return Response.status(Response.Status.CREATED).entity(federacionService.crearPartido(partido)).build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new RestError(ex.getMessage())).build();
        }
    }

    @PUT
    @Path("{codigo}")
    public Response actualizar(@PathParam("codigo") String codigo, PartidoFutbol partido) {
        try {
            return Response.ok(federacionService.actualizarPartido(codigo, partido)).build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new RestError(ex.getMessage())).build();
        }
    }

    @DELETE
    @Path("{codigo}")
    public Response eliminar(@PathParam("codigo") String codigo) {
        try {
            federacionService.eliminarPartido(codigo);
            return Response.noContent().build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new RestError(ex.getMessage())).build();
        }
    }
}