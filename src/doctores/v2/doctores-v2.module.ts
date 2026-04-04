import { Module } from '@nestjs/common';
import { DoctoresV2Controller } from './doctores-v2.controller';
import { DoctoresV2Service } from './doctores-v2.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DoctoresV2Controller],
  providers: [DoctoresV2Service],
})
export class DoctoresV2Module {}
