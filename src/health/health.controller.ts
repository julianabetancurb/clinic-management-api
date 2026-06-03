import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: process.env.RELEASE_STATUS || 'stable',
      version: process.env.APP_VERSION || '1.0.0',
      deploymentDate: process.env.DEPLOYMENT_DATE || '2026-05-28',
      service: 'clinic-management-api',
      environment: process.env.NODE_ENV || 'production',
      visibleChange:
        process.env.RELEASE_STATUS === 'canary'
          ? 'Canary version with visible change'
          : 'Stable production version',
    };
  }
}