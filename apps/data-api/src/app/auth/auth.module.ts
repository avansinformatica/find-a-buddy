import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import { Identity, IdentitySchema } from '../schemas/identity.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Identity.name, schema: IdentitySchema }])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}