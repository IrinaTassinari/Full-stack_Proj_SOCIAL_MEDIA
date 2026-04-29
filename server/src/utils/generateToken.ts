// ф-я генерации JWT  - эта ф-я принимает пользователя и возвращает токен

import jwt from 'jsonwebtoken'
import {env} from '../config/env.js'

function generateToken(userId: string): string{
    const token = jwt.sign(
        {
            id: userId,
        },
        env.jwtSecret,
        {
            expiresIn: '2h'
        }
    )
    return token
}

export default generateToken