package ec.edu.monster.rest;

import ec.edu.monster.entity.Cliente;
import ec.edu.monster.service.ClienteService;
import ec.edu.monster.service.TicketeraBusinessException;
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

@Path("clientes")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class ClientesResource {

    @Inject
    private ClienteService clienteService;

    @GET
    public Response listar() {
        return Response.ok(clienteService.listar()).build();
    }

    @GET
    @Path("{cedula}")
    public Response obtener(@PathParam("cedula") String cedula) {
        try {
            return Response.ok(clienteService.obtener(cedula)).build();
        } catch (TicketeraBusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new RestError(ex.getMessage())).build();
        }
    }

    @POST
    public Response crear(Cliente cliente) {
        try {
            return Response.status(Response.Status.CREATED).entity(clienteService.crear(cliente)).build();
        } catch (TicketeraBusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new RestError(ex.getMessage())).build();
        }
    }

    @PUT
    @Path("{cedula}")
    public Response actualizar(@PathParam("cedula") String cedula, Cliente cliente) {
        try {
            return Response.ok(clienteService.actualizar(cedula, cliente)).build();
        } catch (TicketeraBusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new RestError(ex.getMessage())).build();
        }
    }

    @DELETE
    @Path("{cedula}")
    public Response eliminar(@PathParam("cedula") String cedula) {
        try {
            clienteService.eliminar(cedula);
            return Response.noContent().build();
        } catch (TicketeraBusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new RestError(ex.getMessage())).build();
        }
    }
}