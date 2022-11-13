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
              id: '$$meetup.id',
              topic: '$$meetup.topic',
              datetime: '$$meetup.datetime',
              text: '$$meetup.review.text',
              tutor: '$$meetup.tutor',
              pupil: '$$meetup.pupil',
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
        'reviews.tutor._id': 0,
        'reviews.pupil._id': 0,
      }},
    ]);

    return users[0];
  }
}
