import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { DoctoresModule } from './doctores/doctores.module';
import { CitasModule } from './citas/citas.module';
import { DoctoresV2Module } from './doctores/v2/doctores-v2.module';
import { MetricsModule } from './metrics/metrics.module';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
 

@Module({
  imports: [PrismaModule, PacientesModule, DoctoresModule, CitasModule,
    DoctoresV2Module, MetricsModule, ],
  controllers: [AppController],
  providers: [AppService,

    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    
  ],
})
export class AppModule {}
