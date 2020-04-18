// Registration of service worker from https://developers.google.com/web/fundamentals/primers/service-workers/registration

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', {scope: './'}).then(function (registration) {
        console.log('Service worker registration succeeded:', registration);
    }).catch(function (error) {
        console.log('Service worker registration failed:', error);
    });
} else {
    console.log('Service workers are not supported.');
}

