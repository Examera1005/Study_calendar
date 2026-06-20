// ponytail: minimal service worker to satisfy PWA installability requirements
self.addEventListener("install", () => {
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
	// Native fallback: browser fetches resources directly
});
