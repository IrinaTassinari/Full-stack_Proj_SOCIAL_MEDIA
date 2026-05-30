import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
function generateToken(userId) {
    const token = jwt.sign({
        id: userId,
    }, env.jwtSecret, {
        expiresIn: '2h'
    });
    return token;
}
export default generateToken;
