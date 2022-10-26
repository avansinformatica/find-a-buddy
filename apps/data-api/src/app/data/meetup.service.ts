import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Meetup, MeetupDocument } from '../schemas/meetup.schema';

@Injectable()
export class MeetupService {
  constructor(@InjectModel(Meetup.name) private meetupModel: Model<MeetupDocument>) {}

  // async getInvites(username: string): Promise<Meetup[]> {
    // return populated meetup schema?
  // }

  // async create(topic: string, datetime: Date, coachUser: string, pupilUser: string) {

  // }

  // async getAll(username: string): Promise<Meetup[]> {
    // return populated meetup schema?
  // }

  // async getOne(username: string, meetupId: string): Promise<Meetup | null> {
    // return populated meetup schema?
  // }

  // async postReview(username: string, meetupId: string, text: string, rating: number) {

  // }
}
