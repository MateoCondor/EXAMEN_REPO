package ec.edu.monster.service;

public class TicketeraBusinessException extends Exception {

    private static final long serialVersionUID = 1L;

    public TicketeraBusinessException(String message) {
        super(message);
    }

    public TicketeraBusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}
