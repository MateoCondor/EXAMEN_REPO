package ec.edu.monster.model.exceptions;

public class ApiException extends RuntimeException {
    public ApiException(String message) {
        super(message);
    }

    public ApiException(String message, Throwable e) {
        super(message, e);
    }
}
