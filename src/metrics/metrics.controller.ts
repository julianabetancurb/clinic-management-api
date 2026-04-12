import { Controller, Get, Header } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@ApiTags('Métricas v2')
@Controller({ path: 'metrics', version: '2' })
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain')
  @ApiOperation({ summary: 'Métricas en formato Prometheus' })
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Resumen de métricas en formato JSON' })
  async getSummary() {
    return this.metricsService.getSummary();
  }
}
