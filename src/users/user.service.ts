import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs/promises';
import { join } from 'path';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    if (!data.username || data.username.trim() === '') {
      throw new BadRequestException('Username is required');
    }

    if (!data.password || data.password.trim() === '') {
      throw new BadRequestException('Password is required');
    }

    if (data.password.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long',
      );
    }

    if (data.password.length > 50) {
      throw new BadRequestException('Password must not exceed 50 characters');
    }

    const username = data.username.trim();

    if (username.length < 3) {
      throw new BadRequestException(
        'Username must be at least 3 characters long',
      );
    }

    if (username.length > 50) {
      throw new BadRequestException('Username must not exceed 50 characters');
    }

    const existing = await this.prisma.user.findUnique({
      where: { username: username },
    });

    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await this.prisma.user.create({
      data: {
        username: username,
        passwordHash,
        avatar: data.avatar?.trim(),
        bio: data.bio?.trim(),
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
      },
    });

    return {
      userId: user.id,
    };
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
      },
    });
    return users;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const follows = await this.prisma.follow.findMany({
      where: { followerId: id },
      select: {
        followingId: true,
      },
    });

    const followingIds = follows.map((follow) => follow.followingId.toString());

    return {
      ...user,
      id: user.id.toString(),
      following: followingIds,
    };
  }

  async update(id: number, data: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = {};

    if (data.username !== undefined) {
      const username = data.username.trim();

      if (username === '') {
        throw new BadRequestException('Username cannot be empty');
      }

      if (username.length < 3) {
        throw new BadRequestException(
          'Username must be at least 3 characters long',
        );
      }

      if (username.length > 50) {
        throw new BadRequestException('Username must not exceed 50 characters');
      }

      if (username !== user.username) {
        const existing = await this.prisma.user.findUnique({
          where: { username: username },
        });
        if (existing) {
          throw new ConflictException('Username already taken');
        }
      }

      updateData.username = username;
    }

    if (data.avatar !== undefined) {
      updateData.avatar = data.avatar.trim() || null;
    }

    if (data.bio !== undefined) {
      updateData.bio = data.bio.trim() || null;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
      },
    });

    const follows = await this.prisma.follow.findMany({
      where: { followerId: id },
      select: {
        followingId: true,
      },
    });

    const followingIds = follows.map((follow) => follow.followingId.toString());

    return {
      ...updated,
      following: followingIds,
    };
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted' };
  }

  async updateAvatar(id: number, avatarFilename: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatar) {
      try {
        const oldAvatarPath = join(
          process.cwd(),
          'dist',
          'public',
          user.avatar,
        );
        await fs.unlink(oldAvatarPath);
      } catch (error) {
        console.warn(error.message);
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        avatar: avatarFilename,
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
      },
    });
    
    return updatedUser;
  }
}
