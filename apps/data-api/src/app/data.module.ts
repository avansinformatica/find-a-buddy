import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TopicController } from './data-controllers/topic.controller';
import { MeetupService } from './data-services/meetup.service';
import { TopicService } from './data-services/topic.service';
import { UserService } from './data-services/user.service';

import { User, UserSchema } from './schemas/user.schema';
import { Topic, TopicSchema } from './schemas/topic.schema';
import { Meetup, MeetupSchema } from './schemas/meetup.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Topic.name, schema: TopicSchema },
      { name: Meetup.name, schema: MeetupSchema }]),
  ],
  controllers: [TopicController],
  providers: [
    UserService,
    TopicService,
    MeetupService,
  ],
})
export class DataModule {}
