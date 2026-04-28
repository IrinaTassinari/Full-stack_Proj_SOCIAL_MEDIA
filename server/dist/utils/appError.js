/**
AppError нужен для своих “ожидаемых” ошибок API.
Например, если пользователь запрашивает несуществующий маршрут, это не ошибка сервера 500, а нормальная API-ошибка 404.
Без AppError в errorHandler трудно понять, какой статус отправлять клиенту

  // Восстанавливаем корректную цепочку прототипов.
  // Это полезно при работе с наследованием Error в TypeScript.
  Object.setPrototypeOf(this, AppError.prototype);
 */
// AppError наследуется от стандартной ошибки Error
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
