import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';

import { MeetupService } from './meetup.service';

import { Meetup, MeetupCreation, ResourceId, Review } from '@find-a-buddy/data';
import { InjectToken, Token } from '../auth/token.decorator';

@Controller('meetup')
export class MeetupController {
  constructor(private readonly meetupService: MeetupService) {}

  @Get('invite')
  async getInvites(@InjectToken() token: Token): Promise<Meetup[]> {
    return this.meetupService.getInvites(token.id);
  }

  @Get()
  async getMeetups(@InjectToken() token: Token): Promise<Meetup[]> {
    return this.meetupService.getAll(token.id);
  }

  @Get(':id')
  async getMeetup(@InjectToken() token: Token, @Param('id') id: string): Promise<Meetup> {
    return this.meetupService.getOne(token.id, id);
  }

  @Post()
  async create(@InjectToken() token: Token, @Body() meetup: MeetupCreation): Promise<ResourceId> {
    try {
      return await this.meetupService.create(meetup.topic, meetup.datetime, meetup.tutorId, token.id);
    } catch (e) {
      throw new HttpException('invalid meetup', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/:id/accept')
  async acceptInvite(@InjectToken() token: Token, @Param('id') id: string) {
    try{
      await this.meetupService.acceptInvite(token.id, id);
    } catch (e) {
      throw new HttpException('invalid invite accept', HttpStatus.BAD_REQUEST);
    }
  }

  @Post('/:id/review')
  async postReview(@InjectToken() token: Token, @Param('id') id: string, @Body() review: Review) {
    try {
      await this.meetupService.postReview(token.id, id, review.text, review.rating);
    } catch (e) {
      throw new HttpException('invalid review', HttpStatus.BAD_REQUEST);
    }
  }
}
