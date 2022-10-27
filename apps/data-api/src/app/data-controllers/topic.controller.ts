import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { TopicService } from '../data-services/topic.service';

import { Topic } from '@find-a-buddy/data';
import { Role } from '../schemas/roles';

@Controller('topic')
export class TopicController {
    constructor(private readonly topicService: TopicService) {}

    @Get()
    async getAll(): Promise<Topic[]> {
        return this.topicService.getAll();
    }

    @Post(':id')
    async addTopic(@Body() topicChange: {role: Role}, @Param('id') topicId: string) {
        // await this.topicService.addTopic(, topic, topicChange.role) // ugh...
    }

    // @Delete(':id')
    // async removeTopic() {

    // }
}
