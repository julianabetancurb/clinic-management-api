import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get('canary')
  canary() {
    return {
      appName: 'La apliacacion super genial de Juliana',
      version: '3.0.0',
      channel: 'canary',
      message: 'Esta aplicacion es la m*nda vale! :D',
    };
  }

  @Get('health/db')
  async dbHealth() {
    // 1) query simple que siempre funciona si hay conexión
    await this.prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  }
}