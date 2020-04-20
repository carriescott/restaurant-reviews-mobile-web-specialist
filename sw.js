self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('restaurant-reviews-v1')
            .then(function(cache) {
                return cache.addAll([
                '/',
                'css/responsive1600.css',
                'css/responsive1440.css',
                'css/responsive1280.css',
                'css/responsive1024.css',
                'css/responsive960.css',
                'css/responsive840.css',
                'css/responsive720.css',
                'css/responsive600.css',
                'css/responsive480.css',
                'css/responsive479.css',
                'css/responsive0.css',
                'css/stylesMain.css',
                'js/dbhelper.js',
                'js/main.js',
                'js/restaurant_info.js',
                'js/idb.js',
                'index.html',
                'restaurant.html',
                'img/1.jpg',
                'img/2.jpg',
                'img/3.jpg',
                'img/4.jpg',
                'img/5.jpg',
                'img/6.jpg',
                'img/7.jpg',
                'img/8.jpg',
                'img/9.jpg',
                'img/10.jpg',
                'img/default.jpg',
                'img/responsive/360w/1.jpg',
                'img/responsive/360w/2.jpg',
                'img/responsive/360w/3.jpg',
                'img/responsive/360w/4.jpg',
                'img/responsive/360w/5.jpg',
                'img/responsive/360w/6.jpg',
                'img/responsive/360w/7.jpg',
                'img/responsive/360w/8.jpg',
                'img/responsive/360w/9.jpg',
                'img/responsive/360w/10.jpg',
                'img/responsive/360w/default.jpg',
                'img/responsive/480w/1.jpg',
                'img/responsive/480w/2.jpg',
                'img/responsive/480w/3.jpg',
                'img/responsive/480w/4.jpg',
                'img/responsive/480w/5.jpg',
                'img/responsive/480w/6.jpg',
                'img/responsive/480w/7.jpg',
                'img/responsive/480w/8.jpg',
                'img/responsive/480w/9.jpg',
                'img/responsive/480w/10.jpg',
                'img/responsive/480w/default.jpg',
                'img/responsive/800w/1.jpg',
                'img/responsive/800w/2.jpg',
                'img/responsive/800w/3.jpg',
                'img/responsive/800w/4.jpg',
                'img/responsive/800w/5.jpg',
                'img/responsive/800w/6.jpg',
                'img/responsive/800w/7.jpg',
                'img/responsive/800w/8.jpg',
                'img/responsive/800w/9.jpg',
                'img/responsive/800w/10.jpg',
                'img/responsive/800w/default.jpg',
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                }

                var fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function(response) {
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        var responseToCache = response.clone();

                        caches.open('restaurant-reviews-v1')
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});
