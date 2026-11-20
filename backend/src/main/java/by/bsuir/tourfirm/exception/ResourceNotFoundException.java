package by.bsuir.tourfirm.exception;

/** Ресурс не найден (404). */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
