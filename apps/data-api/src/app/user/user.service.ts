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
    // const user = await this.userModel.findOne({id: userId});

    const users = await this.userModel.aggregate([
      // {$match: {
      //   'tutor': user._id
      // }},
      // {match}

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
        $expr: {$eq: ['$_id', '$meetups.tutor']},
      }},
      {$match: {
        $expr: {$gt: ['$meetups.review', null]},
      }},
      {$match: {
        'meetups.accepted': true,
      }},
      {$lookup: {
        from: 'users',
        localField: 'meetups.tutor',
        foreignField: '_id',
        as: 'meetups.tutor',
      }},
      {$unwind: {path: '$meetups.tutor'}},
      {$lookup: {
        from: 'users',
        localField: 'meetups.pupil',
        foreignField: '_id',
        as: 'meetups.pupil',
      }},
      {$unwind: {path: '$meetups.pupil'}},
      {$addFields: {
        reviews: '$meetups.review',
      }},
      {$addFields: {
        'reviews.topic': '$meetups.topic',
        'reviews.datetime': '$meetups.datetime',
        'reviews.tutor': {id: '$meetups.tutor.id', name: '$meetups.tutor.name'},
        'reviews.pupil': {id: '$meetups.pupil.id', name: '$meetups.pupil.name'},
        'reviews.text': '$meetups.review.text',
        'reviews.rating': '$meetups.review.rating',
      }},
      {$project: {
        _id: 0,
        __v: 0,
        meetups: 0,
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

      // {$project: {
      //   reviews: '$meetups',
      // }},
      // {$lookup: {
      //   from: 'users',
      //   localField: 'meetups.tutor',
      //   foreignField: '_id',
      //   as: 'meetups.tutor'
      // }},
      // {$addFields: {
      //   reviews: {$let: {
      //     vars: {user: '$_id'},
      //     in: {$map: {
      //       input: {$filter: {
      //         input: '$meetups', 
      //         as: 'meetup',
      //         cond: {$and: [{$eq: ['$$meetup.tutor', '$$user']}, {$gt: ['$$meetup.review', null]}]}
      //       }},
      //       as: 'meetup',
      //       in: {
      //         id: '$$meetup.id',
      //         pupil: '$$meetup.pupil',
      //         tutor: '$$meetup.tutor',
      //         topic: '$$meetup.topic',
      //         datetime: '$$meetup.datetime',
      //         rating: '$$meetup.review.rating',
      //         text: '$$meetup.review.text',
      //       },
      //     }},
      //   }},
      // }},
      // {$addFields: {
      //   rating: {$avg: '$reviews.rating'},
      // }},
      // {$project: {
      //   _id: 0,
      //   __v: 0,
      //   meetups: 0,
      // }},
    ]);

    console.log(users)

    // return {...user, reviews};
    return users[0];
  }
}
