package by.bsuir.tourfirm.exception;

/** Доступ запрещён (403): операция над чужим ресурсом. */
public class ForbiddenException extends RuntimeException {

    public ForbiddenException(String message) {
        super(message);
    }
}
