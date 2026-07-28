import { Injectable } from '@nestjs/common';

@Injectable()
export class MetricsService {
  private readonly counters = new Map<string, number>();
  private readonly durations = new Map<string, number[]>();

  increment(name: string, labels: Record<string, string | number> = {}) {
    const key = this.key(name, labels);
    this.counters.set(key, (this.counters.get(key) ?? 0) + 1);
  }

  observe(
    name: string,
    value: number,
    labels: Record<string, string | number> = {},
  ) {
    const key = this.key(name, labels);
    const values = this.durations.get(key) ?? [];
    values.push(value);
    if (values.length > 500) {
      values.shift();
    }
    this.durations.set(key, values);
  }

  renderPrometheus() {
    const lines: string[] = [
      '# HELP finbank_http_requests_total Total HTTP requests by method, route, and status.',
      '# TYPE finbank_http_requests_total counter',
    ];

    for (const [key, value] of this.counters.entries()) {
      lines.push(`${key} ${value}`);
    }

    lines.push(
      '# HELP finbank_http_request_duration_ms_avg Average HTTP request duration in milliseconds.',
    );
    lines.push('# TYPE finbank_http_request_duration_ms_avg gauge');

    for (const [key, values] of this.durations.entries()) {
      const total = values.reduce((sum, current) => sum + current, 0);
      const avg = values.length ? total / values.length : 0;
      lines.push(
        `${key.replace('_total', '_duration_ms_avg')} ${avg.toFixed(2)}`,
      );
    }

    return `${lines.join('\n')}\n`;
  }

  private key(name: string, labels: Record<string, string | number>) {
    const entries = Object.entries(labels);
    if (!entries.length) {
      return name;
    }

    const labelText = entries
      .map(([key, value]) => `${key}="${String(value).replace(/"/g, '\\"')}"`)
      .join(',');

    return `${name}{${labelText}}`;
  }
}
