import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';

import { MeetupService } from '../data-services/meetup.service';

import { Meetup, MeetupCreation, ReviewCreation } from '@find-a-buddy/data';
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
  async create(@InjectToken() token: Token, @Body() meetup: MeetupCreation) {
    try {
      await this.meetupService.create(meetup.topic, meetup.datetime, meetup.tutorId, token.id);
    } catch (e) {
      throw new HttpException('invalid meetup', HttpStatus.BAD_REQUEST);
    }
  }

  // @Post('/:id/review')
  // async postReview(@InjectToken() token: Token, @Body() review: ReviewCreation) {

  // }
}
