import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { DataModule } from './data.module';

@Module({
  imports: [
    MongooseModule.forRoot(`mongodb+srv://${process.env.MONGO_USR}:${process.env.MONGO_PWD}@cluster0.hwy4fv7.mongodb.net/buddy?retryWrites=true&w=majority`),
    AuthModule,
    DataModule,
    RouterModule.register([{
      path: 'auth-api',
      module: AuthModule,
    }, {
      path: 'data-api',
      module: DataModule,
    }]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
