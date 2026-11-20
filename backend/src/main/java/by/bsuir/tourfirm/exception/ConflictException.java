package by.bsuir.tourfirm.exception;

/** Бизнес-конфликт (409): дубликат, исчерпанный промокод, повторный отзыв. */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
