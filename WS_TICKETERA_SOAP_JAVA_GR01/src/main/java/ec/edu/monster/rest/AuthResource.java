package ec.edu.monster.rest;

import ec.edu.monster.rest.dto.LoginRequest;
import ec.edu.monster.rest.dto.LoginResponse;
import ec.edu.monster.rest.dto.RegistroRequest;
import ec.edu.monster.service.AuthService;
import ec.edu.monster.service.TicketeraBusinessException;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    private AuthService authService;

    @POST
    @Path("login")
    public Response login(LoginRequest request) {
        try {
            LoginResponse response = authService.login(request.getUsername(), request.getPassword());
            return Response.ok(response).build();
        } catch (TicketeraBusinessException ex) {
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity(new RestError(ex.getMessage()))
                    .build();
        }
    }

    @POST
    @Path("registro")
    public Response registro(RegistroRequest request) {
        try {
            LoginResponse response = authService.registrarCliente(request);
            return Response.status(Response.Status.CREATED).entity(response).build();
        } catch (TicketeraBusinessException ex) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new RestError(ex.getMessage()))
                    .build();
        }
    }
}
