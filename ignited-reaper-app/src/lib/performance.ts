export class PerformanceMonitor {
  private fps: number[] = [];
  private lastTime = performance.now();
  private frameCount = 0;
  private checkInterval = 60; // Check every 60 frames

  measureFPS() {
    const now = performance.now();
    const delta = now - this.lastTime;
    const fps = 1000 / delta;

    this.fps.push(fps);
    if (this.fps.length > 60) {
      this.fps.shift();
    }

    this.lastTime = now;
    this.frameCount++;
    
    return fps;
  }

  getAverageFPS() {
    if (this.fps.length === 0) return 0;
    return this.fps.reduce((a, b) => a + b, 0) / this.fps.length;
  }

  shouldReduceQuality() {
    return this.getAverageFPS() < 30;
  }

  shouldReduceParticles() {
    return this.getAverageFPS() < 45;
  }

  getQualityTier(): 'high' | 'medium' | 'low' {
    const avgFps = this.getAverageFPS();
    if (avgFps >= 55) return 'high';
    if (avgFps >= 35) return 'medium';
    return 'low';
  }

  getParticleMultiplier(): number {
    const avgFps = this.getAverageFPS();
    if (avgFps >= 55) return 1.0;
    if (avgFps >= 45) return 0.7;
    if (avgFps >= 35) return 0.5;
    return 0.3;
  }

  shouldCheck(): boolean {
    return this.frameCount % this.checkInterval === 0;
  }

  reset() {
    this.fps = [];
    this.lastTime = performance.now();
    this.frameCount = 0;
  }
}

