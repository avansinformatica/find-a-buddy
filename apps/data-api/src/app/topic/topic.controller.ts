import { Body, Controller, Delete, Get, Post } from '@nestjs/common';

import { TopicService } from './topic.service';

import { Topic, TopicUpdate } from '@find-a-buddy/data';
import { InjectToken, Token } from '../auth/token.decorator';

@Controller('topic')
export class TopicController {
    constructor(private readonly topicService: TopicService) {}

    @Get()
    async getAll(): Promise<Topic[]> {
        return this.topicService.getAll();
    }

    @Post()
    async addTopic(@InjectToken() token: Token, @Body() topicUpdate: TopicUpdate) {
        await this.topicService.addTopic(token.id, topicUpdate.title, topicUpdate.role)
    }

    @Delete()
    async removeTopic(@InjectToken() token: Token, @Body() topicUpdate: TopicUpdate) {
        await this.topicService.removeTopic(token.id, topicUpdate.title, topicUpdate.role);
    }
}
