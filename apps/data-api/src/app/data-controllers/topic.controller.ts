import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { TopicService } from '../data-services/topic.service';

import { ResourceId, Topic, TopicUpdate } from '@find-a-buddy/data';

@Controller('topic')
export class TopicController {
    constructor(private readonly topicService: TopicService) {}

    @Get()
    async getAll(): Promise<Topic[]> {
        return this.topicService.getAll();
    }

    // @Post()
    // async addTopic(@Body() topicUpdate: TopicUpdate): Promise<ResourceId> {
    //     // await this.topicService.addTopic(, topic, topicChange.role) // ugh...
    // }

    // @Delete(':id')
    // async removeTopic(@Body() topicUpdate: TopicUpdate, @Param('id') topicId: string): Promise<ResourceId> {
    //     // return the removed topic id on success
    // }
}
