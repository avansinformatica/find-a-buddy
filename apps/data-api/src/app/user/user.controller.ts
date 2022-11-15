import { Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { UserService } from './user.service';

import { UserInfo, User, ResourceId } from '@find-a-buddy/data';
import { InjectToken, Token } from '../auth/token.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAll(): Promise<UserInfo[]> {
    return this.userService.getAll();
  }

  // this method should precede the general getOne method, otherwise it never matches
  @Get('self')
  async getSelf(@InjectToken() token: Token): Promise<User> {
    const result = await this.userService.getOne(token.id);
    return result;
  }

  @Post(':id/invite')
  async inviteFriend(@InjectToken() token: Token, @Param('id') otherId: string): Promise<ResourceId> {
    return this.userService.inviteFriend(token.id, otherId);
  }

  @Post(':id/accept')
  async acceptInvite(@Param('id') inviteId: string) {
    await this.userService.acceptInvite(inviteId);
  }

  @Delete(':id/friend')
  async removeFriend(@InjectToken() token: Token, @Param('id') other: string) {
    await this.userService.removeFriend(token.id, other);
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<User> {
    return this.userService.getOne(id);
  }
}
