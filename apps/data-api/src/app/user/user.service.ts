import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { User as UserModel, UserDocument } from './user.schema';
import { Meetup, MeetupDocument } from '../meetup/meetup.schema';

import { User, UserInfo } from '@find-a-buddy/data';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
    @InjectModel(Meetup.name) private meetupModel: Model<MeetupDocument>) {}

  async getAll(): Promise<UserInfo[]> {
    return this.userModel.aggregate([
      {$lookup: {
        from: 'meetups',
        localField: 'meetups',
        foreignField: '_id',
        as: 'meetups',
      }},
      {$addFields: {
        reviews: {$let: {
          vars: {user: '$_id'},
          in: {$map: {
            input: {$filter: {
              input: '$meetups', 
              as: 'meetup',
              cond: {$and: [{$eq: ['$$meetup.tutorRef', '$$user']}, {$gt: ['$$meetup.review', null]}]}
            }},
            as: 'meetup',
            in: {
              rating: '$$meetup.review.rating',
            },
          }},
        }},
      }},
      {$addFields: {
        rating: {$avg: '$reviews.rating'},
      }},
      {$project: {
        _id: 0,
        __v: 0,
        meetups: 0,
        reviews: 0,
      }},
    ]);
  }

  async getOne(userId: string): Promise<User | null> {
    const users = await this.userModel.aggregate([
      {$match: {
        id: userId,
      }},
      {$lookup: {
        from: 'meetups',
        localField: 'meetups',
        foreignField: '_id',
        as: 'meetups',
      }},
      {$unwind: {path: '$meetups', preserveNullAndEmptyArrays: true}},
      {$match: {
        $expr: {$eq: ['$_id', '$meetups.tutorRef']},
      }},
      {$match: {
        $expr: {$gt: ['$meetups.review', null]},
      }},
      {$match: {
        'meetups.accepted': true,
      }},
      {$addFields: {
        reviews: '$meetups.review',
      }},
      {$addFields: {
        'reviews.id': '$meetups.id',
        'reviews.datetime': '$meetups.datetime',
        'reviews.topic': '$meetups.topic',
        'reviews.tutor': '$meetups.tutor',
        'reviews.pupil': '$meetups.pupil',
      }},
      {$group: {
        _id: '$id',
        id: {$first: '$id'},
        name: {$first: '$name'},
        tutorTopics: {$first: '$tutorTopics'},
        pupilTopics: {$first: '$pupilTopics'},
        rating: {$avg: '$reviews.rating'},
        reviews: {$push: '$reviews'},
      }},
      {$project: {
        _id: 0,
        __v: 0,
        'reviews._id': 0,
        'reviews.tutor._id': 0,
        'reviews.pupil._id': 0,
      }},
    ]);

    return users[0];
  }
}
