import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { CratesService } from './crates.service';
import { CreateCrateDto } from './dto/create-crate.dto';
import { UpdateCrateDto } from './dto/update-crate.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('crates')
export class CratesController {
  constructor(private readonly cratesService: CratesService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCrateDto: CreateCrateDto) {
    return this.cratesService.create(createCrateDto);
  }

  @Get()
  findAll() {
    return this.cratesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    if (!isNaN(+id)) {
      return this.cratesService.findOne(+id);
    }
    return this.cratesService.findOneByQr(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCrateDto: UpdateCrateDto,
  ) {
    return this.cratesService.update(id, updateCrateDto);
  }

  @Patch(':id/move')
  @UseGuards(JwtAuthGuard)
  move(
    @Param('id', ParseIntPipe) id: number,
    @Body('cabinetId', ParseIntPipe) cabinetId: number,
  ) {
    return this.cratesService.move(id, cabinetId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete crates');
    }
    return this.cratesService.remove(id);
  }
}
