import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, path } = req;
    const start = Date.now();
    console.log(`📊 Interceptor llamado: ${method} ${path}`); // agrega esto

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const duration = (Date.now() - start) / 1000;
          this.metricsService.recordRequest(method, path, res.statusCode, duration);
        },
        error: (err) => {
          const status = err?.status ?? 500;
          const duration = (Date.now() - start) / 1000;
          this.metricsService.recordRequest(method, path, status, duration);
        },
      }),
    );
  }
}
