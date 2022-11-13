import { Controller, Get, Param, Post } from '@nestjs/common';

import { UserService } from './user.service';

import { UserInfo, User } from '@find-a-buddy/data';
import { InjectToken, Token } from '../auth/token.decorator';
import { Neo4jService } from '../neo4j/neo4j.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly neo4jService: Neo4jService) {}

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

  @Get('neo')
  async testNeo(): Promise<unknown> {
    const result = await this.neo4jService.singleRead('MATCH (n)-[r]-(m) RETURN n.name,r,m.name');
    return result.records//.map(r => r.toObject());
  }

  @Get(':id')
  async getOne(@Param('id') id: string): Promise<User> {
    return this.userService.getOne(id);
  }
}
