import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { DataModule } from './data.module';

@Module({
  imports: [
    MongooseModule.forRoot(`mongodb+srv://${process.env.MONGO_USR}:${process.env.MONGO_PWD}@cluster0.hwy4fv7.mongodb.net/buddy?retryWrites=true&w=majority`),
    AuthModule,
    DataModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
