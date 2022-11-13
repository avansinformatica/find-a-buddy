import { MiddlewareConsumer, Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';

import { MongooseModule } from '@nestjs/mongoose';

import { AuthModule } from './auth/auth.module';
import { TokenMiddleware } from './auth/token.middleware';
import { DataModule } from './data.module';
import { Neo4jModule } from './neo4j/neo4j.module';
import { RcmdModule } from './rmcd.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGO_USR}:${process.env.MONGO_PWD}@${process.env.MONGO_HOST}/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`
    ),
    Neo4jModule.forRoot({
      scheme: 'neo4j+s',
      host: process.env.NEO4J_HOST,
      username: process.env.NEO4J_USR,
      password: process.env.NEO4J_PWD,
      database: process.env.NEO4J_DATABASE,
    }),
    AuthModule,
    DataModule,
    RcmdModule,
    RouterModule.register([
      {
        path: 'auth-api',
        module: AuthModule,
      },
      {
        path: 'data-api',
        module: DataModule,
      },
      {
        path: 'rcmd-api',
        module: RcmdModule,
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenMiddleware).forRoutes('data-api');
    consumer.apply(TokenMiddleware).forRoutes('rcmd-api');
  }
}
