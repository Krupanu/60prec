package by.bsuir.tourfirm.exception;

/** Некорректный запрос / нарушение бизнес-правил (400). */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
