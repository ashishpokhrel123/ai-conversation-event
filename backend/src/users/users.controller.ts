import { Controller, Get, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get('profile')
  getProfile(@Req() req: Request & { user: { userId: string } }) {
    return this.usersService.findById(req.user.userId);
  }

  @Delete('me')
  async deleteAccount(@Req() req: Request & { user: { userId: string } }) {
    return this.usersService.remove(req.user.userId);
  }
}
