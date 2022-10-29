import { Controller, Get, Param } from '@nestjs/common';

import { UserService } from '../data-services/user.service';

import { UserSummary, User } from '@find-a-buddy/data';
import { InjectToken, Token } from '../auth/token.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAll(): Promise<UserSummary[]> {
    return this.userService.getAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<User> {
    return this.userService.getOne(id);
  }

  @Get('self')
  async getSelf(@InjectToken() token: Token): Promise<User> {
    return this.userService.getOne(token.id);
  }
}
