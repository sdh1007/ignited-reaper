// Three.js 3D San Francisco Cityscape for Hardy Digital Labs

// Image optimization utilities
class ImageOptimizer {
    static supportsWebP() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = () => {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    static async loadOptimizedImage(src, fallback = null) {
        const supportsWebP = await ImageOptimizer.supportsWebP();

        // Try WebP version first if supported
        if (supportsWebP && src.includes('.png')) {
            const webpSrc = src.replace('.png', '.webp');
            try {
                await ImageOptimizer.preloadImage(webpSrc);
                return webpSrc;
            } catch (e) {
                // Fallback to original if WebP fails
            }
        }

        return src;
    }

    static preloadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    static createResponsiveImage(baseSrc, sizes = []) {
        const img = document.createElement('img');
        img.src = baseSrc;

        if (sizes.length > 0) {
            img.srcset = sizes.map(size => `${baseSrc.replace('.', `_${size}.`)} ${size}w`).join(', ');
            img.sizes = '(max-width: 768px) 100vw, 50vw';
        }

        img.loading = 'lazy';
        img.decoding = 'async';

        return img;
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            renderTime: 0,
            memoryUsage: 0
        };
        this.frameCount = 0;
        this.lastTime = performance.now();
    }

    update() {
        const currentTime = performance.now();
        this.frameCount++;

        if (currentTime - this.lastTime >= 1000) {
            this.metrics.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;

            // Monitor memory usage if available
            if (performance.memory) {
                this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1048576; // MB
            }
        }
    }

    shouldReduceQuality() {
        return this.metrics.fps < 30 || this.metrics.memoryUsage > 100;
    }
}
class SanFrancisco3D {
    constructor() {
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // 3D Objects
        this.buildings = [];
        this.goldenGateBridge = null;
        this.transamericaPyramid = null;
        this.terrain = null;
        this.logo3D = null;
        this.logoSprite = null;
        this.logoGlow = null;
        this.logoLight = null;
        this.fogClouds = [];
        this.fogPlanes = [];

        // Lighting
        this.ambientLight = null;
        this.directionalLight = null;
        this.isNight = false;

        // Interaction - will be initialized in init()
        this.raycaster = null;
        this.mouse = null;
        this.hoveredPyramid = false;
        this.hoveredHighkey = false;
        this.pyramidOriginalScale = null;
        this.highkeyOriginalScale = null;
        this.pyramidParticles = null;

        // UI Elements
        this.preloader = document.getElementById('preloader');
        this.tooltip = document.getElementById('pyramid-tooltip');
        this.toggleTimeBtn = document.getElementById('toggle-time');

        // Animation - will be initialized in init()
        this.clock = null;

        this.bridgeLights = [];
        this.windowMeshes = [];
        this.flickerWindowIndices = [];
        this.flickerTime = 0;

        this.treeLeaves = [];
        this.treeTrunks = [];

        // Highkey Morgan visuals
        this.highkeyBuilding = null;
        this.highkeyHeels = [];
        this.scottydBuilding = null;
        this.scottydNotes = [];
        this.hoveredHighkey = false;
        this.highkeyOriginalScale = null;
        this.hoveredScotty = false;
        this.scottyOriginalScale = null;

        // Mobile sizing factor for 3D sprites/effects
        this.spriteScaleFactor = this.isMobile ? 1 : 1; // placeholder; will be set in init()

        // Don't call init here anymore - we'll call it explicitly
        // this.init();
    }

    init() {
        try {
            // Set sprite scale factor once
            this.spriteScaleFactor = this.isMobile() ? 0.9 : 1.0;
            // Check if Three.js is available
            if (typeof THREE === 'undefined') {
                console.error('Three.js is not loaded. Cannot initialize 3D scene.');
                this.showError('Three.js failed to load. Please refresh the page.');
                return;
            }

            console.log('Initializing 3D scene...');

            // Initialize THREE-dependent objects
            this.raycaster = new THREE.Raycaster();
            this.mouse = new THREE.Vector2();
            this.clock = new THREE.Clock();

            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupLights();
            this.setupControls();
            this.createTerrain();
            this.createBuildings();
            this.createGoldenGateBridge();
            this.createTransamericaPyramid();
            this.createLogoSprite();
            this.createParticles();
            this.setupEventListeners();
            this.setupUI();
            this.animate();
            this.hidePreloader();
            console.log('3D scene initialized successfully');
        } catch (error) {
            console.error('Failed to initialize 3D scene:', error);
            this.showError('Failed to initialize 3D scene. Please refresh the page.');
        }
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    }

    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(50, 30, 50);
        this.camera.lookAt(0, 0, 0);
    }

    setupRenderer() {
        const canvas = document.getElementById('three-canvas');

        // Performance-optimized renderer settings
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: this.isMobile() ? false : true, // Disable AA on mobile for performance
            alpha: true,
            powerPreference: "high-performance" // Use dedicated GPU when available
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // Enable performance optimizations
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
        this.renderer.shadowMap.enabled = !this.isMobile(); // Disable shadows on mobile
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }

    // Performance optimization methods
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    detectPerformanceMode() {
        try {
            const mobile = this.isMobile();
            const cores = (navigator.hardwareConcurrency && navigator.hardwareConcurrency > 0) ? navigator.hardwareConcurrency : 4;
            const memory = (navigator.deviceMemory && navigator.deviceMemory > 0) ? navigator.deviceMemory : 4;

            if (mobile || cores < 4 || memory < 4) {
                return 'low'; // Reduced quality for low-end devices
            } else if (cores >= 8 && memory >= 8) {
                return 'high'; // Full quality for high-end devices
            }
            return 'medium'; // Balanced quality for mid-range devices
        } catch (e) {
            console.log('Performance mode detection failed, using medium mode:', e.message);
            return 'medium';
        }
    }

    getOptimizedGeometry(baseGeometry, complexity) {
        switch (this.performanceMode) {
            case 'low':
                return baseGeometry.clone().scale(1, 1, 1);
            case 'medium':
                return baseGeometry.clone();
            case 'high':
            default:
                return baseGeometry.clone();
        }
    }

    shouldSkipDetailedFeatures() {
        return this.performanceMode === 'low' || this.isMobile();
    }

    // Enhanced touch gesture handling
    setupEnhancedTouchControls() {
        const canvas = this.renderer.domElement;
        let touchStartTime = 0;
        let lastTouchDistance = 0;
        let lastTouchPosition = { x: 0, y: 0 };

        // Improved touch start
        canvas.addEventListener('touchstart', (e) => {
            touchStartTime = Date.now();

            if (e.touches.length === 1) {
                lastTouchPosition = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY
                };
            } else if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
            }
        }, { passive: true });

        // Optimized touch move with throttling
        let touchMoveTimeout;
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();

            if (touchMoveTimeout) return;
            touchMoveTimeout = setTimeout(() => {
                touchMoveTimeout = null;
            }, 16); // Throttle to ~60fps

            if (e.touches.length === 2) {
                // Pinch to zoom
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (lastTouchDistance > 0) {
                    const scale = distance / lastTouchDistance;
                    this.handlePinchZoom(scale);
                }
                lastTouchDistance = distance;
            }
        });

        // Fast tap detection
        canvas.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - touchStartTime;

            if (touchDuration < 200 && e.changedTouches.length === 1) {
                // Quick tap - treat as click
                const touch = e.changedTouches[0];
                this.handleTouchTap(touch.clientX, touch.clientY);
            }
        }, { passive: true });
    }

    handlePinchZoom(scale) {
        if (this.controls && this.controls.enabled) {
            const currentDistance = this.camera.position.distanceTo(this.controls.target);
            const newDistance = Math.max(10, Math.min(200, currentDistance / scale));

            const direction = new THREE.Vector3()
                .subVectors(this.camera.position, this.controls.target)
                .normalize();

            this.camera.position.copy(this.controls.target)
                .add(direction.multiplyScalar(newDistance));
        }
    }

    handleTouchTap(x, y) {
        // Convert screen coordinates to normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((x - rect.left) / rect.width) * 2 - 1,
            -((y - rect.top) / rect.height) * 2 + 1
        );

        // Raycast for object interaction
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        const intersects = raycaster.intersectObjects(this.scene.children, true);
        if (intersects.length > 0) {
            this.handleObjectInteraction(intersects[0].object);
        }
    }

    handleObjectInteraction(object) {
        // Handle pyramid click for about modal
        if (object.userData && object.userData.type === 'pyramid') {
            const aboutBtn = document.querySelector('[data-section="about"]');
            if (aboutBtn) aboutBtn.click();
        }
    }

    // Apply performance optimizations based on device capabilities
    applyPerformanceOptimizations() {
        // Add GPU acceleration classes to UI elements
        const elements = document.querySelectorAll('.floating-header, .floating-nav, .panel');
        elements.forEach(el => el.classList.add('gpu-accelerated'));

        // Optimize render settings based on performance mode
        if (this.performanceMode === 'low') {
            this.renderer.setPixelRatio(1); // Force 1:1 pixel ratio on low-end devices
            this.renderer.shadowMap.enabled = false;

            // Reduce fog density for better performance
            if (this.scene.fog) {
                this.scene.fog.density *= 0.5;
            }
        } else if (this.performanceMode === 'high') {
            // Enable enhanced effects for high-end devices
            const enhancedElements = document.querySelectorAll('.floating-header, .floating-nav');
            enhancedElements.forEach(el => el.classList.add('enhanced-effects'));
        }

        // Set up adaptive quality based on performance monitoring
        setInterval(() => {
            this.performanceMonitor.update();
            if (this.performanceMonitor.shouldReduceQuality() && this.performanceMode !== 'low') {
                this.adaptiveQualityReduction();
            }
        }, 2000);
    }

    adaptiveQualityReduction() {
        // Dynamically reduce quality if performance drops
        if (this.renderer.getPixelRatio() > 1) {
            this.renderer.setPixelRatio(Math.max(1, this.renderer.getPixelRatio() - 0.25));
            console.log('Adaptive quality: Reduced pixel ratio to', this.renderer.getPixelRatio());
        }

        // Reduce shadow quality
        if (this.renderer.shadowMap.enabled) {
            this.renderer.shadowMap.enabled = false;
            console.log('Adaptive quality: Disabled shadows');
        }
    }

    // Lazy loading asset management
    async loadAssetLazy(assetName, loadFunction) {
        if (this.loadedAssets.has(assetName)) {
            return Promise.resolve();
        }

        if (this.pendingAssets.has(assetName)) {
            return this.pendingAssets.get(assetName);
        }

        const loadPromise = new Promise(async (resolve, reject) => {
            try {
                // Add small delay to prevent blocking main thread
                await new Promise(r => setTimeout(r, 16));
                await loadFunction();
                this.loadedAssets.add(assetName);
                resolve();
            } catch (error) {
                console.warn(`Failed to load asset: ${assetName}`, error);
                reject(error);
            }
        });

        this.pendingAssets.set(assetName, loadPromise);
        return loadPromise;
    }

    // Load assets based on priority and performance
    async loadPriorityAssets() {
        for (const assetName of this.assetLoadPriority) {
            try {
                switch (assetName) {
                    case 'buildings':
                        await this.loadAssetLazy('buildings', () => this.createBuildings());
                        break;
                    case 'bridge':
                        if (!this.shouldSkipDetailedFeatures()) {
                            await this.loadAssetLazy('bridge', () => this.createGoldenGateBridge());
                        }
                        break;
                    case 'pyramid':
                        await this.loadAssetLazy('pyramid', () => this.createTransamericaPyramid());
                        break;
                }
                // Yield control back to main thread between assets
                await new Promise(r => setTimeout(r, 32));
            } catch (error) {
                console.warn(`Failed to load priority asset: ${assetName}`, error);
            }
        }
    }

    setupLights() {
        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(this.ambientLight);

        // Directional light (sun)
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.position.set(50, 50, 25);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 500;
        this.directionalLight.shadow.camera.left = -50;
        this.directionalLight.shadow.camera.right = 50;
        this.directionalLight.shadow.camera.top = 50;
        this.directionalLight.shadow.camera.bottom = -50;
        this.scene.add(this.directionalLight);
    }

    setupControls() {
        try {
            // Try to use OrbitControls if available
            if (typeof THREE.OrbitControls !== 'undefined') {
                console.log('Using OrbitControls');
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
                this.controls.screenSpacePanning = false;
                this.controls.minDistance = 10;
                this.controls.maxDistance = 100;
                this.controls.maxPolarAngle = Math.PI / 2;
                this.controls.autoRotate = false;
                this.controls.autoRotateSpeed = 0.5;
            } else {
                // Fallback to basic controls
                console.log('OrbitControls not available, using basic mouse controls');
                this.controls = null;
                this.setupBasicControls();
            }
        } catch (error) {
            console.log('Error setting up OrbitControls, using basic controls:', error);
            this.controls = null;
            this.setupBasicControls();
        }
    }

    setupBasicControls() {
        // Basic mouse controls when OrbitControls is not available
        let isMouseDown = false;
        let mouseX = 0;
        let mouseY = 0;

        this.renderer.domElement.addEventListener('mousedown', (event) => {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        });

        this.renderer.domElement.addEventListener('mouseup', () => {
            isMouseDown = false;
        });

        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (!isMouseDown) return;

            const deltaX = event.clientX - mouseX;
            const deltaY = event.clientY - mouseY;

            // Simple camera rotation
            this.camera.position.x = Math.cos(deltaX * 0.01) * 50;
            this.camera.position.z = Math.sin(deltaX * 0.01) * 50;
            this.camera.position.y += deltaY * 0.1;

            this.camera.lookAt(0, 0, 0);

            mouseX = event.clientX;
            mouseY = event.clientY;
        });
    }

    createTerrain() {
        // Base terrain
        const terrainGeometry = new THREE.PlaneGeometry(100, 100, 32, 32);
        const terrainMaterial = new THREE.MeshLambertMaterial({
            color: 0x228B22,
            transparent: true,
            opacity: 0.8
        });

        this.terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.receiveShadow = true;
        this.scene.add(this.terrain);

        // Add some height variation
        const vertices = terrainGeometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
            vertices[i + 2] = Math.random() * 2;
        }
        terrainGeometry.attributes.position.needsUpdate = true;
        terrainGeometry.computeVertexNormals();

        // Create roads
        this.createRoads();

        // Create parks
        this.createParks();
    }

    createRoads() {
        const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });

        // Main road horizontal
        const roadH = new THREE.BoxGeometry(80, 0.1, 4);
        const roadHMesh = new THREE.Mesh(roadH, roadMaterial);
        roadHMesh.position.set(0, 0.05, 0);
        roadHMesh.receiveShadow = true;
        this.scene.add(roadHMesh);

        // Main road vertical
        const roadV = new THREE.BoxGeometry(4, 0.1, 80);
        const roadVMesh = new THREE.Mesh(roadV, roadMaterial);
        roadVMesh.position.set(0, 0.05, 0);
        roadVMesh.receiveShadow = true;
        this.scene.add(roadVMesh);

        // Side roads
        for (let i = -3; i <= 3; i++) {
            if (i !== 0) {
                const sideRoadH = new THREE.BoxGeometry(40, 0.1, 2);
                const sideRoadHMesh = new THREE.Mesh(sideRoadH, roadMaterial);
                sideRoadHMesh.position.set(0, 0.05, i * 15);
                this.scene.add(sideRoadHMesh);

                const sideRoadV = new THREE.BoxGeometry(2, 0.1, 40);
                const sideRoadVMesh = new THREE.Mesh(sideRoadV, roadMaterial);
                sideRoadVMesh.position.set(i * 15, 0.05, 0);
                this.scene.add(sideRoadVMesh);
            }
        }
    }

    createParks() {
        const parkMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });

        // Small parks between city blocks
        const parkPositions = [
            { x: 20, z: 20 }, { x: -20, z: 20 },
            { x: 20, z: -20 }, { x: -20, z: -20 },
            { x: 35, z: 0 }, { x: -35, z: 0 }
        ];

        parkPositions.forEach(pos => {
            const parkSize = 8 + Math.random() * 4;
            const park = new THREE.BoxGeometry(parkSize, 0.2, parkSize);
            const parkMesh = new THREE.Mesh(park, parkMaterial);
            parkMesh.position.set(pos.x, 0.1, pos.z);
            parkMesh.receiveShadow = true;
            this.scene.add(parkMesh);

            // Add trees
            this.addTrees(pos.x, pos.z, parkSize);
        });
    }

    addTrees(centerX, centerZ, parkSize) {
        const treeCount = 3 + Math.floor(Math.random() * 5);
        const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const leafMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        for (let i = 0; i < treeCount; i++) {
            const offsetX = (Math.random() - 0.5) * parkSize * 0.6;
            const offsetZ = (Math.random() - 0.5) * parkSize * 0.6;
            // Tree trunk
            const trunk = new THREE.BoxGeometry(0.5, 3, 0.5);
            const trunkMesh = new THREE.Mesh(trunk, trunkMaterial);
            trunkMesh.position.set(centerX + offsetX, 1.7, centerZ + offsetZ);
            trunkMesh.castShadow = true;
            this.scene.add(trunkMesh);
            this.treeTrunks.push(trunkMesh);
            // Tree leaves
            const leaves = new THREE.SphereGeometry(2, 8, 6);
            const leavesMesh = new THREE.Mesh(leaves, leafMaterial);
            leavesMesh.position.set(centerX + offsetX, 4, centerZ + offsetZ);
            leavesMesh.castShadow = true;
            this.scene.add(leavesMesh);
            this.treeLeaves.push(leavesMesh);
        }
    }

    createBuildings() {
        const buildingData = [
            // Downtown core buildings
            { x: 10, z: 10, width: 4, depth: 4, height: 15, color: 0x4682B4 },
            { x: -10, z: 10, width: 3, depth: 3, height: 12, color: 0x708090 },
            { x: 10, z: -10, width: 5, depth: 3, height: 18, color: 0x2F4F4F },
            { x: -10, z: -10, width: 3, depth: 4, height: 14, color: 0x696969 },

            // Mid-rise buildings
            { x: 25, z: 15, width: 3, depth: 3, height: 10, color: 0x8FBC8F },
            { x: -25, z: 15, width: 4, depth: 2, height: 8, color: 0xA0522D },
            { x: 25, z: -15, width: 2, depth: 4, height: 12, color: 0x9370DB },
            { x: -25, z: -15, width: 3, depth: 3, height: 9, color: 0xCD853F },

            // Outer buildings
            { x: 35, z: 25, width: 2, depth: 2, height: 6, color: 0xF0E68C },
            { x: -35, z: 25, width: 2, depth: 3, height: 7, color: 0xDDA0DD },
            { x: 35, z: -25, width: 3, depth: 2, height: 8, color: 0x20B2AA },
            { x: -35, z: -25, width: 2, depth: 2, height: 5, color: 0xB0C4DE },

            // Additional variety buildings
            { x: 5, z: 25, width: 2, depth: 2, height: 8, color: 0xFF6347 },
            { x: -5, z: 25, width: 3, depth: 2, height: 11, color: 0x4169E1 },
            { x: 5, z: -25, width: 2, depth: 3, height: 7, color: 0x32CD32 },
            { x: -5, z: -25, width: 2, depth: 2, height: 9, color: 0xFFD700 },

            // Corner buildings
            { x: 15, z: 30, width: 2, depth: 2, height: 6, color: 0xDC143C },
            { x: -15, z: 30, width: 2, depth: 2, height: 5, color: 0x00CED1 },
            { x: 15, z: -30, width: 2, depth: 2, height: 7, color: 0x9ACD32 },
            { x: -15, z: -30, width: 2, depth: 2, height: 6, color: 0xFF1493 },

            // SplitTip Pro building
            { x: 20, z: 5, width: 3, depth: 3, height: 16, color: 0x007AFF, special: 'splittip' },

            // Highkey Morgan feature building
            { x: -22, z: 8, width: 3, depth: 3, height: 14, color: 0xFF8C00, special: 'highkey' },

            // ScottyD (DJ) building
            { x: -10, z: -22, width: 3, depth: 3, height: 15, color: 0x3A86FF, special: 'scottyd' }
        ];

        buildingData.forEach((building, index) => {
            this.createBuilding(
                building.x, building.z,
                building.width, building.depth, building.height,
                building.color, index, building.special
            );
        });
    }

    createBuilding(x, z, width, depth, height, color, index, special) {
        const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
        const buildingMaterial = new THREE.MeshLambertMaterial({
            color: color,
            transparent: true,
            opacity: 0.9
        });

        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.set(x, height / 2, z);
        building.castShadow = true;
        building.receiveShadow = true;
        building.userData = {
            type: 'building',
            id: index,
            originalColor: color,
            originalY: height / 2,
            height: height,
            special: special
        };

        // Store special buildings separately for click detection
        if (special === 'splittip') {
            this.splitTipBuilding = building;
        } else if (special === 'highkey') {
            this.highkeyBuilding = building;
            // Create floating high heels around the building
            this.createHighHeelsEffect(building);
        } else if (special === 'scottyd') {
            this.scottydBuilding = building;
            this.createMusicNotesEffect(building);
        }

        this.buildings.push(building);
        this.scene.add(building);

        // Add windows
        this.addWindows(building, width, height, depth);
    }

    addWindows(building, width, height, depth) {
        const windowMaterial = new THREE.MeshLambertMaterial({
            color: 0x87CEEB,
            transparent: true,
            opacity: 0.7
        });
        const windowSize = 0.3;
        const windowSpacing = 0.8;
        // Front and back windows
        for (let y = 1; y < height - 1; y += windowSpacing) {
            for (let x = -width / 2 + windowSpacing; x < width / 2; x += windowSpacing) {
                // Front windows
                const frontWindow = new THREE.BoxGeometry(windowSize, windowSize, 0.1);
                const frontWindowMesh = new THREE.Mesh(frontWindow, windowMaterial.clone());
                frontWindowMesh.position.set(x, y - height / 2, depth / 2 + 0.05);
                building.add(frontWindowMesh);
                this.windowMeshes.push(frontWindowMesh);
                // Back windows  
                const backWindow = new THREE.BoxGeometry(windowSize, windowSize, 0.1);
                const backWindowMesh = new THREE.Mesh(backWindow, windowMaterial.clone());
                backWindowMesh.position.set(x, y - height / 2, -depth / 2 - 0.05);
                building.add(backWindowMesh);
                this.windowMeshes.push(backWindowMesh);
            }
        }
        // Side windows
        for (let y = 1; y < height - 1; y += windowSpacing) {
            for (let z = -depth / 2 + windowSpacing; z < depth / 2; z += windowSpacing) {
                // Left windows
                const leftWindow = new THREE.BoxGeometry(0.1, windowSize, windowSize);
                const leftWindowMesh = new THREE.Mesh(leftWindow, windowMaterial.clone());
                leftWindowMesh.position.set(-width / 2 - 0.05, y - height / 2, z);
                building.add(leftWindowMesh);
                this.windowMeshes.push(leftWindowMesh);
                // Right windows
                const rightWindow = new THREE.BoxGeometry(0.1, windowSize, windowSize);
                const rightWindowMesh = new THREE.Mesh(rightWindow, windowMaterial.clone());
                rightWindowMesh.position.set(width / 2 + 0.05, y - height / 2, z);
                building.add(rightWindowMesh);
                this.windowMeshes.push(rightWindowMesh);
            }
        }
    }

    createGoldenGateBridge() {
        const bridgeGroup = new THREE.Group();
        // Subtle arch parameters
        const deckLength = 50;
        const deckSegments = 30;
        const archHeight = 2.5;
        // Deck with arch
        const deckMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E });
        let prevDeck = null;
        for (let i = 0; i <= deckSegments; i++) {
            const t = i / deckSegments;
            const x = -55 + t * deckLength;
            // Arch: y = base + archHeight * sin(pi * t)
            const y = 8 + archHeight * Math.sin(Math.PI * t);
            const deckSection = new THREE.Mesh(
                new THREE.BoxGeometry(deckLength / deckSegments, 0.5, 4),
                deckMaterial.clone()
            );
            deckSection.position.set(x, y, 35);
            deckSection.castShadow = true;
            deckSection.receiveShadow = true;
            deckSection.userData.type = 'bridgeDeck';
            bridgeGroup.add(deckSection);
            prevDeck = deckSection;
        }
        // Refined, taller, slightly tapered towers
        const towerMaterial = new THREE.MeshLambertMaterial({ color: 0xFF4500 });
        const towerHeight = 15; // was 20
        const towerTopWidth = 1.2;
        const towerBaseWidth = 2.2;
        // Left tower
        const leftTowerGeo = new THREE.BoxGeometry(towerBaseWidth, towerHeight, towerBaseWidth);
        const leftTowerMesh = new THREE.Mesh(leftTowerGeo, towerMaterial.clone());
        leftTowerMesh.position.set(-55, 8 + towerHeight / 2, 35);
        leftTowerMesh.scale.x = towerTopWidth / towerBaseWidth;
        leftTowerMesh.userData.type = 'bridgeTower';
        bridgeGroup.add(leftTowerMesh);
        // Right tower
        const rightTowerGeo = new THREE.BoxGeometry(towerBaseWidth, towerHeight, towerBaseWidth);
        const rightTowerMesh = new THREE.Mesh(rightTowerGeo, towerMaterial.clone());
        rightTowerMesh.position.set(-5, 8 + towerHeight / 2, 35);
        rightTowerMesh.scale.x = towerTopWidth / towerBaseWidth;
        rightTowerMesh.userData.type = 'bridgeTower';
        bridgeGroup.add(rightTowerMesh);
        // Main suspension cables (arch)
        const cableMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        for (let i = 0; i < 2; i++) {
            const cableCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-55, 8 + towerHeight, 35 + (i === 0 ? -1.5 : 1.5)),
                new THREE.Vector3(-30, 8 + towerHeight + 6, 35 + (i === 0 ? -1.5 : 1.5)),
                new THREE.Vector3(-5, 8 + towerHeight, 35 + (i === 0 ? -1.5 : 1.5)),
            ]);
            const cablePoints = cableCurve.getPoints(60);
            for (let j = 0; j < cablePoints.length - 1; j++) {
                const segGeo = new THREE.CylinderGeometry(0.07, 0.07, cablePoints[j].distanceTo(cablePoints[j + 1]), 8);
                const seg = new THREE.Mesh(segGeo, cableMaterial.clone());
                // Position segment between points
                seg.position.copy(cablePoints[j]).lerp(cablePoints[j + 1], 0.5);
                seg.lookAt(cablePoints[j + 1]);
                seg.rotateX(Math.PI / 2);
                seg.userData.type = 'bridgeCable';
                bridgeGroup.add(seg);
            }
        }
        // Many thin vertical cables
        const verticalCableMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        for (let i = 0; i <= deckSegments; i += 2) {
            for (let k = 0; k < 2; k++) {
                const t = i / deckSegments;
                const x = -55 + t * deckLength;
                const yDeck = 8 + archHeight * Math.sin(Math.PI * t);
                const yTop = 8 + towerHeight + 0.1;
                const z = 35 + (k === 0 ? -1.5 : 1.5);
                const cableGeo = new THREE.CylinderGeometry(0.03, 0.03, yTop - yDeck, 6);
                const cableMesh = new THREE.Mesh(cableGeo, verticalCableMaterial.clone());
                cableMesh.position.set(x, (yDeck + yTop) / 2, z);
                cableMesh.userData.type = 'bridgeCable';
                bridgeGroup.add(cableMesh);
            }
        }
        // Add decorative lights along the bridge deck and towers
        this.bridgeLights = [];
        // Deck lights (10 evenly spaced)
        for (let i = 0; i < 10; i++) {
            const x = -55 + i * (deckLength / 9); // from left tower to right tower
            const light = new THREE.PointLight(0xfff8c0, 0, 18, 2); // higher intensity, longer range
            light.position.set(x, 10.5, 35); // raised above deck
            bridgeGroup.add(light);
            this.bridgeLights.push(light);
            // Add a glowing sphere for visual effect
            const glowMat = new THREE.MeshBasicMaterial({ color: 0xfff8c0, transparent: true, opacity: 0.85 });
            const glow = new THREE.SphereGeometry(0.35, 12, 12);
            const glowMesh = new THREE.Mesh(glow, glowMat);
            glowMesh.position.copy(light.position);
            bridgeGroup.add(glowMesh);
            light.userData.glowMesh = glowMesh;
        }
        // Tower lights (top of each tower)
        const towerPositions = [
            { x: -55, y: 8 + towerHeight, z: 35 },
            { x: -5, y: 8 + towerHeight, z: 35 }
        ];
        towerPositions.forEach(pos => {
            const light = new THREE.PointLight(0xffe080, 0, 22, 2); // higher intensity, longer range
            light.position.set(pos.x, pos.y, pos.z);
            bridgeGroup.add(light);
            this.bridgeLights.push(light);
            // Add a glowing sphere for visual effect
            const glowMat = new THREE.MeshBasicMaterial({ color: 0xffe080, transparent: true, opacity: 0.95 });
            const glow = new THREE.SphereGeometry(0.5, 14, 14);
            const glowMesh = new THREE.Mesh(glow, glowMat);
            glowMesh.position.copy(light.position);
            bridgeGroup.add(glowMesh);
            light.userData.glowMesh = glowMesh;
        });
        // Add glowing overlays for night mode
        this.bridgeGlowOverlays = [];
        // Deck glow
        const deckGlowMat = new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending });
        const deckGlowGeo = new THREE.PlaneGeometry(50, 1.2);
        const deckGlow = new THREE.Mesh(deckGlowGeo, deckGlowMat);
        deckGlow.position.set(-55, 9.1, 35.01);
        deckGlow.rotation.x = -Math.PI / 2;
        deckGlow.visible = false;
        bridgeGroup.add(deckGlow);
        this.bridgeGlowOverlays.push(deckGlow);
        // Tower glows
        const towerGlowMat = new THREE.MeshBasicMaterial({ color: 0xffa040, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending });
        [
            { x: -55, y: 8 + towerHeight / 2, z: 35 },
            { x: -5, y: 8 + towerHeight / 2, z: 35 }
        ].forEach(pos => {
            const towerGlowGeo = new THREE.PlaneGeometry(2.2, 25);
            const towerGlow = new THREE.Mesh(towerGlowGeo, towerGlowMat);
            towerGlow.position.set(pos.x, pos.y, pos.z + 1.01);
            towerGlow.rotation.y = 0;
            towerGlow.visible = false;
            bridgeGroup.add(towerGlow);
            this.bridgeGlowOverlays.push(towerGlow);
        });
        // Add animated cars (boxes) for night mode
        this.bridgeCars = [];
        const carColors = [0xff3333, 0x33ff33, 0x3333ff, 0xffff33, 0xff33ff, 0x33ffff];
        const numCars = 5;
        for (let i = 0; i < numCars; i++) {
            const carMat = new THREE.MeshLambertMaterial({ color: carColors[i % carColors.length] });
            const carGeo = new THREE.BoxGeometry(0.8, 0.5, 1.2);
            const car = new THREE.Mesh(carGeo, carMat);
            car.position.set(-55 + (i * 10), 9.1, 34.2); // start positions
            car.visible = false;
            bridgeGroup.add(car);
            this.bridgeCars.push({ mesh: car, dir: 1, offset: i * 0.18 });
        }
        // Add cars going the other direction
        for (let i = 0; i < numCars; i++) {
            const carMat = new THREE.MeshLambertMaterial({ color: carColors[(i + 3) % carColors.length] });
            const carGeo = new THREE.BoxGeometry(0.8, 0.5, 1.2);
            const car = new THREE.Mesh(carGeo, carMat);
            car.position.set(-5 - (i * 10), 9.1, 35.8); // start positions
            car.visible = false;
            bridgeGroup.add(car);
            this.bridgeCars.push({ mesh: car, dir: -1, offset: i * 0.22 });
        }
        this.goldenGateBridge = bridgeGroup;
        this.scene.add(bridgeGroup);
    }

    createTransamericaPyramid() {
        const pyramidGeometry = new THREE.ConeGeometry(3, 25, 4);
        const pyramidMaterial = new THREE.MeshLambertMaterial({
            color: 0xF5F5F5,
            transparent: true,
            opacity: 0.95
        });

        this.transamericaPyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
        this.transamericaPyramid.position.set(0, 12.5, 0);
        this.transamericaPyramid.castShadow = true;
        this.transamericaPyramid.receiveShadow = true;
        this.transamericaPyramid.userData = {
            type: 'landmark',
            name: 'Transamerica Pyramid',
            info: 'Iconic pyramid-shaped skyscraper and symbol of San Francisco'
        };

        // Add pyramid windows
        for (let level = 0; level < 20; level++) {
            const windowY = level * 1.2 - 10;
            const radius = 3 * (1 - level / 25);

            if (radius > 0.3) {
                for (let i = 0; i < 4; i++) {
                    const angle = (i * Math.PI) / 2;
                    const windowX = Math.cos(angle) * radius;
                    const windowZ = Math.sin(angle) * radius;

                    const window = new THREE.BoxGeometry(0.2, 0.4, 0.1);
                    const windowMaterial = new THREE.MeshLambertMaterial({
                        color: 0x87CEEB,
                        transparent: true,
                        opacity: 0.7
                    });
                    const windowMesh = new THREE.Mesh(window, windowMaterial);
                    windowMesh.position.set(windowX, windowY, windowZ);
                    this.transamericaPyramid.add(windowMesh);
                }
            }
        }

        this.scene.add(this.transamericaPyramid);
    }

    createLogoSprite() {
        const textureLoader = new THREE.TextureLoader();
        const tex = textureLoader.load('logo.svg');
        const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0.95 });
        const sprite = new THREE.Sprite(mat);
        sprite.position.set(0, 35, 0);
        sprite.scale.set(6, 6, 1);
        this.scene.add(sprite);
        // Soft glow behind sprite
        const glowGeom = new THREE.SphereGeometry(8, 16, 16);
        const glowMat = new THREE.MeshBasicMaterial({ color: 0xff6b35, transparent: true, opacity: 0.06, side: THREE.BackSide });
        const glow = new THREE.Mesh(glowGeom, glowMat);
        glow.position.copy(sprite.position);
        this.scene.add(glow);
        this.logoSprite = sprite;
        this.logoGlow = glow;
        // Optional light
        const logoLight = new THREE.PointLight(0xff6b35, 0.25, 18);
        logoLight.position.copy(sprite.position);
        this.scene.add(logoLight);
        this.logoLight = logoLight;
    }

    createParticles() {
        // Create fog texture using canvas
        const fogTexture = this.createFogTexture();

        const particleCount = 150; // Fewer but larger fog clouds
        this.fogClouds = [];

        for (let i = 0; i < particleCount; i++) {
            // Create individual fog cloud sprites
            const spriteMaterial = new THREE.SpriteMaterial({
                map: fogTexture,
                transparent: true,
                opacity: 0.15 + Math.random() * 0.1,
                blending: THREE.NormalBlending,
                depthWrite: false,
                color: new THREE.Color(0.9 + Math.random() * 0.1, 0.9 + Math.random() * 0.1, 0.95 + Math.random() * 0.05)
            });

            const sprite = new THREE.Sprite(spriteMaterial);

            // Random positioning
            sprite.position.set(
                (Math.random() - 0.5) * 140,
                Math.random() * 20 + 3, // Low altitude fog
                (Math.random() - 0.5) * 140
            );

            // Random scale for variation
            const scale = 8 + Math.random() * 12;
            sprite.scale.set(scale, scale * 0.6, 1);

            // Store velocity data
            sprite.userData = {
                velocityX: (Math.random() - 0.5) * 0.02,
                velocityY: (Math.random() - 0.5) * 0.005,
                velocityZ: (Math.random() - 0.5) * 0.02,
                originalOpacity: sprite.material.opacity,
                rotationSpeed: (Math.random() - 0.5) * 0.001
            };

            this.fogClouds.push(sprite);
            this.scene.add(sprite);
        }

        // Add some ground-level fog planes for extra density
        this.createGroundFog();

        // Add extra fog density around Golden Gate Bridge (San Francisco signature fog!)
        this.createBridgeFog();
    }

    createFogTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const context = canvas.getContext('2d');

        // Create radial gradient for fog cloud
        const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        context.fillStyle = gradient;
        context.fillRect(0, 0, 128, 128);

        // Add some noise for realistic cloud texture
        const imageData = context.getImageData(0, 0, 128, 128);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 0.1;
            data[i + 3] = Math.max(0, Math.min(255, data[i + 3] + noise * 255));
        }

        context.putImageData(imageData, 0, 0);

        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        return texture;
    }

    createGroundFog() {
        // Create low-lying fog planes
        const fogPlanes = [];
        const planeGeometry = new THREE.PlaneGeometry(30, 30, 1, 1);

        for (let i = 0; i < 8; i++) {
            const planeMaterial = new THREE.MeshLambertMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.05,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const fogPlane = new THREE.Mesh(planeGeometry, planeMaterial);
            fogPlane.rotation.x = -Math.PI / 2;
            fogPlane.position.set(
                (Math.random() - 0.5) * 100,
                1 + Math.random() * 3,
                (Math.random() - 0.5) * 100
            );

            fogPlane.userData = {
                rotationSpeed: (Math.random() - 0.5) * 0.0005,
                originalOpacity: planeMaterial.opacity
            };

            fogPlanes.push(fogPlane);
            this.scene.add(fogPlane);
        }

        this.fogPlanes = fogPlanes;
    }

    createBridgeFog() {
        // Create extra dense fog around the Golden Gate Bridge area
        const bridgeFogTexture = this.createFogTexture();
        const bridgeFogClouds = [];

        for (let i = 0; i < 30; i++) {
            const spriteMaterial = new THREE.SpriteMaterial({
                map: bridgeFogTexture,
                transparent: true,
                opacity: 0.2 + Math.random() * 0.15,
                blending: THREE.NormalBlending,
                depthWrite: false,
                color: new THREE.Color(0.85, 0.85, 0.9)
            });

            const sprite = new THREE.Sprite(spriteMaterial);

            // Position around Golden Gate Bridge area
            sprite.position.set(
                -55 + (Math.random() - 0.5) * 40, // Around bridge X position
                Math.random() * 15 + 2, // Lower fog
                35 + (Math.random() - 0.5) * 20   // Around bridge Z position
            );

            // Larger scale for dense fog
            const scale = 12 + Math.random() * 8;
            sprite.scale.set(scale, scale * 0.8, 1);

            sprite.userData = {
                velocityX: (Math.random() - 0.5) * 0.015,
                velocityY: (Math.random() - 0.5) * 0.003,
                velocityZ: (Math.random() - 0.5) * 0.015,
                originalOpacity: sprite.material.opacity,
                rotationSpeed: (Math.random() - 0.5) * 0.0008,
                isBridgeFog: true
            };

            bridgeFogClouds.push(sprite);
            this.scene.add(sprite);
        }

        // Add bridge fog to main fog array for updates
        this.fogClouds = this.fogClouds.concat(bridgeFogClouds);
    }

    setupEventListeners() {
        // Mouse events for building interaction
        window.addEventListener('mousemove', (event) => this.onMouseMove(event));
        window.addEventListener('click', (event) => this.onClick(event));

        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Day/night toggle
        this.toggleTimeBtn.addEventListener('click', () => this.toggleDayNight());

        // Keyboard shortcuts
        window.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                // Close About panel if open
                const aboutPanel = document.getElementById('about-modal');
                if (aboutPanel && aboutPanel.classList.contains('show')) {
                    this.hideAboutPanel();
                    return;
                }

                // Close Project form if open
                const projectForm = document.getElementById('project-form-modal');
                if (projectForm && projectForm.classList.contains('show')) {
                    this.hideProjectForm();
                    return;
                }
            }
        });
    }

    setupUI() {
        // Navigation functionality
        const navBtns = document.querySelectorAll('.nav-btn');
        const panels = document.querySelectorAll('.panel');

        navBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetSection = btn.getAttribute('data-section');

                // Update active nav button
                navBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update active panel
                panels.forEach(panel => panel.classList.remove('active'));
                const targetPanel = document.getElementById(`${targetSection}-panel`);
                targetPanel.classList.add('active');

                // Update accessibility attributes
                updatePanelVisibility(targetPanel);
                // Announce panel change to screen readers
                const lang = localStorage.getItem('language') || 'en';
                const t = translations[lang];
                const panelTitle = targetPanel.querySelector('h2').textContent;
                announceToScreenReader(`${panelTitle} ${t.accessibility.panelActivated}`);
                // Focus the panel for keyboard users
                targetPanel.focus();

                // Camera movements for different sections
                this.animateCameraToSection(targetSection);
            });
        });
    }

    animateCameraToSection(section) {
        const positions = {
            home: { x: 50, y: 30, z: 50 },
            services: { x: -30, y: 25, z: 40 },
            about: { x: 30, y: 20, z: -40 },
            contact: { x: -40, y: 35, z: -30 }
        };

        const targetPos = positions[section] || positions.home;

        // Animate camera position
        const startPos = this.camera.position.clone();
        const startTime = Date.now();
        const duration = 2000;

        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Smooth easing function
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            this.camera.position.lerpVectors(startPos, new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z), easeProgress);

            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };

        animateCamera();
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Check intersection with hover targets (pyramid + highkey building)
        const hoverTargets = [];
        if (this.transamericaPyramid) hoverTargets.push(this.transamericaPyramid);
        if (this.highkeyBuilding) hoverTargets.push(this.highkeyBuilding);
        if (this.scottydBuilding) hoverTargets.push(this.scottydBuilding);
        const intersects = this.raycaster.intersectObjects(hoverTargets);

        if (intersects.length > 0) {
            const obj = intersects[0].object;
            if (obj === this.transamericaPyramid) {
                if (!this.hoveredPyramid) {
                    this.hoveredPyramid = true;
                    this.startPyramidHover();
                }
                if (this.hoveredHighkey) {
                    this.hoveredHighkey = false;
                    this.endHighkeyHover();
                }
                document.body.style.cursor = 'pointer';
                this.updateTooltipPosition(event.clientX, event.clientY);
            } else if (obj === this.highkeyBuilding) {
                if (!this.hoveredHighkey) {
                    this.hoveredHighkey = true;
                    this.startHighkeyHover();
                }
                if (this.hoveredPyramid) {
                    this.hoveredPyramid = false;
                    this.endPyramidHover();
                }
                document.body.style.cursor = 'pointer';
                this.updateTooltipPosition(event.clientX, event.clientY);
            } else if (obj === this.scottydBuilding) {
                if (!this.hoveredScotty) {
                    this.hoveredScotty = true;
                    this.startScottyHover();
                }
                if (this.hoveredPyramid) {
                    this.hoveredPyramid = false;
                    this.endPyramidHover();
                }
                if (this.hoveredHighkey) {
                    this.hoveredHighkey = false;
                    this.endHighkeyHover();
                }
                document.body.style.cursor = 'pointer';
                this.updateTooltipPosition(event.clientX, event.clientY);
            }
        } else {
            if (this.hoveredPyramid) {
                this.hoveredPyramid = false;
                this.endPyramidHover();
            }
            if (this.hoveredHighkey) {
                this.hoveredHighkey = false;
                this.endHighkeyHover();
            }
            if (this.hoveredScotty) {
                this.hoveredScotty = false;
                this.endScottyHover();
            }
            document.body.style.cursor = 'default';
        }
    }

    updateTooltipPosition(mouseX, mouseY) {
        if (!this.tooltip) return;

        const tooltipWidth = 250;
        const tooltipHeight = 80;
        const padding = 20;

        let x = mouseX + 15;
        let y = mouseY - tooltipHeight - 15;

        // Keep tooltip within viewport
        if (x + tooltipWidth > window.innerWidth - padding) {
            x = mouseX - tooltipWidth - 15;
        }
        if (y < padding) {
            y = mouseY + 15;
        }

        this.tooltip.style.left = x + 'px';
        this.tooltip.style.top = y + 'px';
    }

    startPyramidHover() {
        if (!this.transamericaPyramid) return;

        // Store original scale if not already stored
        if (!this.pyramidOriginalScale) {
            this.pyramidOriginalScale = this.transamericaPyramid.scale.clone();
        }

        // Use GSAP if available, otherwise use direct animation
        if (typeof gsap !== 'undefined') {
            // Animate hover effects with GSAP
            gsap.to(this.transamericaPyramid.scale, {
                duration: 0.3,
                x: 1.05,
                y: 1.05,
                z: 1.05,
                ease: "power2.out"
            });

            gsap.to(this.transamericaPyramid.position, {
                duration: 0.3,
                y: 14.5,
                ease: "power2.out"
            });

            // Add glow effect
            gsap.to(this.transamericaPyramid.material, {
                duration: 0.3,
                opacity: 1,
                ease: "power2.out"
            });
        } else {
            // Fallback direct animation
            this.transamericaPyramid.scale.setScalar(1.05);
            this.transamericaPyramid.position.y = 14.5;
            this.transamericaPyramid.material.opacity = 1;
        }

        // Change material color to add highlight
        this.transamericaPyramid.material.emissive.setHex(0x331100);

        // Create particle effect around pyramid
        this.createPyramidParticles();

        // Show tooltip
        if (this.tooltip) {
            this.tooltip.classList.add('show');
            const titleEl = this.tooltip.querySelector('h4');
            const pEl = this.tooltip.querySelector('p');
            if (titleEl) titleEl.textContent = 'Transamerica Pyramid';
            if (pEl) pEl.textContent = 'Click to learn about Hardy Digital Labs';
        }
    }

    endPyramidHover() {
        if (!this.transamericaPyramid || !this.pyramidOriginalScale) return;

        // Use GSAP if available, otherwise use direct animation
        if (typeof gsap !== 'undefined') {
            // Animate back to original state
            gsap.to(this.transamericaPyramid.scale, {
                duration: 0.3,
                x: this.pyramidOriginalScale.x,
                y: this.pyramidOriginalScale.y,
                z: this.pyramidOriginalScale.z,
                ease: "power2.out"
            });

            gsap.to(this.transamericaPyramid.position, {
                duration: 0.3,
                y: 12.5,
                ease: "power2.out"
            });

            gsap.to(this.transamericaPyramid.material, {
                duration: 0.3,
                opacity: 0.95,
                ease: "power2.out"
            });
        } else {
            // Fallback direct animation
            this.transamericaPyramid.scale.copy(this.pyramidOriginalScale);
            this.transamericaPyramid.position.y = 12.5;
            this.transamericaPyramid.material.opacity = 0.95;
        }

        // Remove glow effect
        this.transamericaPyramid.material.emissive.setHex(0x000000);

        // Remove particle effect
        this.removePyramidParticles();

        // Hide tooltip
        if (this.tooltip) {
            this.tooltip.classList.remove('show');
        }
    }

    startHighkeyHover() {
        if (!this.highkeyBuilding) return;
        if (!this.highkeyOriginalScale) {
            this.highkeyOriginalScale = this.highkeyBuilding.scale.clone();
        }
        if (typeof gsap !== 'undefined') {
            gsap.to(this.highkeyBuilding.scale, {
                duration: 0.3,
                x: 1.06,
                y: 1.06,
                z: 1.06,
                ease: 'power2.out'
            });
        } else {
            this.highkeyBuilding.scale.setScalar(1.06);
        }
        // Subtle emissive
        if (this.highkeyBuilding.material && this.highkeyBuilding.material.emissive) {
            this.highkeyBuilding.material.emissive.setHex(0xFF8C00);
            this.highkeyBuilding.material.emissiveIntensity = 0.4;
        }
        if (this.tooltip) {
            this.tooltip.classList.add('show');
            const titleEl = this.tooltip.querySelector('h4');
            const pEl = this.tooltip.querySelector('p');
            if (titleEl) titleEl.textContent = 'Highkey Morgan';
            if (pEl) pEl.textContent = 'Click to view portfolio at highkeymorgan.com';
        }
    }

    endHighkeyHover() {
        if (!this.highkeyBuilding || !this.highkeyOriginalScale) return;
        if (typeof gsap !== 'undefined') {
            gsap.to(this.highkeyBuilding.scale, {
                duration: 0.3,
                x: this.highkeyOriginalScale.x,
                y: this.highkeyOriginalScale.y,
                z: this.highkeyOriginalScale.z,
                ease: 'power2.out'
            });
        } else {
            this.highkeyBuilding.scale.copy(this.highkeyOriginalScale);
        }
        if (this.highkeyBuilding.material && this.highkeyBuilding.material.emissive) {
            this.highkeyBuilding.material.emissive.setHex(0x000000);
            this.highkeyBuilding.material.emissiveIntensity = 0;
        }
        if (this.tooltip) {
            this.tooltip.classList.remove('show');
        }
    }

    startScottyHover() {
        if (!this.scottydBuilding) return;
        if (!this.scottyOriginalScale) {
            this.scottyOriginalScale = this.scottydBuilding.scale.clone();
        }
        if (typeof gsap !== 'undefined') {
            gsap.to(this.scottydBuilding.scale, { duration: 0.3, x: 1.06, y: 1.06, z: 1.06, ease: 'power2.out' });
        } else {
            this.scottydBuilding.scale.setScalar(1.06);
        }
        if (this.scottydBuilding.material && this.scottydBuilding.material.emissive) {
            this.scottydBuilding.material.emissive.setHex(0x3A86FF);
            this.scottydBuilding.material.emissiveIntensity = 0.4;
        }
        if (this.tooltip) {
            this.tooltip.classList.add('show');
            const titleEl = this.tooltip.querySelector('h4');
            const pEl = this.tooltip.querySelector('p');
            if (titleEl) titleEl.textContent = 'scottyd';
            if (pEl) pEl.textContent = 'Click to visit scottyd.info';
        }
    }

    endScottyHover() {
        if (!this.scottydBuilding || !this.scottyOriginalScale) return;
        if (typeof gsap !== 'undefined') {
            gsap.to(this.scottydBuilding.scale, { duration: 0.3, x: this.scottyOriginalScale.x, y: this.scottyOriginalScale.y, z: this.scottyOriginalScale.z, ease: 'power2.out' });
        } else {
            this.scottydBuilding.scale.copy(this.scottyOriginalScale);
        }
        if (this.scottydBuilding.material && this.scottydBuilding.material.emissive) {
            this.scottydBuilding.material.emissive.setHex(0x000000);
            this.scottydBuilding.material.emissiveIntensity = 0;
        }
        if (this.tooltip) {
            this.tooltip.classList.remove('show');
        }
    }

    createPyramidParticles() {
        if (this.pyramidParticles) return; // Already exists

        const particleCount = 50;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            // Position around the pyramid
            const radius = 4 + Math.random() * 2;
            const angle = Math.random() * Math.PI * 2;
            const height = Math.random() * 20;

            positions[i] = Math.cos(angle) * radius; // x
            positions[i + 1] = height - 5; // y
            positions[i + 2] = Math.sin(angle) * radius; // z

            // Orange/gold colors
            colors[i] = 1.0; // red
            colors[i + 1] = 0.4 + Math.random() * 0.4; // green
            colors[i + 2] = 0.1; // blue

            // Upward movement with slight rotation
            velocities[i] = (Math.random() - 0.5) * 0.02;
            velocities[i + 1] = 0.05 + Math.random() * 0.03;
            velocities[i + 2] = (Math.random() - 0.5) * 0.02;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 1.5,
            transparent: true,
            opacity: 0.8,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.pyramidParticles = new THREE.Points(particles, particleMaterial);
        this.pyramidParticles.position.copy(this.transamericaPyramid.position);
        this.scene.add(this.pyramidParticles);
    }

    removePyramidParticles() {
        if (this.pyramidParticles) {
            this.scene.remove(this.pyramidParticles);
            this.pyramidParticles.geometry.dispose();
            this.pyramidParticles.material.dispose();
            this.pyramidParticles = null;
        }
    }

    // --- Highkey Heels Effect (2D sprites) ---
    createHighHeelsEffect(anchorBuilding) {
        const texture = this.createEmojiTexture('👠', 512);
        const radius = Math.max(2.5, (anchorBuilding.userData?.height || 10) * 0.25); // scale with building
        const baseY = anchorBuilding.position.y + (anchorBuilding.userData?.height || 10) * 0.55; // mid-upper section
        const count = 7;
        for (let i = 0; i < count; i++) {
            const material = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                depthWrite: false,
                opacity: 0.95
            });
            const sprite = new THREE.Sprite(material);
            const angle = (i / count) * Math.PI * 2;
            sprite.position.set(
                anchorBuilding.position.x + Math.cos(angle) * radius,
                baseY + (Math.random() * 1.0 - 0.5),
                anchorBuilding.position.z + Math.sin(angle) * radius
            );
            // Size in world units (width, height)
            const s = (0.6 + Math.random() * 0.2) * this.spriteScaleFactor; // responsive
            sprite.scale.set(s, s, 1);
            sprite.userData = {
                anchor: anchorBuilding,
                angle,
                angularSpeed: 0.45 + Math.random() * 0.25, // quicker orbit to catch eye
                radius: radius + (Math.random() * 0.8 - 0.4),
                bobSpeed: 1 + Math.random() * 0.5,
                bobAmp: 0.18 + Math.random() * 0.14,
                baseScale: s
            };
            this.scene.add(sprite);
            this.highkeyHeels.push(sprite);
        }
    }

    createEmojiTexture(emoji, size) {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, size, size);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `${Math.floor(size * 0.84)}px Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif`;
        // Soft shadow for readability
        ctx.shadowColor = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur = size * 0.06;
        ctx.fillText(emoji, size / 2, size / 2);
        const tex = new THREE.CanvasTexture(canvas);
        tex.needsUpdate = true;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = 4;
        return tex;
    }

    updateHighHeelsEffect() {
        if (!this.highkeyHeels || this.highkeyHeels.length === 0) return;
        const t = performance.now() * 0.001;
        for (const g of this.highkeyHeels) {
            const d = g.userData;
            if (!d || !d.anchor) continue;
            d.angle += d.angularSpeed * 0.0065; // faster orbit
            const y = d.anchor.position.y + (d.anchor.userData?.height || 10) * 0.55 + Math.sin(t * d.bobSpeed) * d.bobAmp;
            const x = d.anchor.position.x + Math.cos(d.angle) * d.radius;
            const z = d.anchor.position.z + Math.sin(d.angle) * d.radius;
            g.position.set(x, y, z);
            // Sprites always face camera; apply gentle, non-accumulating size pulse
            const scalePulse = 1 + 0.08 * Math.sin(t * 1.2 + d.angle);
            const newScale = Math.min(0.9, Math.max(0.2, d.baseScale * scalePulse));
            g.scale.set(newScale, newScale, 1);
        }
    }

    // --- ScottyD music notes (2D sprites) ---
    createMusicNotesEffect(anchorBuilding) {
        const notes = ['🎵', '🎶', '🎧'];
        const textures = notes.map(n => this.createEmojiTexture(n, 512));
        const radius = Math.max(2.6, (anchorBuilding.userData?.height || 10) * 0.22);
        const baseY = anchorBuilding.position.y + (anchorBuilding.userData?.height || 10) * 0.6;
        const count = 8;
        for (let i = 0; i < count; i++) {
            const mat = new THREE.SpriteMaterial({ map: textures[i % textures.length], transparent: true, depthWrite: false, opacity: 0.95 });
            const sprite = new THREE.Sprite(mat);
            const angle = (i / count) * Math.PI * 2;
            sprite.position.set(
                anchorBuilding.position.x + Math.cos(angle) * radius,
                baseY + (Math.random() * 1.2 - 0.6),
                anchorBuilding.position.z + Math.sin(angle) * radius
            );
            const s = (0.6 + Math.random() * 0.2) * this.spriteScaleFactor;
            sprite.scale.set(s, s, 1);
            sprite.userData = {
                anchor: anchorBuilding,
                angle,
                angularSpeed: 0.35 + Math.random() * 0.25,
                radius: radius + (Math.random() * 0.8 - 0.4),
                bobSpeed: 0.9 + Math.random() * 0.6,
                bobAmp: 0.16 + Math.random() * 0.16,
                baseScale: s
            };
            this.scene.add(sprite);
            this.scottydNotes.push(sprite);
        }
    }

    updateMusicNotesEffect() {
        if (!this.scottydNotes || this.scottydNotes.length === 0) return;
        const t = performance.now() * 0.001;
        for (const g of this.scottydNotes) {
            const d = g.userData;
            if (!d || !d.anchor) continue;
            d.angle += d.angularSpeed * 0.0055;
            const y = d.anchor.position.y + (d.anchor.userData?.height || 10) * 0.6 + Math.sin(t * d.bobSpeed) * d.bobAmp;
            const x = d.anchor.position.x + Math.cos(d.angle) * d.radius;
            const z = d.anchor.position.z + Math.sin(d.angle) * d.radius;
            g.position.set(x, y, z);
            const scalePulse = 1 + 0.06 * Math.sin(t * 1.3 + d.angle);
            const newScale = Math.min(1.0, Math.max(0.25, d.baseScale * scalePulse));
            g.scale.set(newScale, newScale, 1);
        }
    }

    updatePyramidParticles() {
        if (!this.pyramidParticles) return;

        const positions = this.pyramidParticles.geometry.attributes.position.array;
        const velocities = this.pyramidParticles.geometry.attributes.velocity.array;

        for (let i = 0; i < positions.length; i += 3) {
            // Move particles
            positions[i] += velocities[i];
            positions[i + 1] += velocities[i + 1];
            positions[i + 2] += velocities[i + 2];

            // Reset particles that go too high or far
            if (positions[i + 1] > 30) {
                positions[i + 1] = -5;
                const radius = 4 + Math.random() * 2;
                const angle = Math.random() * Math.PI * 2;
                positions[i] = Math.cos(angle) * radius;
                positions[i + 2] = Math.sin(angle) * radius;
            }
        }

        this.pyramidParticles.geometry.attributes.position.needsUpdate = true;

        // Keep particles positioned relative to pyramid
        this.pyramidParticles.position.copy(this.transamericaPyramid.position);
    }

    onClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Check intersection with interactive objects
        const interactiveObjects = [this.transamericaPyramid];
        if (this.splitTipBuilding) {
            interactiveObjects.push(this.splitTipBuilding);
        }
        if (this.highkeyBuilding) {
            interactiveObjects.push(this.highkeyBuilding);
        }
        if (this.scottydBuilding) {
            interactiveObjects.push(this.scottydBuilding);
        }

        const intersects = this.raycaster.intersectObjects(interactiveObjects);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            if (clickedObject === this.transamericaPyramid) {
                this.showAboutPanel();
            } else if (clickedObject === this.splitTipBuilding) {
                this.showSplitTipPanel();
            } else if (clickedObject === this.highkeyBuilding) {
                this.showHighkeyPanel();
            } else if (clickedObject === this.scottydBuilding) {
                this.showScottyDPanel();
            }
        }
    }

    showAboutPanel() {
        // Create the About panel content
        const aboutPanel = document.getElementById('about-modal');

        if (!aboutPanel) {
            this.createAboutPanel();
            return;
        }

        // Show the About panel with animation
        aboutPanel.classList.add('show');

        // Make sure CTA button has event listener
        const ctaButton = aboutPanel.querySelector('.cta-button');
        if (ctaButton && !ctaButton.hasAttribute('data-listener-added')) {
            ctaButton.addEventListener('click', () => {
                this.hideAboutPanel();
                this.showProjectForm();
            });
            ctaButton.setAttribute('data-listener-added', 'true');
        }

        // Animate in the panel
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(aboutPanel.querySelector('.about-content'),
                {
                    opacity: 0,
                    scale: 0.8,
                    y: 50
                },
                {
                    duration: 0.5,
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    ease: "power2.out"
                }
            );
        }
    }

    createAboutPanel() {
        // Create the About panel dynamically
        const aboutModal = document.createElement('div');
        aboutModal.id = 'about-modal';
        aboutModal.className = 'modal about-modal';

        aboutModal.innerHTML = `
            <div class="about-content">
                <span class="close-about">&times;</span>
                <div class="about-header">
                    <img src="logo.svg" alt="Hardy Digital Labs Logo" class="about-logo">
                    <h2>About Hardy Digital Labs</h2>
                </div>
                <div class="about-body">
                    <div class="about-section">
                        <h3>🚀 Our Mission</h3>
                        <p>To create exceptional iOS apps and modern websites that deliver seamless user experiences. I transform ideas into polished digital products that users love and businesses rely on.</p>
                    </div>
                    
                    <div class="about-section">
                        <h3>💡 Our Vision</h3>
                        <p>Building the future of mobile and web experiences through clean code, intuitive design, and cutting-edge technologies that make everyday tasks effortless.</p>
                    </div>
                    
                    <div class="about-section">
                        <h3>⚡ Core Services</h3>
                        <div class="services-list">
                            <div class="service-item">
                                <strong>iOS App Development</strong>
                                <p>Swift, SwiftUI, and native iOS experiences</p>
                            </div>
                            <div class="service-item">
                                <strong>Modern Web Development</strong>
                                <p>React, Next.js, and responsive web applications</p>
                            </div>
                            <div class="service-item">
                                <strong>UI/UX Design</strong>
                                <p>User-centered design that prioritizes functionality and aesthetics</p>
                            </div>
                            <div class="service-item">
                                <strong>Custom Solutions</strong>
                                <p>Tailored mobile and web applications for unique business needs</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="about-section">
                        <h3>🚧 Current Projects</h3>
                        <p>I'm currently building 12 exciting new apps and websites that showcase the latest in iOS and web development. These projects represent innovative solutions across various industries and demonstrate cutting-edge mobile and web technologies.</p>
                    </div>
                    
                    <div class="about-section">
                        <h3>📢 Major Announcement Coming November 2025</h3>
                        <p>Stay tuned for a major announcement in November 2025 that will reveal these groundbreaking projects and introduce new opportunities in the Hardy Digital Labs ecosystem.</p>
                    </div>
                    
                    <div class="about-section">
                        <h3>📱 Featured App</h3>
                        <p>Check out my latest iOS app on the App Store:<br>
                        <a href="https://apps.apple.com/us/app/splittip-pro/id6746974894" class="appstore-link" target="_blank" rel="noopener noreferrer">SplitTip Pro</a> - Available now on the App Store</p>
                    </div>
                    
                    <div class="about-section">
                        <h3>👨‍💻 About Me</h3>
                        <p>A passionate iOS and web developer based in San Francisco. I specialize in creating apps and websites that combine Silicon Valley innovation with exceptional user experience.</p>
                        <div class="team-stats">
                            <div class="stat-item">
                                <span class="stat-number">10+</span>
                                <span class="stat-label">Apps/Websites Built</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">iOS</span>
                                <span class="stat-label">App Store Publications</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">Mobile-First</span>
                                <span class="stat-label">Development</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">Happy</span>
                                <span class="stat-label">Clients Worldwide</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="about-cta">
                        <p>Ready to bring your app or website idea to life?</p>
                        <button class="cta-button">Start Your Project</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(aboutModal);

        // Add event listeners
        aboutModal.querySelector('.close-about').addEventListener('click', () => {
            this.hideAboutPanel();
        });

        aboutModal.addEventListener('click', (event) => {
            if (event.target === aboutModal) {
                this.hideAboutPanel();
            }
        });

        // Add CTA button event listener
        aboutModal.querySelector('.cta-button').addEventListener('click', () => {
            this.hideAboutPanel();
            this.showProjectForm();
        });

        // Show the panel
        aboutModal.classList.add('show');

        // Animate in
        gsap.fromTo(aboutModal.querySelector('.about-content'),
            {
                opacity: 0,
                scale: 0.8,
                y: 50
            },
            {
                duration: 0.5,
                opacity: 1,
                scale: 1,
                y: 0,
                ease: "power2.out"
            }
        );
    }

    hideAboutPanel() {
        const aboutPanel = document.getElementById('about-modal');
        if (!aboutPanel) return;

        // Animate out
        if (typeof gsap !== 'undefined') {
            gsap.to(aboutPanel.querySelector('.about-content'), {
                duration: 0.3,
                opacity: 0,
                scale: 0.8,
                y: 30,
                ease: "power2.in",
                onComplete: () => {
                    aboutPanel.classList.remove('show');
                }
            });
        } else {
            aboutPanel.classList.remove('show');
        }
    }

    showProjectForm() {
        // Create the Project Form if it doesn't exist
        const projectForm = document.getElementById('project-form-modal');

        if (!projectForm) {
            this.createProjectForm();
            return;
        }

        // Show the Project Form with animation
        projectForm.classList.add('show');

        // Dispatch modal open event for accessibility
        window.dispatchEvent(new CustomEvent('modal-open', {
            detail: { modal: projectForm }
        }));

        // Animate in the form
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(projectForm.querySelector('.project-form-content'),
                {
                    opacity: 0,
                    scale: 0.9,
                    y: 50
                },
                {
                    duration: 0.5,
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    ease: "power2.out"
                }
            );
        }
    }

    createProjectForm() {
        const lang = localStorage.getItem('language') || 'en';
        const t = translations[lang];

        // Create the Project Form modal dynamically
        const projectModal = document.createElement('div');
        projectModal.id = 'project-form-modal';
        projectModal.className = 'modal project-form-modal';

        projectModal.innerHTML = `
            <div class="project-form-content">
                <span class="close-project-form">&times;</span>
                <div class="form-header">
                    <img src="logo.svg" alt="${t.altText.logo}" class="form-logo">
                    <h2>${t.projectForm.title}</h2>
                    <p>${t.projectForm.subtitle}</p>
                </div>
                
                <form id="project-inquiry-form" class="project-form">
                    <!-- Project Details Section -->
                    <div class="form-section">
                        <h3>${t.projectForm.sections.projectDetails}</h3>
                        
                        <div class="form-group">
                            <label>${t.projectForm.fields.projectType}</label>
                            <div class="radio-group">
                                <label class="radio-option">
                                    <input type="radio" name="projectType" value="ios-app" required>
                                    <span class="radio-custom"></span>
                                    ${t.projectForm.options.projectTypes.ios}
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="projectType" value="website" required>
                                    <span class="radio-custom"></span>
                                    ${t.projectForm.options.projectTypes.website}
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="projectType" value="ui-ux" required>
                                    <span class="radio-custom"></span>
                                    ${t.projectForm.options.projectTypes.uiux}
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="projectType" value="custom" required>
                                    <span class="radio-custom"></span>
                                    ${t.projectForm.options.projectTypes.custom}
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="timeline">${t.projectForm.fields.projectTimeline}</label>
                            <select id="timeline" name="timeline" required>
                                <option value="">${t.projectForm.options.timelines.placeholder}</option>
                                <option value="1-2-months">${t.projectForm.options.timelines.short}</option>
                                <option value="3-4-months">${t.projectForm.options.timelines.medium}</option>
                                <option value="5-6-months">${t.projectForm.options.timelines.long}</option>
                                <option value="6-plus-months">${t.projectForm.options.timelines.extended}</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="budget">${t.projectForm.fields.budgetRange}</label>
                            <select id="budget" name="budget" required>
                                <option value="">${t.projectForm.options.budgets.placeholder}</option>
                                <option value="5k-15k">${t.projectForm.options.budgets.tier1}</option>
                                <option value="15k-30k">${t.projectForm.options.budgets.tier2}</option>
                                <option value="30k-50k">${t.projectForm.options.budgets.tier3}</option>
                                <option value="50k-plus">${t.projectForm.options.budgets.tier4}</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="description">${t.projectForm.fields.projectDescription}</label>
                            <textarea id="description" name="description" rows="4" required 
                                placeholder="${t.projectForm.placeholders.projectDescription}"></textarea>
                        </div>
                    </div>
                    
                    <!-- Contact Information Section -->
                    <div class="form-section">
                        <h3>${t.projectForm.sections.contactInfo}</h3>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="name">${t.projectForm.fields.name}</label>
                                <input type="text" id="name" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="email">${t.projectForm.fields.email}</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="company">${t.projectForm.fields.company}</label>
                                <input type="text" id="company" name="company">
                            </div>
                            <div class="form-group">
                                <label for="phone">${t.projectForm.fields.phone}</label>
                                <input type="tel" id="phone" name="phone">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Additional Details Section -->
                    <div class="form-section">
                        <h3>${t.projectForm.sections.additionalDetails}</h3>
                        
                        <div class="form-group">
                            <label>${t.projectForm.fields.hasBuiltBefore}</label>
                            <div class="radio-group inline">
                                <label class="radio-option">
                                    <input type="radio" name="previousExperience" value="yes">
                                    <span class="radio-custom"></span>
                                    ${t.projectForm.options.yesNo.yes}
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="previousExperience" value="no">
                                    <span class="radio-custom"></span>
                                    ${t.projectForm.options.yesNo.no}
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>${t.projectForm.fields.hasDesigns}</label>
                            <div class="radio-group inline">
                                <label class="radio-option">
                                    <input type="radio" name="existingDesigns" value="yes">
                                    <span class="radio-custom"></span>
                                    ${t.projectForm.options.yesNo.yes}
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="existingDesigns" value="no">
                                    <span class="radio-custom"></span>
                                    ${t.projectForm.options.yesNo.no}
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="communication">${t.projectForm.fields.preferredComm}</label>
                            <select id="communication" name="communication">
                                <option value="email">${t.projectForm.options.communication.email}</option>
                                <option value="phone">${t.projectForm.options.communication.phone}</option>
                                <option value="video-call">${t.projectForm.options.communication.video}</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="notes">${t.projectForm.fields.additionalNotes}</label>
                            <textarea id="notes" name="notes" rows="3" 
                                placeholder="${t.projectForm.placeholders.additionalNotes}"></textarea>
                        </div>
                    </div>
                    
                    <!-- Form Actions -->
                    <div class="form-actions">
                        <button type="submit" class="submit-button">${t.projectForm.buttons.submit}</button>
                        <p class="form-note">${t.projectForm.messages.formNote}</p>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(projectModal);

        // Add event listeners
        projectModal.querySelector('.close-project-form').addEventListener('click', () => {
            this.hideProjectForm();
        });

        projectModal.addEventListener('click', (event) => {
            if (event.target === projectModal) {
                this.hideProjectForm();
            }
        });

        // Form submission handler
        const form = projectModal.querySelector('#project-inquiry-form');
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.handleFormSubmission(form);
        });

        // Show the form
        projectModal.classList.add('show');

        // Animate in
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(projectModal.querySelector('.project-form-content'),
                {
                    opacity: 0,
                    scale: 0.9,
                    y: 50
                },
                {
                    duration: 0.5,
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    ease: "power2.out"
                }
            );
        }
    }

    hideProjectForm() {
        const projectForm = document.getElementById('project-form-modal');
        if (!projectForm) return;

        // Animate out
        if (typeof gsap !== 'undefined') {
            gsap.to(projectForm.querySelector('.project-form-content'), {
                duration: 0.3,
                opacity: 0,
                scale: 0.9,
                y: 30,
                ease: "power2.in",
                onComplete: () => {
                    projectForm.classList.remove('show');
                    // Dispatch modal close event for accessibility
                    window.dispatchEvent(new CustomEvent('modal-close'));
                }
            });
        } else {
            projectForm.classList.remove('show');
            // Dispatch modal close event for accessibility
            window.dispatchEvent(new CustomEvent('modal-close'));
        }
    }

    handleFormSubmission(form) {
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Basic validation
        if (!this.validateForm(form)) {
            return;
        }

        // Create email body
        const emailBody = this.createEmailBody(data);

        // Create mailto link
        const subject = encodeURIComponent(`Project Inquiry: ${data.projectType || 'New Project'}`);
        const body = encodeURIComponent(emailBody);
        const mailtoLink = `mailto:hello@hardydigitallabs.com?subject=${subject}&body=${body}`;

        // Open email client
        window.location.href = mailtoLink;

        // Show success message
        this.showSuccessMessage();
    }

    validateForm(form) {
        const lang = localStorage.getItem('language') || 'en';
        const t = translations[lang];
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, t.validation.required);
                isValid = false;
            } else {
                this.clearFieldError(field);
            }
        });

        // Email validation
        const emailField = form.querySelector('[type="email"]');
        if (emailField && emailField.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value)) {
                this.showFieldError(emailField, t.validation.invalidEmail);
                isValid = false;
            }
        }

        return isValid;
    }

    showFieldError(field, message) {
        // Remove existing error
        this.clearFieldError(field);

        // Add error class
        field.classList.add('error');

        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;

        // Insert after the field
        field.parentNode.insertBefore(errorDiv, field.nextSibling);
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    createEmailBody(data) {
        return `
PROJECT INQUIRY FROM ${data.name}

PROJECT DETAILS:
- Type: ${data.projectType || 'Not specified'}
- Timeline: ${data.timeline || 'Not specified'}
- Budget: ${data.budget || 'Not specified'}
- Description: ${data.description || 'Not provided'}

CONTACT INFORMATION:
- Name: ${data.name}
- Email: ${data.email}
- Company: ${data.company || 'Not provided'}
- Phone: ${data.phone || 'Not provided'}

ADDITIONAL DETAILS:
- Previous experience: ${data.previousExperience || 'Not specified'}
- Existing designs: ${data.existingDesigns || 'Not specified'}
- Preferred communication: ${data.communication || 'Email'}
- Additional notes: ${data.notes || 'None'}

---
Sent from Hardy Digital Labs 3D Website
        `.trim();
    }

    showSuccessMessage() {
        const lang = localStorage.getItem('language') || 'en';
        const t = translations[lang];
        const projectForm = document.getElementById('project-form-modal');
        if (!projectForm) return;

        const formContent = projectForm.querySelector('.project-form-content');

        // Replace form content with success message
        formContent.innerHTML = `
            <div class="success-message">
                <div class="success-icon">✅</div>
                <h2>${t.projectForm.messages.successTitle}</h2>
                <p>${t.projectForm.messages.successMessage}</p>
                <p>${t.projectForm.messages.successFollowup}</p>
                <button class="success-button" onclick="document.getElementById('project-form-modal').querySelector('.close-project-form').click()">
                    ${t.projectForm.buttons.backToCity}
                </button>
            </div>
        `;

        // Add success styles
        formContent.classList.add('success-state');

        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideProjectForm();
        }, 5000);
    }

    showSplitTipPanel() {
        // Create the SplitTip Pro panel content
        const splitTipPanel = document.getElementById('splittip-modal');

        if (!splitTipPanel) {
            this.createSplitTipPanel();
            return;
        }

        // Show the SplitTip Pro panel with animation
        splitTipPanel.classList.add('show');

        // Animate in the panel
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(splitTipPanel.querySelector('.splittip-content'),
                {
                    opacity: 0,
                    scale: 0.8,
                    y: 50
                },
                {
                    duration: 0.5,
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    ease: "power2.out"
                }
            );
        }
    }

    createSplitTipPanel() {
        // Create the SplitTip Pro panel dynamically
        const splitTipModal = document.createElement('div');
        splitTipModal.id = 'splittip-modal';
        splitTipModal.className = 'modal splittip-modal';

        splitTipModal.innerHTML = `
            <div class="splittip-content">
                <span class="close-splittip">&times;</span>
                <div class="splittip-header">
                    <div class="app-icon">
                        <div class="icon-background">
                            <span class="dollar-sign">$</span>
                        </div>
                    </div>
                    <div class="app-info">
                        <h2>SplitTip Pro</h2>
                        <p class="app-category">Finance</p>
                        <p class="app-developer">By Scott Hardy</p>
                    </div>
                </div>
                
                <div class="app-description">
                    <h3>About SplitTip Pro</h3>
                    <p>The ultimate tip calculator and bill splitting app. SplitTip Pro makes it easy to calculate tips, split bills among friends, and save your calculation history.</p>
                    
                    <div class="app-features">
                        <h4>Features:</h4>
                        <ul>
                            <li>💰 Accurate tip calculations</li>
                            <li>👥 Easy bill splitting among multiple people</li>
                            <li>📊 Calculation history</li>
                            <li>🎨 Clean, intuitive interface</li>
                            <li>📱 Optimized for iPhone and iPad</li>
                        </ul>
                    </div>
                    
                    <div class="app-ratings">
                        <div class="rating-info">
                            <span class="age-rating">4+</span>
                            <span class="category">Finance</span>
                            <span class="developer">Scott Hardy</span>
                        </div>
                    </div>
                </div>
                
                <div class="cta-section">
                    <a href="https://apps.apple.com/us/app/splittip-pro/id6746974894" 
                       target="_blank" 
                       rel="noopener noreferrer" 
                       class="appstore-button">
                        📱 View in App Store
                    </a>
                </div>
            </div>
        `;

        document.body.appendChild(splitTipModal);

        // Add event listeners
        const closeButton = splitTipModal.querySelector('.close-splittip');
        closeButton.addEventListener('click', () => {
            this.hideSplitTipPanel();
        });

        // Close on outside click
        splitTipModal.addEventListener('click', (e) => {
            if (e.target === splitTipModal) {
                this.hideSplitTipPanel();
            }
        });

        // Animate in with GSAP
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(splitTipModal.querySelector('.splittip-content'),
                {
                    opacity: 0,
                    scale: 0.8,
                    y: 50
                },
                {
                    duration: 0.5,
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    ease: "power2.out"
                }
            );
        }
    }

    hideSplitTipPanel() {
        const splitTipPanel = document.getElementById('splittip-modal');
        if (!splitTipPanel) return;

        // Animate out
        if (typeof gsap !== 'undefined') {
            gsap.to(splitTipPanel.querySelector('.splittip-content'), {
                duration: 0.3,
                opacity: 0,
                scale: 0.8,
                y: 30,
                ease: "power2.in",
                onComplete: () => {
                    splitTipPanel.classList.remove('show');
                }
            });
        } else {
            splitTipPanel.classList.remove('show');
        }
    }

    // Highkey Morgan modal
    showHighkeyPanel() {
        const modal = document.getElementById('highkey-modal');
        if (!modal) {
            this.createHighkeyPanel();
            return;
        }
        modal.classList.add('show');
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(modal.querySelector('.about-content'),
                { opacity: 0, scale: 0.9, y: 30 },
                { duration: 0.4, opacity: 1, scale: 1, y: 0, ease: 'power2.out' }
            );
        }
    }

    createHighkeyPanel() {
        const highkeyModal = document.createElement('div');
        highkeyModal.id = 'highkey-modal';
        highkeyModal.className = 'modal highkey-modal';
        highkeyModal.innerHTML = `
            <div class="about-content">
                <span class="close-about" aria-label="Close">&times;</span>
                <div class="about-header">
                    <img src="logo.svg" alt="Hardy Digital Labs Logo" class="about-logo">
                    <h2>Highkey Morgan</h2>
                </div>
                <div class="about-body">
                    <div class="about-section">
                        <h3>✨ Overview</h3>
                        <p>A Florida-based model passionate about fashion, lifestyle, and commercial work—bringing energy, authenticity, and reliability to every project.</p>
                    </div>
                    <div class="about-section">
                        <h3>📸 Services</h3>
                        <div class="services-list">
                            <div class="service-item"><strong>Fashion Modeling</strong><p>Editorial and brand shoots</p></div>
                            <div class="service-item"><strong>Lifestyle Shoots</strong><p>Authentic, modern visuals</p></div>
                            <div class="service-item"><strong>Commercial</strong><p>Campaigns and promotions</p></div>
                            <div class="service-item"><strong>Social Content</strong><p>Collaborations and partnerships</p></div>
                        </div>
                    </div>
                    <div class="about-cta">
                        <a class="cta-button" href="https://highkeymorgan.com" target="_blank" rel="noopener noreferrer">Visit Website</a>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(highkeyModal);
        const closeBtn = highkeyModal.querySelector('.close-about');
        closeBtn.addEventListener('click', () => highkeyModal.classList.remove('show'));
        highkeyModal.addEventListener('click', (e) => { if (e.target === highkeyModal) highkeyModal.classList.remove('show'); });
        // Animate in
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(highkeyModal.querySelector('.about-content'),
                { opacity: 0, scale: 0.9, y: 30 },
                { duration: 0.4, opacity: 1, scale: 1, y: 0, ease: 'power2.out' }
            );
        }
    }

    // ScottyD modal
    showScottyDPanel() {
        const modal = document.getElementById('scottyd-modal');
        if (!modal) {
            this.createScottyDPanel();
            return;
        }
        modal.classList.add('show');
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(modal.querySelector('.about-content'), { opacity: 0, scale: 0.9, y: 30 }, { duration: 0.4, opacity: 1, scale: 1, y: 0, ease: 'power2.out' });
        }
    }

    createScottyDPanel() {
        const modal = document.createElement('div');
        modal.id = 'scottyd-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="about-content">
                <span class="close-about" aria-label="Close">&times;</span>
                <div class="about-header">
                    <img src="logo.svg" alt="Hardy Digital Labs Logo" class="about-logo">
                    <h2>scottyd</h2>
                </div>
                <div class="about-body">
                    <div class="about-section">
                        <h3>🎧 DJ & Producer</h3>
                        <p>Pop, Rap, and Afrohouse sets with live musician’s ear and smooth, crowd-aware transitions. Explore mixes and bookings.</p>
                    </div>
                    <div class="about-cta">
                        <a class="cta-button" href="https://scottyd.info" target="_blank" rel="noopener noreferrer">Visit Website</a>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);
        const closeBtn = modal.querySelector('.close-about');
        closeBtn.addEventListener('click', () => modal.classList.remove('show'));
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(modal.querySelector('.about-content'), { opacity: 0, scale: 0.9, y: 30 }, { duration: 0.4, opacity: 1, scale: 1, y: 0, ease: 'power2.out' });
        }
    }

    toggleDayNight() {
        this.isNight = !this.isNight;

        if (this.isNight) {
            // Night mode
            this.scene.background = new THREE.Color(0x000033);
            this.scene.fog.color.setHex(0x000033);
            this.ambientLight.intensity = 0.1;
            this.directionalLight.intensity = 0.2;
            this.directionalLight.color.setHex(0x9999FF);
            const currentLang = localStorage.getItem('language') || 'en';
            this.toggleTimeBtn.textContent = translations[currentLang].dayNightToggle.night;

            // Make fog darker and more mysterious at night
            if (this.fogClouds) {
                this.fogClouds.forEach(sprite => {
                    sprite.material.color.setRGB(0.3, 0.3, 0.4);
                    sprite.userData.originalOpacity *= 1.3; // Denser fog at night
                });
            }

            if (this.fogPlanes) {
                this.fogPlanes.forEach(plane => {
                    plane.material.color.setHex(0x333344);
                    plane.material.opacity *= 1.5;
                });
            }

            // Enhance logo glow at night
            if (this.logoLight) {
                this.logoLight.intensity = 0.5;
                this.logoLight.color.setHex(0xff6b35);
            }

            if (this.logoGlow) {
                this.logoGlow.material.opacity = 0.15;
            }

            // Add building lights
            this.buildings.forEach(building => {
                building.children.forEach(child => {
                    if (child.material && child.material.color.getHex() === 0x87CEEB) {
                        child.material.color.setHex(0xFFFF99);
                        child.material.emissive.setHex(0x444422);
                        child.material.opacity = 0.85;
                    }
                });
            });

            // Turn ON bridge lights and glows
            if (this.bridgeLights) {
                this.bridgeLights.forEach(light => {
                    light.intensity = 2.5;
                    if (light.userData.glowMesh) light.userData.glowMesh.visible = true;
                });
            }

            // Make Golden Gate Bridge more visible at night
            if (this.goldenGateBridge) {
                this.goldenGateBridge.children.forEach(child => {
                    if (child.material && child.userData.type) {
                        if (child.userData.type === 'bridgeDeck') {
                            child.material.color.setHex(0xff5500);
                            child.material.emissive = new THREE.Color(0xff5500);
                            child.material.emissiveIntensity = 0.5;
                        }
                        if (child.userData.type === 'bridgeTower') {
                            child.material.color.setHex(0xff7700);
                            child.material.emissive = new THREE.Color(0xff7700);
                            child.material.emissiveIntensity = 0.7;
                        }
                        if (child.userData.type === 'bridgeCable') {
                            child.material.color.setHex(0xffb366);
                        }
                    }
                });
            }
            // Show bridge glow overlays
            if (this.bridgeGlowOverlays) {
                this.bridgeGlowOverlays.forEach(glow => glow.visible = true);
            }
            // Show cars
            if (this.bridgeCars) {
                this.bridgeCars.forEach(carObj => carObj.mesh.visible = true);
            }
            // Prepare flicker indices for night mode
            this.prepareWindowFlicker();
        } else {
            // Day mode
            this.scene.background = new THREE.Color(0x87CEEB);
            this.scene.fog.color.setHex(0x87CEEB);
            this.ambientLight.intensity = 0.4;
            this.directionalLight.intensity = 1;
            this.directionalLight.color.setHex(0xFFFFFF);
            const currentLang = localStorage.getItem('language') || 'en';
            this.toggleTimeBtn.textContent = translations[currentLang].dayNightToggle.day;

            // Make fog lighter and more natural during day
            if (this.fogClouds) {
                this.fogClouds.forEach(sprite => {
                    sprite.material.color.setRGB(0.95, 0.95, 0.98);
                    sprite.userData.originalOpacity = Math.max(0.1, sprite.userData.originalOpacity / 1.3);
                });
            }

            if (this.fogPlanes) {
                this.fogPlanes.forEach(plane => {
                    plane.material.color.setHex(0xffffff);
                    plane.material.opacity = Math.max(0.02, plane.material.opacity / 1.5);
                });
            }

            // Reduce logo glow during day
            if (this.logoLight) {
                this.logoLight.intensity = 0.2;
                this.logoLight.color.setHex(0xff6b35);
            }

            if (this.logoGlow) {
                this.logoGlow.material.opacity = 0.06;
            }

            // Remove building lights
            this.buildings.forEach(building => {
                building.children.forEach(child => {
                    if (child.material && child.material.emissive) {
                        child.material.color.setHex(0x87CEEB);
                        child.material.emissive.setHex(0x000000);
                        child.material.opacity = 0.7;
                    }
                });
            });

            // Turn OFF bridge lights and glows
            if (this.bridgeLights) {
                this.bridgeLights.forEach(light => {
                    light.intensity = 0;
                    if (light.userData.glowMesh) light.userData.glowMesh.visible = false;
                });
            }

            // Restore Golden Gate Bridge original colors in day mode
            if (this.goldenGateBridge) {
                this.goldenGateBridge.children.forEach(child => {
                    if (child.material && child.userData.type) {
                        if (child.userData.type === 'bridgeDeck') {
                            child.material.color.setHex(0xD2691E);
                            child.material.emissive = new THREE.Color(0x000000);
                            child.material.emissiveIntensity = 0;
                        }
                        if (child.userData.type === 'bridgeTower') {
                            child.material.color.setHex(0xFF4500);
                            child.material.emissive = new THREE.Color(0x000000);
                            child.material.emissiveIntensity = 0;
                        }
                        if (child.userData.type === 'bridgeCable') {
                            child.material.color.setHex(0x8B4513);
                        }
                    }
                });
            }
            // Hide bridge glow overlays
            if (this.bridgeGlowOverlays) {
                this.bridgeGlowOverlays.forEach(glow => glow.visible = false);
            }
            // Hide cars
            if (this.bridgeCars) {
                this.bridgeCars.forEach(carObj => carObj.mesh.visible = false);
            }
            // Restore all window opacities/colors
            if (this.windowMeshes) {
                this.windowMeshes.forEach(mesh => {
                    if (mesh.material) {
                        mesh.material.color.setHex(0x87CEEB);
                        mesh.material.emissive.setHex(0x000000);
                        mesh.material.opacity = 0.7;
                    }
                });
            }
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    updateParticles() {
        const time = Date.now() * 0.001;

        // Update fog cloud sprites
        if (this.fogClouds) {
            this.fogClouds.forEach((sprite, index) => {
                const userData = sprite.userData;

                // Add organic wave movement
                const waveX = Math.sin(time * 0.3 + index * 0.1) * 0.005;
                const waveZ = Math.cos(time * 0.2 + index * 0.15) * 0.005;

                // Move fog clouds
                sprite.position.x += userData.velocityX + waveX;
                sprite.position.y += userData.velocityY;
                sprite.position.z += userData.velocityZ + waveZ;

                // Subtle rotation for more realism
                sprite.material.rotation += userData.rotationSpeed;

                // Opacity variation for breathing effect
                const breathe = Math.sin(time * 0.5 + index * 0.2) * 0.02;
                sprite.material.opacity = userData.originalOpacity + breathe;

                // Reset fog clouds that drift too far
                if (userData.isBridgeFog) {
                    // Keep bridge fog concentrated around Golden Gate area
                    if (sprite.position.x < -60 || sprite.position.x > 0) {
                        sprite.position.x = -55 + (Math.random() - 0.5) * 40;
                    }
                    if (Math.abs(sprite.position.z - 35) > 25) {
                        sprite.position.z = 35 + (Math.random() - 0.5) * 20;
                    }
                } else {
                    // Regular city fog
                    if (Math.abs(sprite.position.x) > 70) {
                        sprite.position.x = (Math.random() - 0.5) * 140;
                        sprite.position.z = (Math.random() - 0.5) * 140;
                    }

                    if (Math.abs(sprite.position.z) > 70) {
                        sprite.position.z = (Math.random() - 0.5) * 140;
                        sprite.position.x = (Math.random() - 0.5) * 140;
                    }
                }

                // Keep fog at low altitude
                if (sprite.position.y < 2) {
                    sprite.position.y = 2;
                    userData.velocityY = Math.abs(userData.velocityY);
                }
                if (sprite.position.y > 25) {
                    sprite.position.y = 25;
                    userData.velocityY = -Math.abs(userData.velocityY);
                }
            });
        }

        // Update ground fog planes
        if (this.fogPlanes) {
            this.fogPlanes.forEach((plane, index) => {
                plane.rotation.z += plane.userData.rotationSpeed;

                // Subtle opacity variation
                const pulse = Math.sin(time * 0.3 + index * 0.5) * 0.01;
                plane.material.opacity = Math.max(0.01, plane.userData.originalOpacity + pulse);
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = this.clock.getDelta();

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        // Update particles
        this.updateParticles();
        this.updatePyramidParticles();
        this.updateHighHeelsEffect();
        this.updateMusicNotesEffect();
        // Flicker building windows at night
        this.updateWindowFlicker(delta);
        // Wind sway for trees
        this.updateTreeWind();
        // Wind sway for fog
        this.updateFogWind();

        // Rotate Transamerica Pyramid slowly
        if (this.transamericaPyramid) {
            this.transamericaPyramid.rotation.y += 0.002;
        }

        // Animate logo sprite (gentle bob)
        if (this.logoSprite) {
            this.logoSprite.position.y = 35 + Math.sin(Date.now() * 0.002) * 1.5;
            if (this.logoGlow) {
                this.logoGlow.position.copy(this.logoSprite.position);
            }
            if (this.logoLight) {
                this.logoLight.position.copy(this.logoSprite.position);
                this.logoLight.intensity = 0.25 + Math.sin(Date.now() * 0.004) * 0.08;
            }
        }

        // Animate bridge cables (slight sway)
        if (this.goldenGateBridge) {
            this.goldenGateBridge.children.forEach((child, index) => {
                if (child.geometry instanceof THREE.CylinderGeometry && child.position.y > 15) {
                    child.rotation.z = Math.sin(Date.now() * 0.001 + index) * 0.02;
                }
            });
        }

        // Animate bridge lights (flicker/pulse) and moving headlights
        if (this.isNight && this.bridgeLights && this.bridgeLights.length > 0) {
            const time = performance.now() * 0.001;
            // Flicker/pulse for each bridge light
            this.bridgeLights.forEach((light, i) => {
                // Gentle pulse with some randomness
                const base = 2.5;
                const pulse = 0.5 + 0.3 * Math.sin(time * 2 + i) + 0.2 * Math.sin(time * 3.1 + i * 1.7);
                light.intensity = base + pulse;
                if (light.userData.glowMesh) {
                    const scale = 1 + 0.25 * Math.sin(time * 2 + i);
                    light.userData.glowMesh.scale.set(scale, scale, scale);
                    light.userData.glowMesh.material.opacity = 0.7 + 0.25 * Math.abs(Math.sin(time * 2 + i));
                }
            });
            // Animate moving headlights (two bright white lights)
            if (!this.headlights) {
                this.headlights = [];
                for (let h = 0; h < 2; h++) {
                    const headlight = new THREE.PointLight(0xffffff, 6, 10, 2);
                    headlight.position.set(-55, 10.7, 35 + (h === 0 ? -1.1 : 1.1));
                    this.goldenGateBridge.add(headlight);
                    // Add a visible sphere for the headlight
                    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
                    const geom = new THREE.SphereGeometry(0.28, 10, 10);
                    const mesh = new THREE.Mesh(geom, mat);
                    mesh.position.copy(headlight.position);
                    this.goldenGateBridge.add(mesh);
                    headlight.userData.mesh = mesh;
                    this.headlights.push(headlight);
                }
            }
            // Move headlights from left to right and loop
            const t = (time * 0.6) % 1; // speed
            for (let h = 0; h < 2; h++) {
                const x = -55 + t * 30;
                const z = 35 + (h === 0 ? -1.1 : 1.1);
                this.headlights[h].position.set(x, 10.7, z);
                if (this.headlights[h].userData.mesh) {
                    this.headlights[h].userData.mesh.position.set(x, 10.7, z);
                }
            }
        } else if (this.headlights) {
            // Remove headlights in day mode
            this.headlights.forEach(h => {
                if (h.userData.mesh) {
                    this.goldenGateBridge.remove(h.userData.mesh);
                }
                this.goldenGateBridge.remove(h);
            });
            this.headlights = null;
        }

        // Animate cars on the bridge
        if (this.isNight && this.bridgeCars && this.bridgeCars.length > 0) {
            const time = performance.now() * 0.00022;
            const deckLength = 50;
            const archHeight = 2.5;
            this.bridgeCars.forEach((carObj, idx) => {
                // t goes 0 to 1 for dir=1, 1 to 0 for dir=-1
                let t = ((time + carObj.offset) % 1);
                if (carObj.dir === -1) t = 1 - t;
                const x = -55 + t * deckLength;
                const y = 8 + archHeight * Math.sin(Math.PI * t);
                carObj.mesh.position.set(x, y + 0.5, carObj.mesh.position.z);
                carObj.mesh.rotation.y = carObj.dir === 1 ? 0 : Math.PI;
            });
        }

        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }

    hidePreloader() {
        setTimeout(() => {
            this.preloader.style.opacity = '0';
            setTimeout(() => {
                this.preloader.style.display = 'none';
            }, 500);
        }, 2000);
    }

    // Flicker logic for building windows at night
    prepareWindowFlicker() {
        // Pick a random subset of window indices to flicker
        const count = Math.floor(this.windowMeshes.length * 0.18); // ~18% of windows flicker
        const indices = Array.from({ length: this.windowMeshes.length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        this.flickerWindowIndices = indices.slice(0, count);
        this.flickerTime = 0;
    }

    updateWindowFlicker(delta) {
        if (!this.isNight || !this.windowMeshes || this.windowMeshes.length === 0) return;
        this.flickerTime += delta;
        // Change flicker pattern every ~1.5s
        if (this.flickerTime > 1.5) {
            this.prepareWindowFlicker();
        }
        // Animate flicker
        for (let i = 0; i < this.windowMeshes.length; i++) {
            const mesh = this.windowMeshes[i];
            if (!mesh.material) continue;
            if (this.flickerWindowIndices.includes(i)) {
                // Flicker: some windows go fully dark, some very bright
                const offChance = Math.random();
                if (offChance < 0.18) {
                    // 18% chance: window is off
                    mesh.material.opacity = 0.08 + 0.08 * Math.random();
                    mesh.material.emissive.setHex(0x000000);
                    mesh.material.emissiveIntensity = 0.0;
                } else {
                    // Flicker: wide range
                    mesh.material.opacity = 0.25 + 0.7 * Math.random();
                    mesh.material.emissive.setHex(0xFFFFCC); // very bright yellow
                    mesh.material.emissiveIntensity = 1.2 + 1.0 * Math.random();
                }
            } else {
                // Normal lit window
                mesh.material.opacity = 0.85;
                mesh.material.emissive.setHex(0x444422);
                mesh.material.emissiveIntensity = 0.5;
            }
        }
    }

    updateTreeWind() {
        if (!this.treeLeaves || this.treeLeaves.length === 0) return;
        const time = Date.now() * 0.001;
        for (let i = 0; i < this.treeLeaves.length; i++) {
            const leaf = this.treeLeaves[i];
            // Sway leaves with a sine wave, phase offset by index
            leaf.rotation.z = Math.sin(time * 0.7 + i * 0.5) * 0.18 + Math.sin(time * 0.23 + i) * 0.08;
            leaf.position.x += Math.sin(time * 0.5 + i) * 0.01;
        }
        if (this.treeTrunks && this.treeTrunks.length > 0) {
            for (let i = 0; i < this.treeTrunks.length; i++) {
                const trunk = this.treeTrunks[i];
                trunk.rotation.z = Math.sin(time * 0.6 + i * 0.7) * 0.06;
            }
        }
    }

    updateFogWind() {
        if (!this.fogClouds || this.fogClouds.length === 0) return;
        const time = Date.now() * 0.001;
        // Simulate a gentle wind direction that changes slowly over time
        const windAngle = Math.sin(time * 0.07) * Math.PI * 0.18 + Math.cos(time * 0.03) * Math.PI * 0.09;
        const windStrength = 0.012 + 0.008 * Math.sin(time * 0.13);
        const windX = Math.cos(windAngle) * windStrength;
        const windZ = Math.sin(windAngle) * windStrength;
        for (let i = 0; i < this.fogClouds.length; i++) {
            const sprite = this.fogClouds[i];
            // Add wind to fog velocity
            sprite.position.x += windX * (0.7 + Math.sin(i + time * 0.2) * 0.3);
            sprite.position.z += windZ * (0.7 + Math.cos(i + time * 0.2) * 0.3);
        }
    }

    showError(message) {
        // Show error message to user
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.innerHTML = `
                <div style="text-align: center; color: white; padding: 20px;">
                    <h3>Error Loading 3D Scene</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; background: #ff6b35; border: none; color: white; border-radius: 5px; cursor: pointer;">Refresh Page</button>
                </div>
            `;
        }
    }
}

// Hamburger menu and mobile nav
function addTouchAndClickListener(el, handler) {
    if (!el) return;
    el.addEventListener('click', handler);
    el.addEventListener('touchstart', function (e) {
        e.preventDefault();
        handler(e);
    }, { passive: false });
}

function setupMobileNav() {
    const hamburger = document.getElementById('hamburger-menu');
    const drawer = document.getElementById('mobile-nav-drawer');
    const navBtns = drawer.querySelectorAll('.mobile-nav-btn');
    const overlay = document.getElementById('nav-overlay');
    const panels = document.querySelectorAll('.panel');

    function openMenu(e) {
        console.log('Hamburger menu open');
        drawer.classList.add('open');
        overlay.classList.add('open');
        hamburger.classList.add('active');
    }
    function closeMenu(e) {
        console.log('Hamburger menu close');
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        hamburger.classList.remove('active');
    }

    addTouchAndClickListener(hamburger, openMenu);
    addTouchAndClickListener(overlay, closeMenu);
    navBtns.forEach(btn => {
        addTouchAndClickListener(btn, () => {
            const targetSection = btn.getAttribute('data-section');
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            panels.forEach(panel => panel.classList.remove('active'));
            const targetPanel = document.getElementById(`${targetSection}-panel`);
            if (targetPanel) {
                // Animate out current panel
                panels.forEach(panel => {
                    if (panel.classList.contains('active')) {
                        panel.style.opacity = 1;
                        panel.style.transition = 'opacity 0.3s';
                        panel.style.opacity = 0;
                        setTimeout(() => {
                            panel.classList.remove('active');
                            panel.style.opacity = '';
                            panel.style.transition = '';
                        }, 300);
                    }
                });
                // Animate in new panel
                setTimeout(() => {
                    targetPanel.classList.add('active');
                    targetPanel.style.opacity = 0;
                    targetPanel.style.transition = 'opacity 0.3s';
                    setTimeout(() => {
                        targetPanel.style.opacity = 1;
                        // Update accessibility attributes
                        updatePanelVisibility(targetPanel);
                        // Announce panel change to screen readers
                        const lang = localStorage.getItem('language') || 'en';
                        const t = translations[lang];
                        const panelTitle = targetPanel.querySelector('h2').textContent;
                        announceToScreenReader(`${panelTitle} ${t.accessibility.panelActivated}`);
                        // Focus the panel for keyboard users
                        targetPanel.focus();
                    }, 10);
                    setTimeout(() => {
                        targetPanel.style.opacity = '';
                        targetPanel.style.transition = '';
                    }, 310);
                }, 300);
            }
            // Camera movement for mobile nav
            if (typeof globalSF3D !== 'undefined' && globalSF3D && globalSF3D.animateCameraToSection) {
                globalSF3D.animateCameraToSection(targetSection);
            }
            closeMenu();
        });
    });
    // Close drawer on outside click
    document.addEventListener('touchstart', (e) => {
        if (!drawer.contains(e.target) && !hamburger.contains(e.target) && !overlay.contains(e.target)) {
            closeMenu();
        }
    }, { passive: true });
    document.addEventListener('click', (e) => {
        if (!drawer.contains(e.target) && !hamburger.contains(e.target) && !overlay.contains(e.target)) {
            closeMenu();
        }
    });
}

function setupPanelMinimize() {
    const panel = document.getElementById('home-panel');
    const minimizeBtn = document.getElementById('minimize-panel');
    if (!panel || !minimizeBtn) return;
    addTouchAndClickListener(minimizeBtn, () => {
        panel.classList.toggle('minimized');
        minimizeBtn.innerHTML = panel.classList.contains('minimized') ? '&#x25BC;' : '&#x25B2;';
    });
}

function setupInstructionsBar() {
    const bar = document.getElementById('controls-info-bar');
    const closeBtn = document.getElementById('close-instructions');
    if (!bar || !closeBtn) return;
    let hideTimeout = setTimeout(() => {
        bar.style.display = 'none';
    }, 5000);
    addTouchAndClickListener(closeBtn, () => {
        bar.style.display = 'none';
        clearTimeout(hideTimeout);
    });
}

// 3D Scene: Touch support for raycasting and controls
function setup3DTouchSupport(threeInstance) {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;
    // Touch tap for raycasting
    canvas.addEventListener('touchstart', function (e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const fakeEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            threeInstance.onMouseMove(fakeEvent);
        }
    }, { passive: true });
    canvas.addEventListener('touchend', function (e) {
        if (e.changedTouches.length === 1) {
            const touch = e.changedTouches[0];
            const fakeEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY
            };
            threeInstance.onClick(fakeEvent);
        }
    }, { passive: true });
    // Ensure OrbitControls are set up for touch (already default in Three.js)
}

// Patch SanFrancisco3D to expose instance for touch setup
let globalSF3D = null;
const origInit = SanFrancisco3D.prototype.init;
SanFrancisco3D.prototype.init = async function () {
    try {
        origInit.call(this);
        globalSF3D = this;

        // Set up enhanced touch controls
        if (this.setupEnhancedTouchControls) {
            this.setupEnhancedTouchControls();
        }

        // Apply performance optimizations based on device capabilities
        if (this.applyPerformanceOptimizations) {
            this.applyPerformanceOptimizations();
        }

        // Load assets with priority-based loading
        if (this.loadPriorityAssets) {
            await this.loadPriorityAssets();
        }

        setup3DTouchSupport(this);
    } catch (error) {
        console.error('Error during 3D initialization:', error);
        // Continue with basic initialization even if enhanced features fail
        origInit.call(this);
        globalSF3D = this;
        setup3DTouchSupport(this);
    }
};

// Ensure initialization runs even if this script loads after DOMContentLoaded
async function initializeAppAfterDomReady() {
    try {
        const sf3d = new SanFrancisco3D();
        await sf3d.init();
        setupMobileNav();
    } catch (error) {
        console.error('Failed to initialize 3D scene:', error);
        // Continue with basic functionality even if 3D fails
        setupMobileNav();
    }
    setupPanelMinimize();
    setupInstructionsBar();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAppAfterDomReady);
} else {
    // DOMContentLoaded already fired; run immediately
    initializeAppAfterDomReady();
}


// Star-pattern Golden Gate Bridge emoji loader animation
(function () {
    const loader = document.getElementById('star-loader-container');
    const emojiGroup = document.getElementById('star-emoji-group');
    if (!loader || !emojiGroup) return;

    // Config
    const STAR_POINTS = 6;
    const LAYERS = 2;
    const EMOJI = '🌉';
    const RADIUS = [120, 70]; // px for each layer
    const ROTATE_SPEED = [1, -0.6]; // radians/sec for each layer
    const PULSE_FREQ = 1.2; // Hz
    const ROTATION_PERIOD = 3.5; // seconds for full rotation
    const EMOJIS = [];

    // Create emojis in star/circle pattern
    for (let layer = 0; layer < LAYERS; layer++) {
        for (let i = 0; i < STAR_POINTS; i++) {
            const emoji = document.createElement('span');
            emoji.className = 'star-emoji';
            emoji.innerText = EMOJI;
            emojiGroup.appendChild(emoji);
            EMOJIS.push({ el: emoji, layer, i });
        }
    }

    // Sparkle/twinkle effect
    function sparkle(emoji, t) {
        if (Math.abs(Math.sin(t * 2 + emoji.i)) > 0.98) {
            emoji.el.style.textShadow = '0 0 18px #fff, 0 0 32px #ffd700';
        } else {
            emoji.el.style.textShadow = '';
        }
    }

    // Animate
    let start = null;
    function animateStarLoader(ts) {
        if (!start) start = ts;
        const t = (ts - start) / 1000;
        for (const emoji of EMOJIS) {
            // Star/circle position
            const baseAngle = (emoji.i / STAR_POINTS) * 2 * Math.PI;
            const layer = emoji.layer;
            const rot = t * (2 * Math.PI / ROTATION_PERIOD) * ROTATE_SPEED[layer];
            const angle = baseAngle + rot;
            const r = RADIUS[layer] * (1 + 0.08 * Math.sin(t * 1.1 + layer)); // expand/contract
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;
            emoji.el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            // Pulse/scale
            const pulse = 1 + 0.18 * Math.sin(t * PULSE_FREQ * 2 * Math.PI + emoji.i + layer);
            emoji.el.style.opacity = 0.5 + 0.5 * Math.max(0.2, Math.cos(angle - Math.PI / 2));
            emoji.el.style.zIndex = 10 + Math.round(10 * (y / (RADIUS[0] * 1.1)));
            emoji.el.style.filter = '';
            emoji.el.style.fontSize = `${2.7 * pulse + (layer ? 0.2 : 0)}rem`;
            // Glow at top
            if (Math.abs(angle - (-Math.PI / 2)) < 0.5) {
                emoji.el.classList.add('glow');
            } else {
                emoji.el.classList.remove('glow');
            }
            // Trail effect
            if (Math.abs(angle - (Math.PI / 2)) < 0.5) {
                emoji.el.classList.add('trail');
            } else {
                emoji.el.classList.remove('trail');
            }
            sparkle(emoji, t);
        }
        requestAnimationFrame(animateStarLoader);
    }
    requestAnimationFrame(animateStarLoader);

    // Fade out loader when city is ready or if DOM is already loaded
    const triggerFade = () => {
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => (loader.style.display = 'none'), 800);
        }, 2600);
    };

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', triggerFade);
    } else {
        triggerFade();
    }
})();

// Spanish/English localization
const translations = {
    en: {
        language: 'Language',
        toggle: '🇺🇸/🇪🇸',
        nav: ['Home', 'Services', 'About', 'Contact'],
        headerSubtitle: 'Powering the Future in 3D',
        welcomeTitle: 'Welcome to San Francisco',
        welcomeDesc: 'Explore my 3D city and discover how Hardy Digital Labs brings digital innovation to life',
        features: [
            { title: 'Interactive City', desc: 'Click and explore 3D buildings' },
            { title: 'Iconic Landmarks', desc: 'Golden Gate Bridge & Transamerica Pyramid' },
            { title: 'Full Control', desc: 'Orbit, zoom, and fly through the city' }
        ],
        controls: 'Drag to orbit • Scroll to zoom • Touch to explore',
        aboutTitle: 'About Hardy Digital Labs',
        aboutDesc: "I'm a passionate iOS and web developer based in San Francisco, specializing in creating apps and websites that combine Silicon Valley innovation with exceptional user experience.",
        aboutMissionTitle: '🚀 Our Mission',
        aboutMission: 'To create exceptional iOS apps and modern websites that deliver seamless user experiences. I transform ideas into polished digital products that users love and businesses rely on.',
        aboutVisionTitle: '💡 Our Vision',
        aboutVision: 'Building the future of mobile and web experiences through clean code, intuitive design, and cutting-edge technologies that make everyday tasks effortless.',
        aboutServicesTitle: '⚡ Core Services',
        aboutServices: 'iOS App Development, Modern Web Development, UI/UX Design, Custom Solutions',
        aboutCurrentProjectsTitle: '🚧 Current Projects',
        aboutCurrentProjects: "I'm currently building 12 exciting new apps and websites that showcase the latest in iOS and web development. These projects represent innovative solutions across various industries and demonstrate cutting-edge mobile and web technologies.",
        aboutAnnouncementTitle: '📢 Major Announcement Coming November 2025',
        aboutAnnouncement: 'Stay tuned for a major announcement in November 2025 that will reveal these groundbreaking projects and introduce new opportunities in the Hardy Digital Labs ecosystem.',
        aboutFeaturedAppTitle: '📱 Featured App',
        aboutFeaturedApp: 'Check out my latest iOS app: ',
        aboutFeaturedAppLink: 'SplitTip Pro',
        aboutFeaturedAppDesc: ' - Available now on the App Store',
        aboutStats: [
            { num: '10+', label: 'Apps/Websites Built' },
            { num: '12', label: 'In Development' },
            { num: 'iOS App Store', label: 'Publications' }
        ],
        servicesTitle: 'Our Services',
        services: [
            { title: '📱 iOS App Development', desc: 'Swift, SwiftUI, and native iOS experiences for iPhone and iPad' },
            { title: '💻 Modern Web Development', desc: 'React, Next.js, and responsive web applications' },
            { title: '🎨 UI/UX Design', desc: 'User-centered design that prioritizes functionality and aesthetics' },
            { title: '🔧 Custom Solutions', desc: 'Tailored mobile and web applications for unique business needs' }
        ],
        contactTitle: 'Get In Touch',
        contactItems: [
            { title: '📧 Email', desc: 'hello@hardydigitallabs.com' },
            { title: '📍 Location', desc: 'San Francisco, CA' },
            { title: '💼 LinkedIn', desc: 'Hardy Digital Labs' }
        ],
        contactCTA: 'Start Your Project',
        dayNightToggle: {
            day: '☀️ Day',
            night: '🌙 Night'
        },
        pyramidTooltip: {
            title: 'Transamerica Pyramid',
            desc: 'Click to learn about Hardy Digital Labs'
        },
        loadingText: 'Loading San Francisco',
        ariaLabels: {
            toggleLanguage: 'Toggle language',
            openNavigation: 'Open navigation',
            minimizePanel: 'Minimize panel',
            hideInstructions: 'Hide instructions'
        },
        projectForm: {
            title: 'Start Your Project',
            subtitle: 'Tell me about your app or website idea',
            sections: {
                projectDetails: '📋 Project Details',
                contactInfo: '👤 Contact Information',
                additionalDetails: '🎯 Additional Details'
            },
            fields: {
                projectType: 'Project Type *',
                projectTimeline: 'Project Timeline *',
                budgetRange: 'Budget Range *',
                projectDescription: 'Project Description *',
                name: 'Name *',
                email: 'Email *',
                company: 'Company',
                phone: 'Phone',
                hasBuiltBefore: 'Have you built an app/website before?',
                hasDesigns: 'Do you have existing designs?',
                preferredComm: 'Preferred communication method',
                additionalNotes: 'Additional notes'
            },
            options: {
                projectTypes: {
                    ios: 'iOS App Development',
                    website: 'Website Development',
                    uiux: 'UI/UX Design',
                    custom: 'Custom Solution'
                },
                timelines: {
                    placeholder: 'Select timeline',
                    short: '1-2 months',
                    medium: '3-4 months',
                    long: '5-6 months',
                    extended: '6+ months'
                },
                budgets: {
                    placeholder: 'Select budget range',
                    tier1: '$5k - $15k',
                    tier2: '$15k - $30k',
                    tier3: '$30k - $50k',
                    tier4: '$50k+'
                },
                yesNo: {
                    yes: 'Yes',
                    no: 'No'
                },
                communication: {
                    email: 'Email',
                    phone: 'Phone',
                    video: 'Video Call'
                }
            },
            placeholders: {
                projectDescription: 'Tell me about your app or website idea...',
                additionalNotes: 'Any additional information you\'d like to share...'
            },
            buttons: {
                submit: 'Send Project Inquiry',
                backToCity: 'Back to City View'
            },
            messages: {
                formNote: 'I\'ll get back to you within 24 hours',
                successTitle: 'Thank You!',
                successMessage: 'Your project inquiry has been sent successfully.',
                successFollowup: 'I\'ll get back to you within 24 hours to discuss your project.'
            }
        },
        validation: {
            required: 'This field is required',
            invalidEmail: 'Please enter a valid email address'
        },
        altText: {
            logo: 'Hardy Digital Labs Logo',
            watermarkLogo: 'SI Logo'
        },
        accessibility: {
            skipToMain: 'Skip to main content',
            panelActivated: 'panel activated',
            languageSwitched: 'Language switched to',
            dayNightToggled: 'Day/night mode toggled',
            modalOpened: 'Modal dialog opened',
            modalClosed: 'Modal dialog closed',
            formSubmitted: 'Form submitted successfully',
            keyboardShortcuts: 'Keyboard shortcuts available: Alt+1-4 for navigation, Alt+L for language, Alt+T for day/night'
        }
    },
    es: {
        language: 'Idioma',
        toggle: '🇪🇸/🇺🇸',
        nav: ['Inicio', 'Servicios', 'Acerca de', 'Contacto'],
        headerSubtitle: 'Impulsando el Futuro en 3D',
        welcomeTitle: 'Bienvenido a San Francisco',
        welcomeDesc: 'Explora mi ciudad 3D y descubre cómo Hardy Digital Labs da vida a la innovación digital',
        features: [
            { title: 'Ciudad Interactiva', desc: 'Haz clic y explora edificios 3D' },
            { title: 'Monumentos Icónicos', desc: 'Puente Golden Gate y Pirámide Transamerica' },
            { title: 'Control Total', desc: 'Orbita, acerca y vuela por la ciudad' }
        ],
        controls: 'Arrastra para orbitar • Desplaza para acercar • Toca para explorar',
        aboutTitle: 'Acerca de Hardy Digital Labs',
        aboutDesc: 'Soy un apasionado desarrollador de iOS y web con sede en San Francisco, especializado en crear apps y sitios web que combinan la innovación de Silicon Valley con una experiencia de usuario excepcional.',
        aboutMissionTitle: '🚀 Nuestra Misión',
        aboutMission: 'Crear aplicaciones iOS excepcionales y sitios web modernos que ofrezcan experiencias de usuario perfectas. Transformo ideas en productos digitales pulidos que los usuarios aman y en los que las empresas confían.',
        aboutVisionTitle: '💡 Nuestra Visión',
        aboutVision: 'Construir el futuro de las experiencias móviles y web a través de código limpio, diseño intuitivo y tecnologías de vanguardia que hacen que las tareas diarias sean sencillas.',
        aboutServicesTitle: '⚡ Servicios Principales',
        aboutServices: 'Desarrollo de Apps iOS, Desarrollo Web Moderno, Diseño UI/UX, Soluciones Personalizadas',
        aboutCurrentProjectsTitle: '🚧 Proyectos Actuales',
        aboutCurrentProjects: 'Actualmente estoy desarrollando 12 nuevas apps y sitios web que muestran lo último en desarrollo iOS y web. Estos proyectos representan soluciones innovadoras en diversas industrias.',
        aboutAnnouncementTitle: '📢 Gran Anuncio en Noviembre 2025',
        aboutAnnouncement: 'Pronto habrá un gran anuncio en noviembre de 2025 que revelará estos proyectos innovadores y presentará nuevas oportunidades.',
        aboutFeaturedAppTitle: '📱 App Destacada',
        aboutFeaturedApp: 'Descubre mi última app de iOS: ',
        aboutFeaturedAppLink: 'SplitTip Pro',
        aboutFeaturedAppDesc: ' - Ya disponible en el App Store',
        aboutStats: [
            { num: '10+', label: 'Apps/Sitios Web Creados' },
            { num: '12', label: 'En Desarrollo' },
            { num: 'iOS App Store', label: 'Publicaciones' }
        ],
        servicesTitle: 'Servicios',
        services: [
            { title: '📱 Desarrollo de Apps iOS', desc: 'Swift, SwiftUI y experiencias nativas para iPhone y iPad' },
            { title: '💻 Desarrollo Web Moderno', desc: 'React, Next.js y aplicaciones web responsivas' },
            { title: '🎨 Diseño UI/UX', desc: 'Diseño centrado en el usuario que prioriza funcionalidad y estética' },
            { title: '🔧 Soluciones Personalizadas', desc: 'Aplicaciones móviles y web a medida para necesidades únicas de negocio' }
        ],
        contactTitle: 'Ponte en Contacto',
        contactItems: [
            { title: '📧 Email', desc: 'hello@hardydigitallabs.com' },
            { title: '📍 Ubicación', desc: 'San Francisco, CA' },
            { title: '💼 LinkedIn', desc: 'Hardy Digital Labs' }
        ],
        contactCTA: 'Iniciar Tu Proyecto',
        dayNightToggle: {
            day: '☀️ Día',
            night: '🌙 Noche'
        },
        pyramidTooltip: {
            title: 'Pirámide Transamerica',
            desc: 'Haz clic para conocer Hardy Digital Labs'
        },
        loadingText: 'Cargando San Francisco',
        ariaLabels: {
            toggleLanguage: 'Cambiar idioma',
            openNavigation: 'Abrir navegación',
            minimizePanel: 'Minimizar panel',
            hideInstructions: 'Ocultar instrucciones'
        },
        projectForm: {
            title: 'Iniciar Tu Proyecto',
            subtitle: 'Cuéntame sobre tu idea de app o sitio web',
            sections: {
                projectDetails: '📋 Detalles del Proyecto',
                contactInfo: '👤 Información de Contacto',
                additionalDetails: '🎯 Detalles Adicionales'
            },
            fields: {
                projectType: 'Tipo de Proyecto *',
                projectTimeline: 'Cronograma del Proyecto *',
                budgetRange: 'Rango de Presupuesto *',
                projectDescription: 'Descripción del Proyecto *',
                name: 'Nombre *',
                email: 'Email *',
                company: 'Empresa',
                phone: 'Teléfono',
                hasBuiltBefore: '¿Has creado una app/sitio web antes?',
                hasDesigns: '¿Tienes diseños existentes?',
                preferredComm: 'Método de comunicación preferido',
                additionalNotes: 'Notas adicionales'
            },
            options: {
                projectTypes: {
                    ios: 'Desarrollo de Apps iOS',
                    website: 'Desarrollo de Sitio Web',
                    uiux: 'Diseño UI/UX',
                    custom: 'Solución Personalizada'
                },
                timelines: {
                    placeholder: 'Seleccionar cronograma',
                    short: '1-2 meses',
                    medium: '3-4 meses',
                    long: '5-6 meses',
                    extended: '6+ meses'
                },
                budgets: {
                    placeholder: 'Seleccionar rango de presupuesto',
                    tier1: '$5k - $15k',
                    tier2: '$15k - $30k',
                    tier3: '$30k - $50k',
                    tier4: '$50k+'
                },
                yesNo: {
                    yes: 'Sí',
                    no: 'No'
                },
                communication: {
                    email: 'Email',
                    phone: 'Teléfono',
                    video: 'Videollamada'
                }
            },
            placeholders: {
                projectDescription: 'Cuéntame sobre tu idea de app o sitio web...',
                additionalNotes: 'Cualquier información adicional que quieras compartir...'
            },
            buttons: {
                submit: 'Enviar Consulta del Proyecto',
                backToCity: 'Volver a la Vista de la Ciudad'
            },
            messages: {
                formNote: 'Te responderé dentro de 24 horas',
                successTitle: '¡Gracias!',
                successMessage: 'Tu consulta del proyecto ha sido enviada exitosamente.',
                successFollowup: 'Te responderé dentro de 24 horas para discutir tu proyecto.'
            }
        },
        validation: {
            required: 'Este campo es obligatorio',
            invalidEmail: 'Por favor ingresa una dirección de email válida'
        },
        altText: {
            logo: 'Logo de Hardy Digital Labs',
            watermarkLogo: 'Logo SI'
        },
        accessibility: {
            skipToMain: 'Saltar al contenido principal',
            panelActivated: 'panel activado',
            languageSwitched: 'Idioma cambiado a',
            dayNightToggled: 'Modo día/noche alternado',
            modalOpened: 'Diálogo modal abierto',
            modalClosed: 'Diálogo modal cerrado',
            formSubmitted: 'Formulario enviado exitosamente',
            keyboardShortcuts: 'Atajos de teclado disponibles: Alt+1-4 para navegación, Alt+L para idioma, Alt+T para día/noche'
        }
    }
};

function setLanguage(lang) {
    localStorage.setItem('language', lang);
    const t = translations[lang];
    // Nav
    document.querySelectorAll('.nav-btn').forEach((btn, i) => btn.textContent = t.nav[i]);
    document.querySelectorAll('.mobile-nav-btn').forEach((btn, i) => btn.textContent = t.nav[i]);
    // Header subtitle
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) subtitle.textContent = t.headerSubtitle;
    // Welcome panel
    const welcomeTitle = document.querySelector('#home-panel h2');
    if (welcomeTitle) welcomeTitle.textContent = t.welcomeTitle;
    const welcomeDesc = document.querySelector('#home-panel .panel-content p');
    if (welcomeDesc) welcomeDesc.textContent = t.welcomeDesc;
    // Features
    document.querySelectorAll('#home-panel .feature h3').forEach((el, i) => el.textContent = t.features[i].title);
    document.querySelectorAll('#home-panel .feature p').forEach((el, i) => el.textContent = t.features[i].desc);
    // Controls info
    const controlsBar = document.querySelector('#controls-info-bar p');
    if (controlsBar) controlsBar.childNodes[0].textContent = t.controls + ' ';
    // Language labels and toggles (both mobile and desktop)
    const langLabel = document.getElementById('language-label');
    if (langLabel) langLabel.textContent = t.language;
    const langToggle = document.getElementById('language-toggle');
    if (langToggle) langToggle.textContent = t.toggle;
    const langLabelDesktop = document.getElementById('language-label-desktop');
    if (langLabelDesktop) langLabelDesktop.textContent = t.language;
    const langToggleDesktop = document.getElementById('language-toggle-desktop');
    if (langToggleDesktop) langToggleDesktop.textContent = t.toggle;
    // Services panel
    const servicesPanel = document.getElementById('services-panel');
    if (servicesPanel) {
        const h2 = servicesPanel.querySelector('h2');
        if (h2) h2.textContent = t.servicesTitle;
        const cards = servicesPanel.querySelectorAll('.service-card');
        t.services.forEach((svc, i) => {
            if (cards[i]) {
                const h3 = cards[i].querySelector('h3');
                const p = cards[i].querySelector('p');
                if (h3) h3.textContent = svc.title;
                if (p) p.textContent = svc.desc;
            }
        });
    }
    // About panel
    const aboutPanel = document.getElementById('about-panel');
    if (aboutPanel) {
        const h2 = aboutPanel.querySelector('h2');
        if (h2) h2.textContent = t.aboutTitle;
        const pDesc = aboutPanel.querySelector('p');
        if (pDesc) pDesc.textContent = t.aboutDesc;
        const aboutSections = aboutPanel.querySelectorAll('.about-section');
        if (aboutSections[0]) {
            aboutSections[0].querySelector('h3').textContent = t.aboutCurrentProjectsTitle;
            aboutSections[0].querySelector('p').textContent = t.aboutCurrentProjects;
        }
        if (aboutSections[1]) {
            aboutSections[1].querySelector('h3').textContent = t.aboutAnnouncementTitle;
            aboutSections[1].querySelector('p').textContent = t.aboutAnnouncement;
        }
        if (aboutSections[2]) {
            aboutSections[2].querySelector('h3').textContent = t.aboutFeaturedAppTitle;
            const p = aboutSections[2].querySelector('p');
            if (p) {
                p.innerHTML = `${t.aboutFeaturedApp}<a href=\"https://apps.apple.com/us/app/splittip-pro/id6746974894\" class=\"appstore-link\" target=\"_blank\" rel=\"noopener noreferrer\">${t.aboutFeaturedAppLink}</a>${t.aboutFeaturedAppDesc}`;
            }
        }
        // Stats
        const stats = aboutPanel.querySelectorAll('.stat');
        t.aboutStats.forEach((stat, i) => {
            if (stats[i]) {
                const h3 = stats[i].querySelector('h3');
                const p = stats[i].querySelector('p');
                if (h3) h3.textContent = stat.num;
                if (p) p.textContent = stat.label;
            }
        });
    }
    // Contact panel
    const contactPanel = document.getElementById('contact-panel');
    if (contactPanel) {
        const h2 = contactPanel.querySelector('h2');
        if (h2) h2.textContent = t.contactTitle;
        const contactItems = contactPanel.querySelectorAll('.contact-item');
        t.contactItems.forEach((item, i) => {
            if (contactItems[i]) {
                const h3 = contactItems[i].querySelector('h3');
                const p = contactItems[i].querySelector('p');
                if (h3) h3.textContent = item.title;
                if (p) p.textContent = item.desc;
            }
        });
        const ctaButton = contactPanel.querySelector('.cta-button');
        if (ctaButton) {
            ctaButton.textContent = t.contactCTA;
            if (!ctaButton.dataset.listenerAdded) {
                ctaButton.addEventListener('click', () => {
                    const sf3d = window.globalSF3D || globalSF3D;
                    if (sf3d && typeof sf3d.showProjectForm === 'function') {
                        sf3d.showProjectForm();
                    }
                });
                ctaButton.dataset.listenerAdded = 'true';
            }
        }
    }
    // Day/Night toggle
    const toggleTime = document.getElementById('toggle-time');
    if (toggleTime) {
        const isDay = toggleTime.textContent.includes('☀️') || toggleTime.textContent.includes('Day') || toggleTime.textContent.includes('Día');
        toggleTime.textContent = isDay ? t.dayNightToggle.day : t.dayNightToggle.night;
    }
    // Pyramid tooltip
    const pyramidTooltip = document.getElementById('pyramid-tooltip');
    if (pyramidTooltip) {
        const h4 = pyramidTooltip.querySelector('h4');
        const p = pyramidTooltip.querySelector('p');
        if (h4) h4.textContent = t.pyramidTooltip.title;
        if (p) p.textContent = t.pyramidTooltip.desc;
    }
    // Loading text
    const loadingText = document.getElementById('loading-text');
    if (loadingText) loadingText.textContent = t.loadingText;
    // Aria labels
    const langToggleDesktopBtn = document.getElementById('language-toggle-desktop');
    if (langToggleDesktopBtn) langToggleDesktopBtn.setAttribute('aria-label', t.ariaLabels.toggleLanguage);
    const langToggleBtn = document.getElementById('language-toggle');
    if (langToggleBtn) langToggleBtn.setAttribute('aria-label', t.ariaLabels.toggleLanguage);
    const hamburgerMenu = document.getElementById('hamburger-menu');
    if (hamburgerMenu) hamburgerMenu.setAttribute('aria-label', t.ariaLabels.openNavigation);
    const minimizePanel = document.getElementById('minimize-panel');
    if (minimizePanel) minimizePanel.setAttribute('aria-label', t.ariaLabels.minimizePanel);
    const closeInstructions = document.getElementById('close-instructions');
    if (closeInstructions) closeInstructions.setAttribute('aria-label', t.ariaLabels.hideInstructions);
    // Alt text for images
    const companyLogo = document.getElementById('company-logo');
    if (companyLogo) companyLogo.setAttribute('alt', t.altText.logo);
    const watermarkLogo = document.getElementById('watermark-logo');
    if (watermarkLogo) watermarkLogo.setAttribute('alt', t.altText.watermarkLogo);
    // Update skip link
    const skipLink = document.querySelector('.skip-link');
    if (skipLink) skipLink.textContent = t.accessibility.skipToMain;
    // Update project form if it exists
    const projectFormModal = document.getElementById('project-form-modal');
    if (projectFormModal) {
        // Remove existing modal and recreate with new language
        projectFormModal.remove();
        // The form will be recreated with new language when needed
    }
}

function toggleLanguage() {
    const current = localStorage.getItem('language') || 'en';
    const next = current === 'en' ? 'es' : 'en';
    setLanguage(next);
}

function initializeLocalizationAndUtilities() {
    // Set language from localStorage or default
    const lang = localStorage.getItem('language') || 'en';
    setLanguage(lang);
    // Ensure Contact CTA opens project form if app already initialized
    const contactCTA = document.querySelector('#contact-panel .cta-button');
    if (contactCTA && !contactCTA.dataset.listenerAdded) {
        contactCTA.addEventListener('click', () => {
            const sf3d = window.globalSF3D || globalSF3D;
            if (sf3d && typeof sf3d.showProjectForm === 'function') {
                sf3d.showProjectForm();
            }
        });
        contactCTA.dataset.listenerAdded = 'true';
    }
    // Add toggle event for both mobile and desktop
    const langToggle = document.getElementById('language-toggle');
    if (langToggle && !langToggle.dataset.listenerAdded) {
        langToggle.addEventListener('click', toggleLanguage);
        langToggle.dataset.listenerAdded = 'true';
    }
    const langToggleDesktop = document.getElementById('language-toggle-desktop');
    if (langToggleDesktop && !langToggleDesktop.dataset.listenerAdded) {
        langToggleDesktop.addEventListener('click', toggleLanguage);
        langToggleDesktop.dataset.listenerAdded = 'true';
    }
    // Fallback: ensure day/night toggle always calls into the 3D instance
    const timeToggleBtn = document.getElementById('toggle-time');
    if (timeToggleBtn && !timeToggleBtn.dataset.dayNightBound) {
        timeToggleBtn.addEventListener('click', () => {
            if (typeof globalSF3D !== 'undefined' && globalSF3D && typeof globalSF3D.toggleDayNight === 'function') {
                globalSF3D.toggleDayNight();
            }
        });
        timeToggleBtn.dataset.dayNightBound = 'true';
    }

    // Initialize accessibility features
    initializeAccessibility();
    // Initialize performance monitoring for testing
    initializePerformanceMonitoring();
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initializeLocalizationAndUtilities);
} else {
    initializeLocalizationAndUtilities();
}

// Performance monitoring initialization
function initializePerformanceMonitoring() {
    try {
        console.log('Performance monitoring initialized');

        // Monitor resource loading
        window.addEventListener('load', () => {
            try {
                if (performance && performance.getEntriesByType) {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    const resources = performance.getEntriesByType('resource');

                    if (navigation) {
                        console.log('Performance Metrics:');
                        if (navigation.domContentLoadedEventEnd && navigation.domContentLoadedEventStart) {
                            console.log('- DOM Content Loaded:', Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart), 'ms');
                        }
                        if (navigation.loadEventEnd && navigation.loadEventStart) {
                            console.log('- Load Complete:', Math.round(navigation.loadEventEnd - navigation.loadEventStart), 'ms');
                        }
                    }

                    if (resources && resources.length > 0) {
                        console.log('- Resources Loaded:', resources.length);

                        // Log largest resource safely
                        const resourcesWithSize = resources.filter(r => r.transferSize > 0);
                        if (resourcesWithSize.length > 0) {
                            const largestResource = resourcesWithSize.reduce((prev, current) =>
                                (prev.transferSize > current.transferSize) ? prev : current
                            );
                            console.log('- Largest Resource:', largestResource.name, Math.round(largestResource.transferSize), 'bytes');
                        }
                    }
                }
            } catch (e) {
                console.log('Performance metrics collection failed:', e.message);
            }
        });

        // Monitor memory usage (Chrome only) - disabled for now to prevent issues
        if (false && performance && performance.memory) {
            const memoryMonitor = setInterval(() => {
                try {
                    const memory = performance.memory;
                    if (memory && memory.usedJSHeapSize) {
                        console.log('Memory Usage:', {
                            used: Math.round(memory.usedJSHeapSize / 1048576) + 'MB',
                            total: Math.round(memory.totalJSHeapSize / 1048576) + 'MB',
                            limit: Math.round(memory.jsHeapSizeLimit / 1048576) + 'MB'
                        });
                    }
                } catch (e) {
                    console.log('Memory monitoring failed:', e.message);
                    clearInterval(memoryMonitor);
                }
            }, 10000); // Every 10 seconds
        }
    } catch (e) {
        console.log('Performance monitoring initialization failed:', e.message);
    }
}

// Accessibility initialization
function initializeAccessibility() {
    // Add keyboard navigation for tab panels
    setupTabPanelNavigation();
    // Add focus management for modals
    setupModalFocusManagement();
    // Add ARIA live regions for dynamic content
    setupAriaLiveRegions();
    // Add keyboard event listeners
    setupKeyboardNavigation();
}

// Tab panel navigation with arrow keys
function setupTabPanelNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn, .mobile-nav-btn');
    const panels = document.querySelectorAll('[role="tabpanel"]');

    navButtons.forEach((button, index) => {
        button.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const nextIndex = e.key === 'ArrowRight' ?
                    (index + 1) % navButtons.length :
                    (index - 1 + navButtons.length) % navButtons.length;
                navButtons[nextIndex].focus();
                navButtons[nextIndex].click();
            }
        });
    });
}

// Modal focus management
function setupModalFocusManagement() {
    let previouslyFocusedElement = null;

    // Store focus when modal opens
    window.addEventListener('modal-open', (e) => {
        previouslyFocusedElement = document.activeElement;
        trapFocus(e.detail.modal);
    });

    // Restore focus when modal closes
    window.addEventListener('modal-close', () => {
        if (previouslyFocusedElement) {
            previouslyFocusedElement.focus();
            previouslyFocusedElement = null;
        }
    });
}

// Focus trap for modals
function trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus first element
    if (firstFocusable) firstFocusable.focus();

    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            const closeButton = modal.querySelector('.close-project-form, .close-about');
            if (closeButton) closeButton.click();
        }
    });
}

// ARIA live regions for dynamic content
function setupAriaLiveRegions() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
}

// Announce messages to screen readers
function announceToScreenReader(message) {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

// Comprehensive keyboard navigation
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Global keyboard shortcuts
        switch (e.key) {
            case '1':
                if (e.altKey) {
                    e.preventDefault();
                    document.getElementById('nav-home').click();
                    const lang = localStorage.getItem('language') || 'en';
                    const t = translations[lang];
                    const panelTitle = document.querySelector('#home-panel h2').textContent;
                    announceToScreenReader(`${panelTitle} ${t.accessibility.panelActivated}`);
                }
                break;
            case '2':
                if (e.altKey) {
                    e.preventDefault();
                    document.getElementById('nav-services').click();
                    const lang = localStorage.getItem('language') || 'en';
                    const t = translations[lang];
                    const panelTitle = document.querySelector('#services-panel h2').textContent;
                    announceToScreenReader(`${panelTitle} ${t.accessibility.panelActivated}`);
                }
                break;
            case '3':
                if (e.altKey) {
                    e.preventDefault();
                    document.getElementById('nav-about').click();
                    const lang = localStorage.getItem('language') || 'en';
                    const t = translations[lang];
                    const panelTitle = document.querySelector('#about-panel h2').textContent;
                    announceToScreenReader(`${panelTitle} ${t.accessibility.panelActivated}`);
                }
                break;
            case '4':
                if (e.altKey) {
                    e.preventDefault();
                    document.getElementById('nav-contact').click();
                    const lang = localStorage.getItem('language') || 'en';
                    const t = translations[lang];
                    const panelTitle = document.querySelector('#contact-panel h2').textContent;
                    announceToScreenReader(`${panelTitle} ${t.accessibility.panelActivated}`);
                }
                break;
            case 'l':
                if (e.altKey) {
                    e.preventDefault();
                    const langToggle = document.getElementById('language-toggle-desktop') ||
                        document.getElementById('language-toggle');
                    if (langToggle) {
                        langToggle.click();
                        const currentLang = localStorage.getItem('language') || 'en';
                        const t = translations[currentLang];
                        const newLang = currentLang === 'en' ? 'Spanish' : 'English';
                        announceToScreenReader(`${t.accessibility.languageSwitched} ${newLang}`);
                    }
                }
                break;
            case 't':
                if (e.altKey) {
                    e.preventDefault();
                    const timeToggle = document.getElementById('toggle-time');
                    if (timeToggle) {
                        timeToggle.click();
                        const lang = localStorage.getItem('language') || 'en';
                        const t = translations[lang];
                        announceToScreenReader(t.accessibility.dayNightToggled);
                    }
                }
                break;
            case 'h':
                if (e.altKey) {
                    e.preventDefault();
                    const lang = localStorage.getItem('language') || 'en';
                    const t = translations[lang];
                    announceToScreenReader(t.accessibility.keyboardShortcuts);
                }
                break;
        }
    });

    // Add Enter and Space key support for custom buttons
    document.addEventListener('keydown', (e) => {
        if (e.target.matches('[role="button"]') && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            e.target.click();
        }
    });
}

// Update panel visibility and ARIA attributes
function updatePanelVisibility(activePanel) {
    const panels = document.querySelectorAll('[role="tabpanel"]');
    const navButtons = document.querySelectorAll('.nav-btn, .mobile-nav-btn');

    panels.forEach((panel) => {
        const isActive = panel === activePanel;
        panel.setAttribute('aria-hidden', !isActive);
        panel.tabIndex = isActive ? 0 : -1;
    });

    navButtons.forEach((button) => {
        const isPressed = button.dataset.section === activePanel.id.replace('-panel', '');
        button.setAttribute('aria-pressed', isPressed);
    });
}

// Star field for night mode
function createStarField() {
    let starField = document.getElementById('star-field');
    if (starField) return; // Already exists
    starField = document.createElement('div');
    starField.id = 'star-field';
    starField.style.position = 'fixed';
    starField.style.top = 0;
    starField.style.left = 0;
    starField.style.width = '100vw';
    starField.style.height = '100vh';
    starField.style.pointerEvents = 'none';
    starField.style.zIndex = 2;
    document.body.appendChild(starField);
    // Generate stars
    const numStars = 120;
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'night-star';
        const size = Math.random() * 1.8 + 1.2;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.borderRadius = '50%';
        star.style.background = 'white';
        star.style.opacity = Math.random() * 0.7 + 0.3;
        star.style.position = 'absolute';
        star.style.left = `${Math.random() * 100}vw`;
        star.style.top = `${Math.random() * 100}vh`;
        star.style.boxShadow = `0 0 ${Math.random() * 8 + 2}px #fff8`;
        star.style.animation = `star-twinkle ${2 + Math.random() * 2}s infinite ease-in-out`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        starField.appendChild(star);
    }
}
function removeStarField() {
    const starField = document.getElementById('star-field');
    if (starField) starField.remove();
}
// Patch toggleDayNight to add/remove stars
const origToggleDayNight = SanFrancisco3D.prototype.toggleDayNight;
SanFrancisco3D.prototype.toggleDayNight = function () {
    origToggleDayNight.call(this);
    if (this.isNight) {
        createStarField();
    } else {
        removeStarField();
    }
};
// Also add stars if night mode is default on load
window.addEventListener('DOMContentLoaded', () => {
    const sf3d = globalSF3D;
    if (sf3d && sf3d.isNight) createStarField();
});

// ===== MOBILE OPTIMIZATIONS =====

// Mobile 3D Performance Optimizations
class MobileOptimizer {
    constructor(threeInstance) {
        this.threeInstance = threeInstance;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.applyOptimizations();
    }
    
    applyOptimizations() {
        if (this.isMobile) {
            console.log('Applying mobile optimizations...');
            
            // Reduce 3D quality for mobile
            if (this.threeInstance.renderer) {
                this.threeInstance.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
                this.threeInstance.renderer.shadowMap.enabled = false;
                this.threeInstance.renderer.antialias = false;
                console.log('Reduced 3D quality for mobile');
            }
            
            // Reduce geometry complexity
            this.reduceGeometryComplexity();
            
            // Optimize lighting
            this.optimizeLighting();
            
            // Add touch controls
            this.setupTouchControls();
        }
    }
    
    reduceGeometryComplexity() {
        // Reduce building detail on mobile
        if (this.threeInstance.buildings) {
            this.threeInstance.buildings.forEach(building => {
                if (building.geometry) {
                    building.geometry.computeBoundingBox();
                }
            });
        }
    }
    
    optimizeLighting() {
        if (this.threeInstance.scene) {
            // Reduce light count on mobile
            const lights = this.threeInstance.scene.children.filter(child => child.isLight);
            if (lights.length > 3) {
                lights.slice(3).forEach(light => {
                    this.threeInstance.scene.remove(light);
                });
                console.log('Reduced light count for mobile');
            }
        }
    }
    
    setupTouchControls() {
        // Enhanced touch controls for mobile
        let isDragging = false;
        let lastTouchX = 0;
        let lastTouchY = 0;
        
        const canvas = document.getElementById('three-canvas');
        
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isDragging = true;
            const touch = e.touches[0];
            lastTouchX = touch.clientX;
            lastTouchY = touch.clientY;
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            const deltaX = touch.clientX - lastTouchX;
            const deltaY = touch.clientY - lastTouchY;
            
            // Rotate camera based on touch movement
            if (this.threeInstance.controls) {
                this.threeInstance.controls.rotateLeft(-deltaX * 0.01);
                this.threeInstance.controls.rotateUp(deltaY * 0.01);
            }
            
            lastTouchX = touch.clientX;
            lastTouchY = touch.clientY;
        }, { passive: false });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            isDragging = false;
        }, { passive: false });
        
        console.log('Touch controls enabled for mobile');
    }
}

// Enhanced Mobile Navigation
function setupMobileNavigation() {
    const hamburger = document.getElementById('hamburger-menu');
    const navDrawer = document.getElementById('mobile-nav-drawer');
    const navOverlay = document.getElementById('nav-overlay');
    const navButtons = document.querySelectorAll('.mobile-nav-btn');
    
    if (!hamburger || !navDrawer) {
        console.log('Mobile navigation elements not found');
        return;
    }
    
    function openMenu() {
        navDrawer.classList.add('open');
        if (navOverlay) navOverlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Animate hamburger to X
        hamburger.classList.add('active');
    }
    
    function closeMenu() {
        navDrawer.classList.remove('open');
        if (navOverlay) navOverlay.classList.remove('show');
        document.body.style.overflow = '';
        
        // Animate hamburger back
        hamburger.classList.remove('active');
    }
    
    // Event listeners
    hamburger.addEventListener('click', openMenu);
    if (navOverlay) navOverlay.addEventListener('click', closeMenu);
    
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.dataset.section;
            closeMenu();
            
            // Switch to the selected section
            if (typeof switchSection === 'function') {
                switchSection(section);
            }
        });
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navDrawer.classList.contains('open')) {
            closeMenu();
        }
    });
    
    console.log('Mobile navigation setup complete');
}

// Panel Minimization for Mobile
function setupPanelMinimization() {
    const minimizeBtn = document.getElementById('minimize-panel');
    
    if (!minimizeBtn) {
        console.log('Minimize button not found');
        return;
    }
    
    minimizeBtn.addEventListener('click', () => {
        const activePanel = document.querySelector('.panel.active');
        if (activePanel) {
            activePanel.classList.toggle('minimized');
            
            const isMinimized = activePanel.classList.contains('minimized');
            minimizeBtn.innerHTML = isMinimized ? '&#x25BC;' : '&#x25B2;';
            minimizeBtn.setAttribute('aria-expanded', !isMinimized);
        }
    });
    
    console.log('Panel minimization setup complete');
}

// Initialize mobile optimizations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for 3D scene to be ready
    setTimeout(() => {
        if (globalSF3D) {
            new MobileOptimizer(globalSF3D);
        }
    }, 1000);
    
    setupMobileNavigation();
    setupPanelMinimization();
    
    console.log('Mobile optimizations initialized');
});