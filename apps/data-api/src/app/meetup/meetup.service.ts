import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Meetup, ResourceId } from '@find-a-buddy/data';
import { Meetup as MeetupModel, MeetupDocument } from './meetup.schema';
import { User, UserDocument } from '../user/user.schema';
import { TopicService } from '../topic/topic.service';

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
      .find({tutorRef: user._id, accepted: false}, {_id: 0, __v: 0, tutorRef: 0, pupilRef: 0, 'tutor._id': 0, 'pupil._id': 0});
  }

  async create(topic: string, datetime: Date, tutorUserId: string, pupilUserId: string): Promise<ResourceId> {
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
      tutorRef: tutor._id,
      pupilRef: pupil._id,
      tutor: {id: tutor.id, name: tutor.name},
      pupil: {id: pupil.id, name: pupil.name},
    });

    tutor.meetups.push(meetup);
    pupil.meetups.push(meetup);

    await Promise.all([meetup.save(), tutor.save(), pupil.save()]);

    return {id: meetup.id};
  }

  async getAll(userId: string): Promise<Meetup[]> {
    const user = await this.userModel.findOne({id: userId});
    
    if (user == null) return [];

    return this.meetupModel
      .find({$or: [{tutorRef: user._id, accepted: true}, {pupilRef: user._id}]}, 
        {_id: 0, __v: 0, "review._id": 0, "review.__v": 0, tutorRef: 0, pupilRef: 0, 'tutor._id': 0, 'pupil._id': 0});
      // .populate('tutorRef', {id: 1, name: 1, _id: 0})
      // .populate('pupilRef', {id: 1, name: 1, _id: 0});
  }

  async getOne(userId: string, meetupId: string): Promise<Meetup | null> {
    const user = await this.userModel.findOne({id: userId});

    if (user == null) return null;

    return this.meetupModel
      .findOne({$and: [{id: meetupId}, {$or: [{tutorRef: user._id}, {pupilRef: user._id}]}]}, 
        {_id: 0, __v: 0, "review._id": 0, "review.__v": 0, tutorRef: 0, pupilRef: 0, 'tutor._id': 0, 'pupil._id': 0});
  }

  async acceptInvite(userId: string, meetupId: string) {
    const user = await this.userModel.findOne({id: userId});
    const result = await this.meetupModel.updateOne({id: meetupId, tutorRef: user._id}, {accepted: true});
    
    if (result.modifiedCount == 0) {
      throw new Error('not accepted');
    }
  }

  async postReview(userId: string, meetupId: string, text: string, rating: number) {
    const meetup = await this.meetupModel.findOne({id: meetupId}).populate('pupilRef');

    if (meetup.pupilRef.id != userId) throw new Error('user not authorized');

    if (meetup.review) throw new Error('already reviewed');

    meetup.review = {text, rating};

    await meetup.save();
  }
}
