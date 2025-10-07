// Service Worker for Hardy Digital Labs
// Provides offline caching and performance optimizations

const CACHE_NAME = 'hardy-digital-labs-v2';
const STATIC_ASSETS = [
    './index.html',
    './styles.css', 
    './main.js',
    './logo.svg'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(err => {
                console.log('Service Worker: Cache failed', err);
                // Skip to activate even if caching fails
                self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip external requests that aren't in our cache list
    if (!event.request.url.startsWith(self.location.origin) && 
        !STATIC_ASSETS.some(asset => event.request.url.includes(asset))) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return response;
                }
                
                // Otherwise fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Cache successful responses
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return response;
                    })
                    .catch(() => {
                        // Return offline fallback for HTML requests
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Background sync for form submissions (if supported)
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Handle offline form submissions
            console.log('Service Worker: Background sync triggered')
        );
    }
});

// Push notifications (placeholder for future use)
self.addEventListener('push', event => {
    if (event.data) {
        console.log('Service Worker: Push notification received', event.data.text());
    }
});