package ec.edu.monster.client;

import ec.edu.monster.client.dto.CreditoRequest;
import ec.edu.monster.client.dto.CreditoResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@ApplicationScoped
public class CoreBancarioClient {

    private static final String BASE_URL = "http://localhost:8080/WS_COREBANCARIO_SOAP_JAVA_GR01/resources/credito/evaluar";

    public CreditoResponse evaluar(String cedula, double monto, int plazo) {
        Client client = ClientBuilder.newClient();
        try {
            CreditoRequest requestBody = new CreditoRequest(cedula, monto, plazo);
            
            Response response = client.target(BASE_URL)
                    .request(MediaType.APPLICATION_JSON)
                    .post(Entity.entity(requestBody, MediaType.APPLICATION_JSON));
                    
            if (response.getStatus() == Response.Status.OK.getStatusCode() ||
                response.getStatus() == Response.Status.BAD_REQUEST.getStatusCode()) {
                return response.readEntity(CreditoResponse.class);
            } else {
                CreditoResponse errResp = new CreditoResponse();
                errResp.setAprobado(false);
                errResp.setMensaje("Error en el sistema Core Bancario. Status: " + response.getStatus());
                return errResp;
            }
        } catch (Exception e) {
            CreditoResponse errResp = new CreditoResponse();
            errResp.setAprobado(false);
            errResp.setMensaje("No se pudo conectar con el sistema Core Bancario: " + e.getMessage());
            return errResp;
        } finally {
            client.close();
        }
    }
}
