import { Injectable } from '@nestjs/common';

import { JwtPayload, verify, sign } from 'jsonwebtoken';
import { hash, compare } from 'bcrypt';

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { Identity, IdentityDocument } from '../schemas/identity.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(Identity.name) private identityModel: Model<IdentityDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) {}

    async create(name: string) {
        const user = new this.userModel({name});
        await user.save();
      }

    async verifyToken(token: string): Promise<string | JwtPayload> {
        return new Promise((resolve, reject) => {
            verify(token, process.env.JWT_SECRET, (err, payload) => {
                if (err) reject(err);
                else resolve(payload);
            })
        })
    }

    async registerUser(username: string, password: string) {
        const generatedHash = await hash(password, parseInt(process.env.SALT_ROUNDS, 10));

        const identity = new this.identityModel({username, hash: generatedHash});

        await identity.save();
    }

    async generateToken(username: string, password: string): Promise<string> {
        const user = await this.identityModel.findOne({username});

        if (!user || !(await compare(password, user.hash))) throw new Error("user not authorized");

        return new Promise((resolve, reject) => {
            sign({username}, process.env.JWT_SECRET, (err: Error, token: string) => {
                if (err) reject(err);
                else resolve(token);
            });
        })
    }
}
