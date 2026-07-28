import { Controller, Get, Header } from '@nestjs/common';

import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('content-type', 'text/plain; version=0.0.4')
  metrics() {
    return this.metricsService.renderPrometheus();
  }
}
