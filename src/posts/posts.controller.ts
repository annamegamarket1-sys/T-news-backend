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
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('/posts')
  getAllPosts() {
    return this.postsService.getAllPosts();
  }

  @Get('users/:userId/posts')
  getUserPosts(@Param('userId', ParseIntPipe) userId: number) {
    return this.postsService.getUserPosts(userId);
  }

  @Post('users/:userId/posts')
  createPost(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postsService.createPost(userId, createPostDto);
  }

  @Get('posts/:postId')
  getPostData(@Param('postId', ParseIntPipe) postId: number) {
    return this.postsService.getPost(postId);
  }

  @Delete('posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePost(@Param('postId', ParseIntPipe) postId: number) {
    return this.postsService.deletePost(postId);
  }

  @Post('posts/:postId/likes')
  @HttpCode(HttpStatus.CREATED)
  likePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.postsService.likePost(postId, userId);
  }

  @Delete('posts/:postId/likes')
  unlikePost(
    @Param('postId', ParseIntPipe) postId: number,
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    return this.postsService.unlikePost(postId, userId);
  }

  @Get('feed/:userId')
  getFeed(@Param('userId', ParseIntPipe) userId: number) {
    return this.postsService.getFeed(userId);
  }
}
