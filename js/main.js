let restaurants, neighborhoods, cuisines;
var map;
var markers = [];


window.addEventListener("load", () => {
    if (navigator.onLine) {
        document.getElementById("offline-notification-main").classList.add("hide");
    } else {
        document.getElementById("offline-notification-main").classList.remove("hide");
    }
    function handleNetworkChange(event) {
        if (navigator.onLine) {
            document.getElementById("offline-notification-main").classList.add("hide");
        } else {
            document.getElementById("offline-notification-main").classList.remove("hide");
        }
    }
    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);
});



/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) =>{
    fetchNeighborhoods();
    fetchCuisines();
    });
/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () =>
{
    DBHelper.fetchNeighborhoods((error, neighborhoods) => {
        if (error) { // Got an error
            console.error(error);
        } else {
            self.neighborhoods = neighborhoods;
    fillNeighborhoodsHTML();
}
})
    ;
}
;
/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) =>
{
    const select = document.getElementById('neighborhoods-select');
    neighborhoods.forEach(neighborhood => {
        const option = document.createElement('option');
        option.innerHTML = neighborhood;
        option.value = neighborhood;
        select.append(option);
});
}
/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () =>
{
    DBHelper.fetchCuisines((error, cuisines) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            self.cuisines = cuisines;
    fillCuisinesHTML();
}
})
    ;
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) =>
{
    const select = document.getElementById('cuisines-select');
    cuisines.forEach(cuisine => {
        const option = document.createElement('option');
        option.innerHTML = cuisine;
        option.value = cuisine;
        select.append(option);
});
}
/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () =>
{
    let loc = {
        lat: 40.722216,
        lng: -73.987501
    };
    self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: loc,
        scrollwheel: false,
    });
    updateRestaurants();

}
/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () =>
{
    const cSelect = document.getElementById('cuisines-select');
    const nSelect = document.getElementById('neighborhoods-select');

    const cIndex = cSelect.selectedIndex;
    const nIndex = nSelect.selectedIndex;

    const cuisine = cSelect[cIndex].value;
    const neighborhood = nSelect[nIndex].value;

    DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
        if (error) { // Got an error!
            console.error(error);
        } else {
            resetRestaurants(restaurants);
    fillRestaurantsHTML();
}
})
}
/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) =>
{
    // Remove all restaurants
    self.restaurants = [];
    const ul = document.getElementById('restaurants-list');
    ul.innerHTML = '';
    // Remove all map markers
    self.markers.forEach(m => m.setMap(null)
)
    ;
    self.markers = [];
    self.restaurants = restaurants;
}
/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) =>
{
    const ul = document.getElementById('restaurants-list');
    restaurants.forEach(restaurant => {
        ul.append(createRestaurantHTML(restaurant));
})
    ;
    addMarkersToMap();
    //Get count of restaurants returned in the list
    const resultsCount = document.getElementById("restaurants-list").getElementsByClassName('list-item').length;
    const resultHeader = document.getElementById("results-count");
    const resString = setResultString(resultsCount);
    resultHeader.innerHTML = resString;
}
/**
 * Create results count.
 */
function setResultString(res) {
    let resString;
    if (res) {
        resString = res + ' Results';
    } else {
        resString = ' No Results';
    }
    return resString;
}
/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) =>
{
    const li = document.createElement('li');
    li.className = 'list-item';
    li.setAttribute("role", "option");

    const image = document.createElement('img');
    image.title = restaurant.name;
    image.alt = 'Image of ' + restaurant.name + ' restaurant';
    image.className = 'restaurant-img';
    image.sizes = "22vw";

    const config = {
        root: null,
        threshold: 0.01,
        rootMargin: '50px 0px'
    };

    let observer;

    if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver(onChanges, config);
        observer.observe(image);
    } else {
        console.log('Intersection Observers are not supported in this browser');
        loadImage(image);
    }

    function loadImage(image) {
        image.src = DBHelper.imageUrlForRestaurant(restaurant);
        image.dataset.src = DBHelper.imageUrlForRestaurant(restaurant);
        image.dataset.srcset = DBHelper.imageSrcsetForRestaurant(restaurant);
    }

    function onChanges(changes, observer) {
        changes.forEach(change => {
            if (change.intersectionRatio > 0)
        {
            loadImage(change.target);
            observer.unobserve(change.target);
        } else {
                console.log('no-preloader');
        }
        });
    }

    li.append(image);

    const div = document.createElement('div');
    li.append(div);

    const name = document.createElement('h2');
    name.innerHTML = restaurant.name;
    div.append(name);

    const neighborhood = document.createElement('p');
    neighborhood.innerHTML = restaurant.neighborhood;
    li.append(neighborhood);

    const address = document.createElement('p');
    address.innerHTML = restaurant.address;
    li.append(address);


    const more = document.createElement('a');
    more.innerHTML = 'View Details';
    more.href = DBHelper.urlForRestaurant(restaurant);
    more.title = 'restaurant information and reviews';
    li.append(more);

    return li
}
/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) =>
{
    console.log('restaurantsMain', restaurants);
    restaurants.forEach(restaurant => {
        // Add marker to the map
        const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
        window.location.href = marker.url
});
    self.markers.push(marker);
});
}

















