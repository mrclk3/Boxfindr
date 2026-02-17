import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCrateDto } from './dto/create-crate.dto';
import { UpdateCrateDto } from './dto/update-crate.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CratesService {
  constructor(private prisma: PrismaService) { }

  create(createCrateDto: CreateCrateDto) {
    return this.prisma.crate.create({
      data: {
        number: createCrateDto.number,
        qrCode: createCrateDto.qrCode,
        cabinet: { connect: { id: createCrateDto.cabinetId } },
        category: createCrateDto.categoryId
          ? { connect: { id: createCrateDto.categoryId } }
          : undefined,
      },
    });
  }

  findAll() {
    return this.prisma.crate.findMany({
      include: { cabinet: true, category: true },
    });
  }

  findOne(id: number) {
    return this.prisma.crate.findUnique({
      where: { id },
      include: { items: true, cabinet: true },
    });
  }

  async findOneByQr(qrCode: string) {
    const crate = await this.prisma.crate.findUnique({
      where: { qrCode },
      include: { items: true, cabinet: true },
    });
    if (!crate)
      throw new NotFoundException(`Crate with QR ${qrCode} not found`);
    return crate;
  }

  update(id: number, updateCrateDto: UpdateCrateDto) {
    return this.prisma.crate.update({
      where: { id },
      data: updateCrateDto,
    });
  }

  async move(id: number, targetCabinetId: number) {
    // Verify target cabinet exists? Prisma will throw if not found usually, but good to check.
    return this.prisma.crate.update({
      where: { id },
      data: { cabinetId: targetCabinetId },
    });
  }

  async remove(id: number) {
    const crate = await this.prisma.crate.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!crate) {
      throw new NotFoundException(`Crate with ID ${id} not found`);
    }

    if (crate.items.length > 0) {
      throw new BadRequestException('Cannot delete crate with items');
    }

    return this.prisma.crate.delete({ where: { id } });
  }
}
