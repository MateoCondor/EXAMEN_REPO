package ec.edu.monster.service;

import jakarta.xml.ws.WebFault;

@WebFault(name = "BusinessFault")
public class BusinessException extends Exception {

    private static final long serialVersionUID = 1L;

    public BusinessException(String message) {
        super(message);
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}
