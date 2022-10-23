import { Injectable } from '@nestjs/common';

import { Jwt } from 'jsonwebtoken';

@Injectable()
export class AuthService {
    async verifyToken(token: string): Promise<Jwt> {
        throw Error();
    }

    async registerUser(userName: string, password: string) {
        throw Error();
    }

    async generateToken(userName: string, password: string): Promise<string> {
        throw Error();
    }
}
