import { Injectable } from '@nestjs/common';
import { CreateCabinetDto } from './dto/create-cabinet.dto';
import { UpdateCabinetDto } from './dto/update-cabinet.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CabinetsService {
  constructor(private prisma: PrismaService) { }

  create(createCabinetDto: CreateCabinetDto) {
    return this.prisma.cabinet.create({
      data: {
        number: createCabinetDto.number,
        location: createCabinetDto.location,
        qrCode: createCabinetDto.qrCode,
      },
    });
  }

  findAll(includeCrates: boolean = false) {
    return this.prisma.cabinet.findMany({
      include: {
        crates: includeCrates,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.cabinet.findUnique({
      where: { id },
      include: { crates: true },
    });
  }

  update(id: number, updateCabinetDto: UpdateCabinetDto) {
    return this.prisma.cabinet.update({
      where: { id },
      data: updateCabinetDto,
    });
  }

  remove(id: number) {
    return this.prisma.cabinet.delete({ where: { id } });
  }
}
