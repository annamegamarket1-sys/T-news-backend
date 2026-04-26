import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(query: string, type: 'users' | 'posts') {
    if (!query || query.trim() === '') {
      throw new BadRequestException('Search query is required');
    }

    if (!['users', 'posts'].includes(type)) {
      throw new BadRequestException('Type must be "users" or "posts"');
    }

    const searchTerm = `%${query.trim()}%`;

    if (type === 'users') {
      return await this.searchUsers(searchTerm);
    } else {
      return await this.searchPosts(searchTerm);
    }
  }

  private async searchUsers(searchTerm: string) {
    const users = await this.prisma.user.findMany({
      where: { 
        username: {
          contains: searchTerm,
          mode: 'insensitive',
        }
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        bio: true,
      },
      orderBy: {
        username: 'asc',
      },
    });

    return users;
  }

  private async searchPosts(searchTerm: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        content: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    return posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      content: post.content,
      user: post.user,
      likes: post._count.likes,
      comments: post._count.comments,
    }));
  }
}
