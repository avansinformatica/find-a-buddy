import { Injectable } from '@nestjs/common';

import { JwtPayload, verify } from 'jsonwebtoken';

@Injectable()
export class AuthService {
    async verifyToken(token: string): Promise<string | JwtPayload> {
        return new Promise((resolve, reject) => {
            verify(token, process.env.JWT_SECRET, (err, payload) => {
                if (err) reject(err);
                else resolve(payload);
            })
        })
    }

    async registerUser(userName: string, password: string) {
        throw Error();
    }

    async generateToken(userName: string, password: string): Promise<string> {
        throw Error();
    }
}
