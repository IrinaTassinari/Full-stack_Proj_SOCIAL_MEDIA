import type { IUser } from '../models/User.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export {};

/**
 *  import type { IUser } from '../models/User.js' -  Берём тип пользователя из модели
 * declare global - Говорим TypeScript: “я хочу расширить глобальные типы”
 * namespace Express - Идём в типы Express
 * interface Request - Расширяем стандартный Request
 * Теперь TypeScript будет понимать: req.user = user
 * 
 * user?  потому что не на всех маршрутах пользователь есть. Например публичный маршрут /login не имеет req.user
 */