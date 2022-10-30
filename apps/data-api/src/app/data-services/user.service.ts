import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { User as UserModel, UserDocument } from '../schemas/user.schema';

import { User, UserInfo } from '@find-a-buddy/data';

@Injectable()
export class UserService {
  constructor(@InjectModel(UserModel.name) private userModel: Model<UserDocument>) {}

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
              cond: {$and: [{$eq: ['$$meetup.tutor', '$$user']}, {$gt: ['$$meetup.review', null]}]}
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
              cond: {$and: [{$eq: ['$$meetup.tutor', '$$user']}, {$gt: ['$$meetup.review', null]}]}
            }},
            as: 'meetup',
            in: {
              id: '$$meetup.id',
              pupil: '$$meetup.pupil',
              tutor: '$$meetup.tutor',
              topic: '$$meetup.topic',
              datetime: '$$meetup.datetime',
              rating: '$$meetup.review.rating',
              text: '$$meetup.review.text',
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
      }},
    ]);

    return users[0];
  }
}
