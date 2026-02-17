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
  Query,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { CabinetsService } from './cabinets.service';
import { CreateCabinetDto } from './dto/create-cabinet.dto';
import { UpdateCabinetDto } from './dto/update-cabinet.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('cabinets')
export class CabinetsController {
  constructor(private readonly cabinetsService: CabinetsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createCabinetDto: CreateCabinetDto) {
    // TODO: restricted to Admin only?
    return this.cabinetsService.create(createCabinetDto);
  }

  @Get()
  findAll(@Query('includeCrates') includeCrates?: string) {
    return this.cabinetsService.findAll(includeCrates === 'true');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cabinetsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCabinetDto: UpdateCabinetDto,
  ) {
    return this.cabinetsService.update(id, updateCabinetDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete cabinets');
    }
    return this.cabinetsService.remove(id);
  }
}
