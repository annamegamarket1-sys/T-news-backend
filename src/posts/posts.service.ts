import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async getAllPosts() {
    const posts = await this.prisma.post.findMany({
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
      id: post.id.toString(),
      userId: post.userId.toString(),
      content: post.content,
      likes: post._count.likes,
      comments: post._count.comments,
      username: post.user.username,
      avatar: post.user.avatar,
    }));
  }

  async getUserPosts(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const posts = await this.prisma.post.findMany({
      where: { userId },
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
      id: post.id.toString(),
      userId: post.userId.toString(),
      content: post.content,
      likes: post._count.likes,
      comments: post._count.comments,
      username: post.user.username,
      avatar: post.user.avatar,
    }));
  }

  async createPost(userId: number, data: CreatePostDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const post = await this.prisma.post.create({
      data: {
        userId,
        content: data.content,
      },
      include: {
        user: {
          select: {
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
    });

    return {
      id: post.id.toString(),
      userId: post.userId.toString(),
      content: post.content,
      likes: post._count.likes,
      comments: post._count.comments,
      username: post.user.username,
      avatar: post.user.avatar,
    };
  }

  async getPost(postId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
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
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      id: post.id.toString(),
      userId: post.userId.toString(),
      content: post.content,
      likes: post._count.likes,
      comments: post._count.comments,
      username: post.user.username,
      avatar: post.user.avatar || '',
    };
  }

  async deletePost(postId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    await this.prisma.comment.deleteMany({
      where: { postId: postId },
    });

    await this.prisma.like.deleteMany({
      where: { postId: postId },
    });

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return null;
  }

  async likePost(postId: number, userId: number) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingLike = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      return { description: 'Post already liked' };
    }

    await this.prisma.like.create({
      data: {
        postId,
        userId,
      },
    });

    return { description: 'Post liked' };
  }

  async unlikePost(postId: number, userId: number) {
    const like = await this.prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    return null;
  }

  async getFeed(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followingIds = follows.map((follow) => follow.followingId);

    if (followingIds.length === 0) {
      return [];
    }

    const posts = await this.prisma.post.findMany({
      where: {
        userId: {
          in: followingIds,
        },
      },
      include: {
        user: {
          select: {
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
      id: post.id.toString(),
      userId: post.userId.toString(),
      content: post.content,
      likes: post._count.likes,
      comments: post._count.comments,
      username: post.user.username,
      avatar: post.user.avatar || '',
    }));
  }
}
