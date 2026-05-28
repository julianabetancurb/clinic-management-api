import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: process.env.RELEASE_STATUS || 'stable',
      version: process.env.APP_VERSION || '4.0.0',
      service: 'clinic-management-api',
      deploymentDate: process.env.DEPLOYMENT_DATE || '2026-05-28',
    };
  }
}