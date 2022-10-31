import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TopicController } from './topic/topic.controller';
import { MeetupService } from './meetup/meetup.service';
import { TopicService } from './topic/topic.service';
import { UserService } from './user/user.service';

import { User, UserSchema } from './user/user.schema';
import { Topic, TopicSchema } from './topic/topic.schema';
import { Meetup, MeetupSchema } from './meetup/meetup.schema';
import { UserController } from './user/user.controller';
import { MeetupController } from './meetup/meetup.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Topic.name, schema: TopicSchema },
      { name: Meetup.name, schema: MeetupSchema }]),
  ],
  controllers: [
    MeetupController,
    TopicController,
    UserController,
  ],
  providers: [
    UserService,
    TopicService,
    MeetupService,
  ],
})
export class DataModule {}
