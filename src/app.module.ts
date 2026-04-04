import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { DoctoresModule } from './doctores/doctores.module';
import { CitasModule } from './citas/citas.module';
import { DoctoresV2Module } from './doctores/v2/doctores-v2.module';

@Module({
  imports: [PrismaModule, PacientesModule, DoctoresModule, CitasModule,
    DoctoresV2Module],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
