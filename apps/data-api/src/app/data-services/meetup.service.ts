import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Meetup } from '@find-a-buddy/data';
import { Meetup as MeetupModel, MeetupDocument } from '../schemas/meetup.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { TopicService } from './topic.service';

@Injectable()
export class MeetupService {
  constructor(
    @InjectModel(MeetupModel.name) private meetupModel: Model<MeetupDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private topicService: TopicService,
  ) {}

  async getInvites(userId: string): Promise<Meetup[]> {
    const user = await this.userModel.findOne({id: userId});
    
    if (user == null) return [];

    return this.meetupModel
      .find({tutor: user._id, accepted: false}, {_id: 0, __v: 0})
      .populate('tutor', {id: 1, name: 1, _id: 0})
      .populate('pupil', {id: 1, name: 1, _id: 0});
  }

  async create(topic: string, datetime: Date, tutorUserId: string, pupilUserId: string) {
    // await this.topicService.ensureExists(topic);

    const tutor = await this.userModel.findOne({id: tutorUserId});
    const pupil = await this.userModel.findOne({id: pupilUserId});

    if (!tutor || !pupil) {
      throw new Error('user not found');
    }

    if (!tutor.tutorTopics.find(t => t == topic) || !pupil.pupilTopics.find(t => t == topic)) {
      throw new Error('invalid meetup');
    }

    const meetup = new this.meetupModel({
      datetime,
      topic,
      tutor: tutor._id,
      pupil: pupil._id,
    });

    tutor.meetups.push(meetup);
    pupil.meetups.push(meetup);

    await Promise.all([meetup.save(), tutor.save(), pupil.save()]);
  }

  async getAll(userId: string): Promise<Meetup[]> {
    const user = await this.userModel.findOne({id: userId});
    
    if (user == null) return [];

    return this.meetupModel
      .find({$or: [{tutor: user._id, accepted: true}, {pupil: user._id}]}, {_id: 0, __v: 0})
      .populate('tutor', {id: 1, name: 1, _id: 0})
      .populate('pupil', {id: 1, name: 1, _id: 0});
  }

  async getOne(userId: string, meetupId: string): Promise<Meetup | null> {
    const user = await this.userModel.findOne({id: userId});

    if (user == null) return null;

    return this.meetupModel
      .findOne({$and: [{id: meetupId}, {$or: [{tutor: user._id}, {pupil: user._id}]}]}, {_id: 0, __v: 0})
      .populate('tutor', {id: 1, name: 1, _id: 0})
      .populate('pupil', {id: 1, name: 1, _id: 0});
  }

  async postReview(userId: string, meetupId: string, text: string, rating: number) {
    const meetup = await this.meetupModel.findOne({id: meetupId}).populate('pupil');

    if (meetup.pupil.id != userId) throw new Error('user not authorized');

    if (meetup.review) throw new Error('already reviewed');

    meetup.review = {text, rating};

    await meetup.save();
  }
}
