import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';

import { ResourceId, Token, UserCredentials, UserRegistration } from '@find-a-buddy/data';

import { AuthService } from './auth.service';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() credentials: UserRegistration): Promise<ResourceId> {
        try {
            await this.authService.registerUser(credentials.username, credentials.password, credentials.emailAddress);
    
            return {
                id: await this.authService.createUser(credentials.username, credentials.emailAddress),
            };
        } catch (e) {
            throw new HttpException('Username invalid', HttpStatus.BAD_REQUEST);
        }
    }

    @Post('login')
    async login(@Body() credentials: UserCredentials): Promise<Token> {
        try {
            return {
                token: await this.authService.generateToken(credentials.username, credentials.password)
            };
        } catch (e) {
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }
    }
}
