import type { IUser } from '../models/User.js';

declare global {
  namespace Express {
    // authMiddleware attaches the authenticated user to req.user.
    interface Request {
      user?: IUser;
    }
  }
}

export {};
