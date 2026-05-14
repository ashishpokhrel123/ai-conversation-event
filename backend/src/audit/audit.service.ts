import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) { }

  async log(userId: string, action: string, entityType: string, entityId?: string, metadata?: any) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        metadata,
      },
    });
  }

  async getLogs(userId: string) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
