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
import { HealthModule } from './health/health.module';
 

@Module({
  imports: [PrismaModule, PacientesModule, DoctoresModule, CitasModule,
    DoctoresV2Module, MetricsModule, HealthModule,],
  controllers: [AppController],
  providers: [AppService,

    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    
  ],
})
export class AppModule {}
