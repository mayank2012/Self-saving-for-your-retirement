import os from 'os';
import type { PerformanceMetrics } from '../types';

/**
 * PerformanceMonitor: Tracks system metrics during request processing.
 */
export class PerformanceMonitor {
  private startTime: number;
  private startMemory: NodeJS.MemoryUsage;

  constructor() {
    this.startTime = Date.now();
    this.startMemory = process.memoryUsage();
  }

  /**
   * Get current memory usage in megabytes.
   */
  private getMemoryUsedMb(): number {
    const current = process.memoryUsage();
    const usedBytes = current.heapUsed;
    return usedBytes / (1024 * 1024);
  }

  /**
   * Get CPU usage percentage (simplified).
   * Returns average CPU usage since process start.
   */
  private getCpuUsagePercent(): number {
    const usage = process.cpuUsage();
    const userCpuMs = usage.user / 1000; // Convert microseconds to milliseconds
    const systemCpuMs = usage.system / 1000;
    const uptime = process.uptime() * 1000; // Convert seconds to milliseconds
    const totalCpuMs = userCpuMs + systemCpuMs;

    if (uptime === 0) return 0;
    return (totalCpuMs / uptime) * 100;
  }

  /**
   * Get the number of active threads (OS-level).
   */
  private getThreadCount(): number {
    // Use libuv's thread pool size as a proxy for active threads
    return os.cpus().length;
  }

  /**
   * Finalize monitoring and return metrics.
   */
  finalize(): PerformanceMetrics {
    const endTime = Date.now();
    const totalTime = endTime - this.startTime;

    return {
      total_processing_time_ms: totalTime,
      memory_used_mb: this.getMemoryUsedMb(),
      thread_count: this.getThreadCount(),
      cpu_usage_percent: this.getCpuUsagePercent(),
      timestamp: new Date().toISOString(),
    };
  }
}
