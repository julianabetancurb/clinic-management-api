import { Injectable } from '@nestjs/common';
import { Registry, Counter, Histogram, collectDefaultMetrics } from 'prom-client';

interface EndpointStat {
  requests: number;
  totalDuration: number;
}

@Injectable()
export class MetricsService {
  private readonly registry: Registry;
  private readonly requestCounter: Counter;
  private readonly requestDuration: Histogram;

  // Contadores propios en memoria para el summary
  private totalRequests = 0;
  private totalErrors = 0;
  private statusBreakdown: Record<string, number> = {};
  private endpointStats: Record<string, EndpointStat> = {};

  constructor() {
    this.registry = new Registry();
    collectDefaultMetrics({ register: this.registry });

    this.requestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total de requests HTTP',
      labelNames: ['method', 'endpoint', 'status'],
      registers: [this.registry],
    });

    this.requestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duración de requests HTTP en segundos',
      labelNames: ['method', 'endpoint', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
      registers: [this.registry],
    });
  }

  recordRequest(method: string, endpoint: string, status: number, duration: number) {
    const labels = { method, endpoint, status: status.toString() };

    // Registrar en prom-client
    this.requestCounter.inc(labels);
    this.requestDuration.observe(labels, duration);

    // Registrar en contadores propios
    this.totalRequests++;
    if (status >= 400) this.totalErrors++;

    const statusKey = status.toString();
    this.statusBreakdown[statusKey] = (this.statusBreakdown[statusKey] ?? 0) + 1;

    if (!this.endpointStats[endpoint]) {
      this.endpointStats[endpoint] = { requests: 0, totalDuration: 0 };
    }
    this.endpointStats[endpoint].requests++;
    this.endpointStats[endpoint].totalDuration += duration;
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getSummary() {
    const topEndpoints = Object.entries(this.endpointStats)
      .sort((a, b) => b[1].requests - a[1].requests)
      .slice(0, 5)
      .map(([endpoint, stats]) => ({ endpoint, requests: stats.requests }));

    const avgDurationByEndpoint: Record<string, number> = {};
    for (const [endpoint, stats] of Object.entries(this.endpointStats)) {
      if (stats.requests > 0) {
        avgDurationByEndpoint[endpoint] = parseFloat(
          (stats.totalDuration / stats.requests).toFixed(6),
        );
      }
    }

    return {
      status: 'ok',
      version: '2.0.0',
      summary: {
        total_requests: this.totalRequests,
        total_errors: this.totalErrors,
        error_rate_percent:
          this.totalRequests > 0
            ? parseFloat(((this.totalErrors / this.totalRequests) * 100).toFixed(2))
            : 0,
        status_breakdown: this.statusBreakdown,
      },
      top_endpoints: topEndpoints,
      avg_duration_seconds_by_endpoint: avgDurationByEndpoint,
    };
  }
}