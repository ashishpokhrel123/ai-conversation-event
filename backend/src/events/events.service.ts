import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Event } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class EventsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async findAll(userId: string, status?: string, page: number = 1, limit: number = 10) {
    const where: any = { userId };
    if (status && ['DRAFT', 'SCHEDULED', 'PUBLISHED'].includes(status)) {
      where.status = status;
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      data: events,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) throw new NotFoundException('Event not found');
    if (event.userId !== userId) throw new ForbiddenException('You do not own this event');

    return event;
  }

  async create(userId: string, data: Prisma.EventCreateWithoutUserInput) {
    const event = await this.prisma.event.create({
      data: {
        ...data,
        userId,
      },
    });
    await this.audit.log(userId, 'CREATE_EVENT', 'Event', event.id, data);
    return event;
  }

  async update(id: string, userId: string, data: Prisma.EventUpdateInput) {
    await this.findOne(id, userId); // Check ownership
    const event = await this.prisma.event.update({
      where: { id },
      data,
    });
    await this.audit.log(userId, 'UPDATE_EVENT', 'Event', id, data);
    return event;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId); // Check ownership
    const event = await this.prisma.event.delete({
      where: { id },
    });
    await this.audit.log(userId, 'DELETE_EVENT', 'Event', id);
    return event;
  }

  async duplicate(id: string, userId: string) {
    const event = await this.findOne(id, userId);
    const { id: _, createdAt: __, updatedAt: ___, roles, ...rest } = event;
    
    const newEvent = await this.prisma.event.create({
      data: {
        ...rest,
        roles: roles as any, // Ensures compatibility after schema change
        name: `${rest.name} (Copy)`,
        status: 'DRAFT',
      },
    });
    await this.audit.log(userId, 'DUPLICATE_EVENT', 'Event', newEvent.id, { originalId: id });
    return newEvent;
  }
}
