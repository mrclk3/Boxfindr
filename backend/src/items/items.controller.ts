import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateQuantityDto } from './dto/update-quantity.dto';
import { LendItemDto } from './dto/lend-item.dto';
import { TransferItemDto } from './dto/transfer-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(
    @Body() createItemDto: CreateItemDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    const photoUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.itemsService.create(createItemDto, photoUrl, req.user.userId);
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.itemsService.findAll(q);
  }

  @Get('stats')
  getStats() {
    return this.itemsService.getStats();
  }

  @Get()
  findAll(@Query('lowStock') lowStock: string) {
    return this.itemsService.findAll(undefined, lowStock === 'true');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemDto: UpdateItemDto,
    @Request() req,
  ) {
    return this.itemsService.update(id, updateItemDto, req.user.userId);
  }

  @Patch(':id/quantity')
  @UseGuards(JwtAuthGuard)
  updateQuantity(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuantityDto: UpdateQuantityDto,
    @Request() req,
  ) {
    return this.itemsService.updateQuantity(
      id,
      updateQuantityDto.change,
      req.user.userId,
    );
  }

  @Patch(':id/lend')
  @UseGuards(JwtAuthGuard)
  lend(
    @Param('id', ParseIntPipe) id: number,
    @Body() lendItemDto: LendItemDto,
    @Request() req,
  ) {
    return this.itemsService.lend(id, lendItemDto.lentTo, req.user.userId);
  }

  @Post(':id/transfer') // Spec says POST for transfer
  @UseGuards(JwtAuthGuard)
  transfer(
    @Param('id', ParseIntPipe) id: number,
    @Body() transferItemDto: TransferItemDto,
    @Request() req,
  ) {
    return this.itemsService.transfer(
      id,
      transferItemDto.targetCrateId,
      req.user.userId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.remove(id);
  }
}
