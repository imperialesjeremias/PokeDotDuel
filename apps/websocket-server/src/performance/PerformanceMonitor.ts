import { EventEmitter } from 'events';

export interface PerformanceMetrics {
  timestamp: number;
  activeConnections: number;
  activeBattles: number;
  activeLobbies: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: number;
  responseTime: number;
  errorRate: number;
}

export class PerformanceMonitor extends EventEmitter {
  private metrics: PerformanceMetrics[] = [];
  private startTime: number = Date.now();
  private requestCount: number = 0;
  private errorCount: number = 0;
  private responseTimes: number[] = [];

  constructor(private readonly maxMetricsHistory: number = 100) {
    super();
    this.startMonitoring();
  }

  private startMonitoring(): void {
    // Monitor every 30 seconds
    setInterval(() => {
      this.collectMetrics();
    }, 30000);

    // Clean old metrics every hour
    setInterval(() => {
      this.cleanupOldMetrics();
    }, 3600000);
  }

  private collectMetrics(): void {
    const metrics: PerformanceMetrics = {
      timestamp: Date.now(),
      activeConnections: this.getActiveConnections(),
      activeBattles: this.getActiveBattles(),
      activeLobbies: this.getActiveLobbies(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: this.getCPUUsage(),
      responseTime: this.getAverageResponseTime(),
      errorRate: this.getErrorRate()
    };

    this.metrics.push(metrics);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }

    this.emit('metrics', metrics);

    // Alert on high memory usage
    if (metrics.memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
      this.emit('alert', {
        type: 'HIGH_MEMORY',
        message: 'High memory usage detected',
        metrics
      });
    }

    // Alert on high error rate
    if (metrics.errorRate > 0.1) { // 10% error rate
      this.emit('alert', {
        type: 'HIGH_ERROR_RATE',
        message: 'High error rate detected',
        metrics
      });
    }
  }

  private cleanupOldMetrics(): void {
    const oneHourAgo = Date.now() - 3600000;
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
  }

  // Mock implementations - would be connected to actual systems
  private getActiveConnections(): number {
    return Math.floor(Math.random() * 100) + 10; // Mock
  }

  private getActiveBattles(): number {
    return Math.floor(Math.random() * 20) + 2; // Mock
  }

  private getActiveLobbies(): number {
    return Math.floor(Math.random() * 15) + 5; // Mock
  }

  private getCPUUsage(): number {
    return Math.random() * 100; // Mock
  }

  private getAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    return this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }

  private getErrorRate(): number {
    if (this.requestCount === 0) return 0;
    return this.errorCount / this.requestCount;
  }

  // Public methods
  recordRequest(responseTime: number, hadError: boolean = false): void {
    this.requestCount++;
    this.responseTimes.push(responseTime);

    if (hadError) {
      this.errorCount++;
    }

    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }
  }

  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  getMetricsHistory(hours: number = 1): PerformanceMetrics[] {
    const cutoff = Date.now() - (hours * 3600000);
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    metrics: PerformanceMetrics | null;
  } {
    const metrics = this.getCurrentMetrics();
    const uptime = Date.now() - this.startTime;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (metrics) {
      if (metrics.errorRate > 0.2 || metrics.memoryUsage.heapUsed > 700 * 1024 * 1024) {
        status = 'critical';
      } else if (metrics.errorRate > 0.1 || metrics.memoryUsage.heapUsed > 500 * 1024 * 1024) {
        status = 'warning';
      }
    }

    return {
      status,
      uptime,
      metrics
    };
  }

  resetCounters(): void {
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimes = [];
  }
}
