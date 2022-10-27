import { Body, Controller, Post } from '@nestjs/common';

import { ResourceId } from '@find-a-buddy/data';

import { AuthService } from './auth.service';
import { IdentityDTO } from './identity.dto';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    async register(@Body() identityDTO: IdentityDTO): Promise<ResourceId> {
        await this.authService.registerUser(identityDTO.username, identityDTO.password);

        return {
            id: await this.authService.createUser(identityDTO.username)
        };
    }

    @Post('login')
    async login(@Body() identityDTO: IdentityDTO): Promise<string> {
        return await this.authService.generateToken(identityDTO.username, identityDTO.password);
    }
}
