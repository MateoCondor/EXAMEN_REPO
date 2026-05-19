package ec.edu.monster.soapclient;

import ec.edu.monster.service.TicketeraBusinessException;
import ec.edu.monster.soapclient.model.LocalidadPartidoDTO;
import ec.edu.monster.soapclient.model.PartidoFutbolDTO;
import jakarta.ejb.Stateless;
import jakarta.xml.bind.DatatypeConverter;
import jakarta.xml.soap.MessageFactory;
import jakarta.xml.soap.SOAPBody;
import jakarta.xml.soap.SOAPElement;
import jakarta.xml.soap.SOAPEnvelope;
import jakarta.xml.soap.SOAPException;
import jakarta.xml.soap.SOAPMessage;
import jakarta.xml.ws.BindingProvider;
import jakarta.xml.ws.Dispatch;
import jakarta.xml.ws.Service;
import jakarta.xml.ws.WebServiceException;
import jakarta.xml.ws.soap.SOAPFaultException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import javax.xml.namespace.QName;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

@Stateless
public class SoapFederacionClient {

    private static final String NAMESPACE = "http://soap.monster.edu.ec/";
    private static final String SERVICE_NAME = "FederacionFutbolService";
    private static final String DEFAULT_WSDL =
            "http://localhost:8080/FederacionFutbolService/FederacionFutbolSoap?wsdl";
    private static final String DEFAULT_ENDPOINT =
            "http://localhost:8080/FederacionFutbolService/FederacionFutbolSoap";

    public List<PartidoFutbolDTO> obtenerPartidosDisponibles() throws TicketeraBusinessException {
        try {
            SOAPMessage response = invoke("obtenerPartidosDisponibles", null, null);
            return parsePartidos(response);
        } catch (SOAPException ex) {
            throw new TicketeraBusinessException("Respuesta SOAP invalida", ex);
        }
    }

    public List<LocalidadPartidoDTO> obtenerLocalidadesPorPartido(String codigoPartido) throws TicketeraBusinessException {
        try {
            SOAPMessage response = invoke(
                    "obtenerLocalidadesPorPartido",
                    new String[] {"codigoPartido"},
                    new String[] {codigoPartido});
            return parseLocalidades(response);
        } catch (SOAPException ex) {
            throw new TicketeraBusinessException("Respuesta SOAP invalida", ex);
        }
    }

    public boolean decrementarDisponibilidad(String codigoPartido, String codigoLocalidad, int cantidad)
            throws TicketeraBusinessException {
        try {
            SOAPMessage response = invoke(
                    "decrementarDisponibilidad",
                    new String[] {"codigoPartido", "codigoLocalidad", "cantidad"},
                    new String[] {codigoPartido, codigoLocalidad, String.valueOf(cantidad)});
            String value = findFirstText(response.getSOAPBody(), "resultado");
            if (value == null) {
                value = findFirstText(response.getSOAPBody(), "return");
            }
            return Boolean.parseBoolean(value);
        } catch (SOAPException ex) {
            throw new TicketeraBusinessException("Respuesta SOAP invalida", ex);
        }
    }

    private SOAPMessage invoke(String operation, String[] paramNames, String[] paramValues)
            throws TicketeraBusinessException {
        try {
            Dispatch<SOAPMessage> dispatch = createDispatch();
            SOAPMessage request = buildRequest(operation, paramNames, paramValues);
            SOAPMessage response = dispatch.invoke(request);
            SOAPBody body = response.getSOAPBody();
            if (body != null && body.hasFault()) {
                throw new TicketeraBusinessException(body.getFault().getFaultString());
            }
            return response;
        } catch (SOAPFaultException ex) {
            throw new TicketeraBusinessException(ex.getFault().getFaultString(), ex);
        } catch (WebServiceException ex) {
            throw new TicketeraBusinessException(ex.getMessage(), ex);
        } catch (SOAPException ex) {
            throw new TicketeraBusinessException("Error construyendo mensaje SOAP", ex);
        } catch (Exception ex) {
            throw new TicketeraBusinessException("No se pudo conectar con Federacion", ex);
        }
    }

    private Dispatch<SOAPMessage> createDispatch() throws TicketeraBusinessException {
        try {
            URL wsdlUrl = new URL(resolveWsdlUrl());
            Service service = Service.create(wsdlUrl, new QName(NAMESPACE, SERVICE_NAME));
            QName portQName = resolvePortQName(service);
            Dispatch<SOAPMessage> dispatch = service.createDispatch(portQName, SOAPMessage.class, Service.Mode.MESSAGE);
            ((BindingProvider) dispatch).getRequestContext().put(
                    BindingProvider.ENDPOINT_ADDRESS_PROPERTY, resolveEndpointUrl());
            return dispatch;
        } catch (MalformedURLException ex) {
            throw new TicketeraBusinessException("WSDL invalido para Federacion", ex);
        } catch (Exception ex) {
            throw new TicketeraBusinessException("No se pudo conectar con Federacion", ex);
        }
    }

    private QName resolvePortQName(Service service) {
        Iterator<QName> ports = service.getPorts();
        if (ports != null && ports.hasNext()) {
            return ports.next();
        }
        return new QName(NAMESPACE, "FederacionFutbolSoapPort");
    }

    private SOAPMessage buildRequest(String operation, String[] paramNames, String[] paramValues) throws SOAPException {
        MessageFactory factory = MessageFactory.newInstance();
        SOAPMessage message = factory.createMessage();
        SOAPEnvelope envelope = message.getSOAPPart().getEnvelope();
        SOAPBody body = envelope.getBody();
        SOAPElement operationElement = body.addChildElement(operation, "ns", NAMESPACE);
        if (paramNames != null && paramValues != null) {
            for (int i = 0; i < paramNames.length; i++) {
                SOAPElement param = operationElement.addChildElement(paramNames[i]);
                param.addTextNode(paramValues[i]);
            }
        }
        message.saveChanges();
        return message;
    }

    private String resolveWsdlUrl() {
        String wsdl = System.getenv("FEDERACION_WSDL_URL");
        if (wsdl == null || wsdl.trim().isEmpty()) {
            wsdl = System.getProperty("federacion.wsdl.url");
        }
        if (wsdl == null || wsdl.trim().isEmpty()) {
            wsdl = DEFAULT_WSDL;
        }
        return wsdl;
    }

    private String resolveEndpointUrl() {
        String endpoint = System.getenv("FEDERACION_ENDPOINT_URL");
        if (endpoint == null || endpoint.trim().isEmpty()) {
            endpoint = System.getProperty("federacion.endpoint.url");
        }
        if (endpoint == null || endpoint.trim().isEmpty()) {
            String wsdl = resolveWsdlUrl();
            if (wsdl != null && wsdl.toLowerCase().endsWith("?wsdl")) {
                endpoint = wsdl.substring(0, wsdl.length() - 5);
            } else {
                endpoint = DEFAULT_ENDPOINT;
            }
        }
        return endpoint;
    }

    private List<PartidoFutbolDTO> parsePartidos(SOAPMessage response) throws SOAPException {
        SOAPBody body = response.getSOAPBody();
        NodeList nodes = body.getElementsByTagNameNS("*", "partidos");
        List<PartidoFutbolDTO> items = new ArrayList<>();
        for (int i = 0; i < nodes.getLength(); i++) {
            Node node = nodes.item(i);
            if (node.getNodeType() != Node.ELEMENT_NODE) {
                continue;
            }
            PartidoFutbolDTO dto = new PartidoFutbolDTO();
            dto.setCodigo(findChildText(node, "codigo"));
            dto.setEquipoLocal(findChildText(node, "equipoLocal"));
            dto.setEquipoVisita(findChildText(node, "equipoVisita"));
            dto.setLugar(findChildText(node, "lugar"));
            dto.setFecha(parseDate(findChildText(node, "fecha")));
            items.add(dto);
        }
        return items;
    }

    private List<LocalidadPartidoDTO> parseLocalidades(SOAPMessage response) throws SOAPException {
        SOAPBody body = response.getSOAPBody();
        NodeList nodes = body.getElementsByTagNameNS("*", "localidades");
        List<LocalidadPartidoDTO> items = new ArrayList<>();
        for (int i = 0; i < nodes.getLength(); i++) {
            Node node = nodes.item(i);
            if (node.getNodeType() != Node.ELEMENT_NODE) {
                continue;
            }
            LocalidadPartidoDTO dto = new LocalidadPartidoDTO();
            dto.setCodigoLocalidad(findChildText(node, "codigoLocalidad"));
            dto.setDisponibilidad(parseInt(findChildText(node, "disponibilidad")));
            dto.setPrecio(parseDouble(findChildText(node, "precio")));
            items.add(dto);
        }
        return items;
    }

    private String findChildText(Node parent, String localName) {
        if (!(parent instanceof Element)) {
            return null;
        }
        NodeList children = ((Element) parent).getElementsByTagNameNS("*", localName);
        if (children.getLength() == 0) {
            return null;
        }
        return children.item(0).getTextContent();
    }

    private String findFirstText(SOAPBody body, String localName) {
        if (body == null) {
            return null;
        }
        NodeList nodes = body.getElementsByTagNameNS("*", localName);
        if (nodes.getLength() == 0) {
            return null;
        }
        return nodes.item(0).getTextContent();
    }

    private Date parseDate(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        try {
            return DatatypeConverter.parseDateTime(value).getTime();
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private int parseInt(String value) {
        if (value == null || value.trim().isEmpty()) {
            return 0;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    private double parseDouble(String value) {
        if (value == null || value.trim().isEmpty()) {
            return 0.0;
        }
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException ex) {
            return 0.0;
        }
    }
}
