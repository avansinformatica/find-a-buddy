import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';

import { ResourceId } from '@find-a-buddy/data';

import { AuthService } from './auth.service';
import { IdentityDTO } from './identity.dto';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() identityDTO: IdentityDTO): Promise<ResourceId> {
        try {
            await this.authService.registerUser(identityDTO.username, identityDTO.password);
    
            return {
                id: await this.authService.createUser(identityDTO.username)
            };
        } catch (e) {
            throw new HttpException('Username invalid', HttpStatus.BAD_REQUEST);
        }
    }

    @Post('login')
    async login(@Body() identityDTO: IdentityDTO): Promise<string> {
        try {
            return await this.authService.generateToken(identityDTO.username, identityDTO.password);
        } catch (e) {
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }
    }
}
