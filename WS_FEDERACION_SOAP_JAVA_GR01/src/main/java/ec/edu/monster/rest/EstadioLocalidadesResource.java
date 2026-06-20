package ec.edu.monster.rest;

import ec.edu.monster.entity.LocalidadPartido;
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

@Path("estadios/{codigoEstadio}/localidades")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class EstadioLocalidadesResource {

    @Inject
    private FederacionFutbolService federacionService;

    @GET
    public Response listar(@PathParam("codigoEstadio") String codigoEstadio) {
        try {
            return Response.ok(federacionService.listarLocalidadesPorEstadio(codigoEstadio)).build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new RestError(ex.getMessage())).build();
        }
    }

    @POST
    public Response crear(@PathParam("codigoEstadio") String codigoEstadio, LocalidadPartido localidad) {
        try {
            return Response.status(Response.Status.CREATED)
                    .entity(federacionService.crearLocalidadPorEstadio(codigoEstadio, localidad))
                    .build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new RestError(ex.getMessage())).build();
        }
    }

    @PUT
    @Path("{idLocalidad}")
    public Response actualizar(
            @PathParam("codigoEstadio") String codigoEstadio,
            @PathParam("idLocalidad") Long idLocalidad,
            LocalidadPartido localidad) {
        try {
            return Response.ok(federacionService.actualizarLocalidadPorEstadio(codigoEstadio, idLocalidad, localidad)).build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new RestError(ex.getMessage())).build();
        }
    }

    @DELETE
    @Path("{idLocalidad}")
    public Response eliminar(
            @PathParam("codigoEstadio") String codigoEstadio,
            @PathParam("idLocalidad") Long idLocalidad) {
        try {
            federacionService.eliminarLocalidadPorEstadio(codigoEstadio, idLocalidad);
            return Response.noContent().build();
        } catch (BusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new RestError(ex.getMessage())).build();
        }
    }
}