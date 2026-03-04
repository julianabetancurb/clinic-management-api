import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get('health/db')
  async dbHealth() {
    // 1) query simple que siempre funciona si hay conexión
    await this.prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  }
}