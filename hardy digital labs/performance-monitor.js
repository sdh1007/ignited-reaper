// Enhanced Performance Monitoring for Hardy Digital Labs

class AdvancedPerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            renderTime: 0,
            memoryUsage: 0,
            loadTime: 0,
            interactionLatency: 0
        };
        
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.loadStartTime = performance.timing?.navigationStart || Date.now();
        this.threeJSRenderer = null;
        
        this.initializeMonitoring();
    }
    
    initializeMonitoring() {
        // Core Web Vitals monitoring
        this.measureWebVitals();
        
        // Performance observer for various metrics
        if ('PerformanceObserver' in window) {
            this.setupPerformanceObserver();
        }
        
        // Connection quality monitoring
        this.monitorConnection();
        
        // Memory usage tracking
        this.trackMemoryUsage();
    }
    
    measureWebVitals() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                const FID = entry.processingStart - entry.startTime;
                console.log('FID:', FID);
            }
        }).observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            console.log('CLS:', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }
    
    setupPerformanceObserver() {
        // Paint timing
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    console.log('FCP:', entry.startTime);
                }
            }
        }).observe({ entryTypes: ['paint'] });
        
        // Resource loading times
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.initiatorType === 'img' || entry.initiatorType === 'script') {
                    console.log(`${entry.name}: ${entry.duration}ms`);
                }
            }
        }).observe({ entryTypes: ['resource'] });
    }
    
    monitorConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            console.log('Connection type:', connection.effectiveType);
            console.log('Downlink:', connection.downlink);
            console.log('RTT:', connection.rtt);
            
            connection.addEventListener('change', () => {
                console.log('Connection changed:', connection.effectiveType);
                this.adjustQualityBasedOnConnection();
            });
        }
    }
    
    trackMemoryUsage() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.metrics.memoryUsage = memory.usedJSHeapSize / 1048576; // MB
                
                if (this.metrics.memoryUsage > 100) {
                    console.warn('High memory usage detected:', this.metrics.memoryUsage, 'MB');
                    this.suggestOptimizations();
                }
            }, 5000);
        }
    }
    
    update(renderer = null) {
        const currentTime = performance.now();
        this.frameCount++;
        
        if (renderer) {
            this.threeJSRenderer = renderer;
            const renderInfo = renderer.info;
            console.log('Three.js Stats:', {
                geometries: renderInfo.memory.geometries,
                textures: renderInfo.memory.textures,
                calls: renderInfo.render.calls,
                triangles: renderInfo.render.triangles
            });
        }
        
        if (currentTime - this.lastTime >= 1000) {
            this.metrics.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // Report performance metrics
            this.reportMetrics();
        }
    }
    
    reportMetrics() {
        console.log('Performance Metrics:', {
            fps: this.metrics.fps,
            memory: this.metrics.memoryUsage + 'MB',
            loadTime: this.metrics.loadTime + 'ms'
        });
        
        // Send to analytics if needed
        if ('gtag' in window) {
            gtag('event', 'performance_metric', {
                fps: this.metrics.fps,
                memory_usage: this.metrics.memoryUsage
            });
        }
    }
    
    shouldReduceQuality() {
        return this.metrics.fps < 30 || 
               this.metrics.memoryUsage > 100 ||
               (navigator.connection && navigator.connection.effectiveType === 'slow-2g');
    }
    
    adjustQualityBasedOnConnection() {
        if (this.shouldReduceQuality()) {
            document.body.classList.add('low-performance-mode');
            
            // Reduce 3D quality
            if (this.threeJSRenderer) {
                this.threeJSRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
                console.log('Reduced rendering quality for better performance');
            }
        }
    }
    
    suggestOptimizations() {
        const suggestions = [];
        
        if (this.metrics.fps < 30) {
            suggestions.push('Consider reducing 3D scene complexity');
        }
        
        if (this.metrics.memoryUsage > 100) {
            suggestions.push('High memory usage detected - consider optimizing textures');
        }
        
        if (suggestions.length > 0) {
            console.log('Performance suggestions:', suggestions);
        }
    }
    
    generateReport() {
        return {
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            userAgent: navigator.userAgent,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt
            } : null,
            screen: {
                width: screen.width,
                height: screen.height,
                pixelRatio: window.devicePixelRatio
            }
        };
    }
}

// Initialize performance monitoring
const performanceMonitor = new AdvancedPerformanceMonitor();

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedPerformanceMonitor;
} else {
    window.AdvancedPerformanceMonitor = AdvancedPerformanceMonitor;
    window.performanceMonitor = performanceMonitor;
}