import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'canary',
      version: '1.1.0-canary',
      deploymentDate: '2026-06-03',
      service: 'clinic-management-api',
      visibleChange: 'Canary version with visible change',
    };
  }
}