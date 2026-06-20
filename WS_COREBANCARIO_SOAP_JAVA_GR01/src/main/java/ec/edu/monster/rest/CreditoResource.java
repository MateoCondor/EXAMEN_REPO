package ec.edu.monster.rest;

import ec.edu.monster.entity.Amortizacion;
import ec.edu.monster.repository.AmortizacionRepository;
import ec.edu.monster.service.CoreException;
import ec.edu.monster.service.CreditoResponse;
import ec.edu.monster.service.CreditoService;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.stream.Collectors;

@Path("/credito")
@RequestScoped
public class CreditoResource {

    @Inject
    private CreditoService creditoService;

    @Inject
    private AmortizacionRepository amortizacionRepository;

    @POST
    @Path("/evaluar")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response evaluar(CreditoRequest request) {
        try {
            CreditoResponse response = creditoService.evaluarCredito(request.getCedula(), request.getMonto(), request.getPlazo());
            return Response.ok(response).build();
        } catch (CoreException e) {
            CreditoResponse errorResponse = new CreditoResponse(false, e.getMessage(), 0.0);
            return Response.status(Response.Status.BAD_REQUEST).entity(errorResponse).build();
        } catch (Exception e) {
            CreditoResponse errorResponse = new CreditoResponse(false, "Error interno del servidor", 0.0);
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(errorResponse).build();
        }
    }

    @POST
    @Path("/simular")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response simular(CreditoRequest request) {
        try {
            List<AmortizacionDTO> dtos = creditoService.simularAmortizacion(request.getMonto(), request.getPlazo());
            return Response.ok(dtos).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\":\"" + e.getMessage() + "\"}")
                .build();
        }
    }

    @GET
    @Path("/amortizacion/{cedula}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAmortizacion(@PathParam("cedula") String cedula) {
        try {
            List<Amortizacion> rows = amortizacionRepository.findByCedula(cedula);
            List<AmortizacionDTO> dtos = rows.stream().map(a -> new AmortizacionDTO(
                a.getNumeroCuota(), a.getValorCuota(), a.getInteres(), a.getCapital(), a.getSaldo()
            )).collect(Collectors.toList());
            return Response.ok(dtos).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\":\"" + e.getMessage() + "\"}")
                .build();
        }
    }
}
