import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowDto } from './dto/follow-action.dto';

@Controller('users')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':userId/follow')
  @HttpCode(HttpStatus.CREATED)
  followUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() followDto: FollowDto,
  ) {
    return this.followsService.followUser(userId, followDto);
  }

  @Delete(':userId/follow')
  @HttpCode(HttpStatus.NO_CONTENT)
  unfollowUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body('unfollowingId', ParseIntPipe) unfollowingId: number,
  ) {
    return this.followsService.unfollowUser(userId, unfollowingId);
  }

  @Get(':userId/following')
  getFollowing(@Param('userId', ParseIntPipe) userId: number) {
    return this.followsService.getFollowing(userId);
  }
}
