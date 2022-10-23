import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Identity, IdentitySchema } from './identity.schema';

// import { CatsController } from './cats.controller';
// import { CatsService } from './cats.service';
// import { Cat, CatSchema } from './schemas/cat.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Identity.name, schema: IdentitySchema }])],
  controllers: [CatsController],
  providers: [CatsService],
})
export class CatsModule {}