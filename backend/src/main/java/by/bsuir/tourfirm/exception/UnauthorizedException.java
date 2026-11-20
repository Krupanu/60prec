package by.bsuir.tourfirm.exception;

/** Ошибка аутентификации (401): неверные учётные данные, отсутствует токен. */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
