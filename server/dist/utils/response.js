/**
 * Это утилита, чтобы все ответы API были в одном стиле.
 * Например вместо того, чтобы в каждом контроллере писать:
  res.status(200).json({
  success: true,
  message: 'User created',
  data: user,
});
можно  писать короче:
sendSuccess(res, 200, 'User created', user);

 Единый формат успешного ответа - Это помогает держать API аккуратным и предсказуемым
 Дженерик <T> позволяет передавать любые данные:объект, массив, null и т.д.
 
 */
export const sendSuccess = (res, statusCode, message, data = null) => {
    const payload = {
        success: true,
        message,
        data
    };
    return res.status(statusCode).json(payload);
};
// Единый формат ответа с ошибкой
export const sendError = (res, statusCode, message) => {
    const payload = {
        success: false,
        message
    };
    return res.status(statusCode).json(payload);
};
