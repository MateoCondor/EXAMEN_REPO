package ec.edu.monster.rest;

import ec.edu.monster.entity.Boleto;
import ec.edu.monster.repository.BoletoRepository;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.stream.Collectors;
import ec.edu.monster.rest.dto.BoletoOcupadoDTO;

@Path("boletos")
@Produces(MediaType.APPLICATION_JSON)
public class BoletosResource {

    @Inject
    private BoletoRepository boletoRepository;

    @GET
    @Path("ocupados")
    public Response obtenerOcupados(
            @QueryParam("codigoPartido") String codigoPartido,
            @QueryParam("codigoLocalidad") String codigoLocalidad) {
        
        if (codigoPartido == null || codigoLocalidad == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(new RestError("codigoPartido y codigoLocalidad son requeridos"))
                    .build();
        }

        List<Boleto> boletos = boletoRepository.findByPartidoAndLocalidad(codigoPartido, codigoLocalidad);
        
        List<BoletoOcupadoDTO> dtos = boletos.stream().map(b -> {
            BoletoOcupadoDTO dto = new BoletoOcupadoDTO();
            dto.setSeccion(b.getSeccion());
            dto.setNumeroAsiento(b.getNumeroAsiento());
            // Para admin, podríamos enviar más datos, pero por ahora enviaremos todo o filtramos en el frontend
            dto.setNombreAsistente(b.getNombreAsistente());
            dto.setFacturaId(b.getFactura().getIdFactura());
            dto.setCedulaCliente(b.getFactura().getCedula());
            return dto;
        }).collect(Collectors.toList());

        return Response.ok(dtos).build();
    }
}
