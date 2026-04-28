export const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
};
/**
 * req.originalUrl — это адрес, на который реально пришёл запрос.

Например, если пользователь открыл несуществующий маршрут:
GET /api/users/123/test
то req.originalUrl = /api/users/123/test
То есть сообщение покажет, какой именно маршрут не найден.
 */ 
