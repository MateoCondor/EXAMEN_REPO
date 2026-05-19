package ec.edu.monster.soap;

import ec.edu.monster.entity.LocalidadPartido;
import ec.edu.monster.entity.PartidoFutbol;
import ec.edu.monster.service.BusinessException;
import ec.edu.monster.service.FederacionFutbolService;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.jws.WebMethod;
import jakarta.jws.WebParam;
import jakarta.jws.WebResult;
import jakarta.jws.WebService;
import jakarta.jws.soap.SOAPBinding;
import java.util.List;

@Stateless
@WebService(serviceName = "FederacionFutbolService", targetNamespace = "http://soap.monster.edu.ec/")
@SOAPBinding(style = SOAPBinding.Style.DOCUMENT, use = SOAPBinding.Use.LITERAL)
public class FederacionFutbolSoap {

    @Inject
    private FederacionFutbolService federacionService;

    @WebMethod(operationName = "obtenerPartidosDisponibles")
    @WebResult(name = "partidos")
    public List<PartidoFutbol> obtenerPartidosDisponibles() {
        return federacionService.obtenerPartidosDisponibles();
    }

    @WebMethod(operationName = "obtenerLocalidadesPorPartido")
    @WebResult(name = "localidades")
    public List<LocalidadPartido> obtenerLocalidadesPorPartido(
            @WebParam(name = "codigoPartido") String codigoPartido) throws BusinessException {
        return federacionService.obtenerLocalidadesPorPartido(codigoPartido);
    }

    @WebMethod(operationName = "decrementarDisponibilidad")
    @WebResult(name = "resultado")
    public boolean decrementarDisponibilidad(
            @WebParam(name = "codigoPartido") String codigoPartido,
            @WebParam(name = "codigoLocalidad") String codigoLocalidad,
            @WebParam(name = "cantidad") int cantidad) throws BusinessException {
        return federacionService.decrementarDisponibilidad(codigoPartido, codigoLocalidad, cantidad);
    }
}
