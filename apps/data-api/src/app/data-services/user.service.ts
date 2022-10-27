import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getAll(): Promise<User[]> {
    return this.userModel.find({}, {_id: 0, __v: 0, meetups: 0});
  }

  async getOne(userId: string): Promise<User | null> {
    return this.userModel.findOne({id: userId}, {_id: 0, __v: 0, meetups: 0});
  }
}
