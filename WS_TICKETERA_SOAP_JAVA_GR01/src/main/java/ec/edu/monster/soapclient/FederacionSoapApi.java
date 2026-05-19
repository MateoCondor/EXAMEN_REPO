package ec.edu.monster.soapclient;

import ec.edu.monster.soapclient.model.LocalidadPartidoDTO;
import ec.edu.monster.soapclient.model.PartidoFutbolDTO;
import jakarta.jws.WebMethod;
import jakarta.jws.WebParam;
import jakarta.jws.WebService;
import jakarta.jws.soap.SOAPBinding;
import java.util.List;

@WebService(targetNamespace = "http://soap.monster.edu.ec/", name = "FederacionFutbolSoap")
@SOAPBinding(style = SOAPBinding.Style.DOCUMENT, use = SOAPBinding.Use.LITERAL)
public interface FederacionSoapApi {

    @WebMethod(operationName = "obtenerPartidosDisponibles")
    List<PartidoFutbolDTO> obtenerPartidosDisponibles();

    @WebMethod(operationName = "obtenerLocalidadesPorPartido")
    List<LocalidadPartidoDTO> obtenerLocalidadesPorPartido(
            @WebParam(name = "codigoPartido") String codigoPartido);

    @WebMethod(operationName = "decrementarDisponibilidad")
    boolean decrementarDisponibilidad(
            @WebParam(name = "codigoPartido") String codigoPartido,
            @WebParam(name = "codigoLocalidad") String codigoLocalidad,
            @WebParam(name = "cantidad") int cantidad);
}
