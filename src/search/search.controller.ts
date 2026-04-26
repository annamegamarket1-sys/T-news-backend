import { Controller, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  search(
    @Query('query') query: string,
    @Query('type') type: 'users' | 'posts',
  ) {
    return this.searchService.search(query, type);
  }
}
