import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Topic, TopicDocument } from '../topic/topic.schema';
import { User, UserDocument } from '../user/user.schema';
import { Role } from '@find-a-buddy/data';

@Injectable()
export class TopicService {
  constructor(
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async ensureExists(topic: string) {
    try {
      await this.topicModel.create({title: topic});
    // eslint-disable-next-line no-empty
    } catch (e) {}
  }

  async getAll(): Promise<Topic[]> {
    return this.topicModel.find({}, {_id: 0, __v: 0});
  }

  async addTopic(userId: string, topic: string, role: Role) {
    await this.ensureExists(topic);

    if (role == 'tutor') {
      await this.userModel.updateOne({id: userId}, {$addToSet: {tutorTopics: topic}});
    } else {
      await this.userModel.updateOne({id: userId}, {$addToSet: {pupilTopics: topic}});
    }
  }

  async removeTopic(userId: string, topic: string, role: Role) {
    if (role == 'tutor') {
      await this.userModel.updateOne({id: userId}, {$pull: {tutorTopics: topic}});
    } else {
      await this.userModel.updateOne({id: userId}, {$pull: {pupilTopics: topic}});
    }
  }
}
