import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FollowDto } from './dto/follow-action.dto';

@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) {}

  async followUser(userId: number, data: FollowDto) {
    if (userId === data.followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const userToFollow = await this.prisma.user.findUnique({
      where: { id: data.followingId },
    });

    if (!userToFollow) {
      throw new NotFoundException('User to follow not found');
    }

    const follower = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!follower) {
      throw new NotFoundException('Follower not found');
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: data.followingId,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    await this.prisma.follow.create({
      data: {
        followerId: userId,
        followingId: data.followingId,
      },
    });

    return;
  }

  async unfollowUser(followerId: number, followingId: number) {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: followingId,
        },
      },
    });

    if (!follow) {
      throw new NotFoundException('Follow relationship not found');
    }

    await this.prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: followingId,
        },
      },
    });

    return { message: 'Successfully unfollowed user' };
  }

  async getFollowing(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
      },
    });

    const usersWithFollowing = await Promise.all(
      follows.map(async (follow) => {
        const followingUser = follow.following;

        const userFollows = await this.prisma.follow.findMany({
          where: { followerId: followingUser.id },
          select: { followingId: true },
        });

        const userFollowingIds = userFollows.map((f) =>
          f.followingId.toString(),
        );

        return {
          id: followingUser.id.toString(),
          username: followingUser.username,
          avatar: followingUser.avatar || '',
          bio: followingUser.bio || '',
          following: userFollowingIds,
        };
      }),
    );

    return usersWithFollowing;
  }
}
