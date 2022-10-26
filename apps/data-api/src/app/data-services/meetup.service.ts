import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Meetup, MeetupDocument } from '../schemas/meetup.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { TopicService } from './topic.service';

@Injectable()
export class MeetupService {
  constructor(
    @InjectModel(Meetup.name) private meetupModel: Model<MeetupDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private topicService: TopicService,
  ) {}

  async getInvites(userId: string): Promise<Meetup[]> {
    // TODO use user service
    const user = await this.userModel.findOne({id: userId});
    
    if (user == null) return [];

    return this.meetupModel
      .find({coach: user._id, accepted: false}, {_id: 0, __v: 0})
      .populate('coach', {id: 1, name: 1, _id: 0})
      .populate('pupil', {id: 1, name: 1, _id: 0});
  }

  async create(topic: string, datetime: Date, coachUserId: string, pupilUserId: string) {
    await this.topicService.ensureExists(topic);

    // TODO use user service
    const coach = await this.userModel.findOne({id: coachUserId});
    const pupil = await this.userModel.findOne({id: pupilUserId});

    const meetup = new this.meetupModel({
      datetime,
      topic,
      coach: coach._id,
      pupil: pupil._id,
    });

    await meetup.save();
  }

  async getAll(userId: string): Promise<Meetup[]> {
    // TODO use user service
    const user = await this.userModel.findOne({id: userId});
    
    if (user == null) return [];

    return this.meetupModel
      .find({$or: [{coach: user._id, accepted: true}, {pupil: user._id}]}, {_id: 0, __v: 0})
      .populate('coach', {id: 1, name: 1, _id: 0})
      .populate('pupil', {id: 1, name: 1, _id: 0});
  }

  async getOne(userId: string, meetupId: string): Promise<Meetup | null> {
    // TODO use user service
    const user = await this.userModel.findOne({id: userId});

    if (user == null) return null;

    return this.meetupModel
      .findOne({$and: [{id: meetupId}, {$or: [{coach: user._id}, {pupil: user._id}]}]}, {_id: 0, __v: 0})
      .populate('coach', {id: 1, name: 1, _id: 0})
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
