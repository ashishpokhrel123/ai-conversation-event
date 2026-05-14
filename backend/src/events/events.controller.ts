import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Request } from 'express';

@Controller('events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(
    @Req() req: Request & { user: { userId: string } },
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.eventsService.findAll(
      req.user.userId,
      status,
      parseInt(page || '1', 10),
      parseInt(limit || '10', 10),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request & { user: { userId: string } }) {
    return this.eventsService.findOne(id, req.user.userId);
  }

  @Post()
  create(@Req() req: Request & { user: { userId: string } }, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(req.user.userId, createEventDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req: Request & { user: { userId: string } }, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, req.user.userId, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request & { user: { userId: string } }) {
    return this.eventsService.remove(id, req.user.userId);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @Req() req: Request & { user: { userId: string } }) {
    return this.eventsService.duplicate(id, req.user.userId);
  }
}
