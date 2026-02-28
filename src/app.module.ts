import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { DoctoresModule } from './doctores/doctores.module';

@Module({
  imports: [PrismaModule, PacientesModule, DoctoresModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
