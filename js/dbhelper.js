
const dbPromise = idb.open('restaurant-details', 1, upgradeDB => {
    upgradeDB.createObjectStore('restaurants');
    upgradeDB.createObjectStore('favorite-restaurants');
    upgradeDB.createObjectStore('restaurant-reviews', {autoIncrement:true});
});

/**
 * Common database helper functions.
 */

class DBHelper {

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */

    static getFromIDB(key, objectStore){
        return dbPromise.then(db => {
            return db.transaction(objectStore)
                .objectStore(objectStore).get(key);
    });
    }


    static getAllFromIDB (objectStore) {
        return dbPromise.then(db => {
            return db.transaction(objectStore)
                .objectStore(objectStore).getAll();
    });
    }


    static addToIDB(key, val, objectStore) {
        return dbPromise.then(db => {
            const tx = db.transaction(objectStore, 'readwrite');
        tx.objectStore(objectStore).put(val, key);
        console.log('finished adding data');
        return tx.complete;
    });
    }
    static addToReviewsIDB(val) {
        return dbPromise.then(db => {
            const tx = db.transaction('restaurant-reviews', 'readwrite');
        tx.objectStore('restaurant-reviews').put(val);
        console.log('finished adding data');
        return tx.complete;
    });
    }

    static deleteFromIDB(key, objectStore) {
        return dbPromise.then(db => {
            const tx = db.transaction(objectStore, 'readwrite');
        tx.objectStore(objectStore).delete(key);
        return tx.complete;
    });
    }


    static get DATABASE_URL() {
        const port = 1337; // Change this to your server port
        return `http://localhost:${port}/restaurants`;
    }


    static get DATABASE_URL_Review() {
        const port = 1337; // Change this to your server port
        return `http://localhost:${port}/reviews`;
    }

    static get DATABASE_URL_Favorites() {
        const port = 1337; // Change this to your server port
        return `http://localhost:${port}/restaurants/?is_favorite=true`;
    }

    /**
     * Fetch all restaurants from the database and store it in an idb.
     */

    static fetchRestaurants(callback) {

        fetch(DBHelper.DATABASE_URL)

            .then(function(response) {
                console.log('response', response);
                // Read the response as json.
                return response.json();
            })
            .then(function(responseAsJson) {
                const restaurants = responseAsJson;
                console.log('restaurants', restaurants);
                callback(null, restaurants);
                //Add data to indexedBD
                DBHelper.addToIDB('restaurant', restaurants, 'restaurants');
            })
            .catch(function(error) {
                var IDB = DBHelper.getFromIDB('restaurant', 'restaurants');
                console.log('Looks like there was a problem: \n', error);
                IDB.then(function(result) {
                    const myRestaurant = result;
                    callback(null, myRestaurant);
                    console.log(myRestaurant);
                }, function(err) {
                    console.log(err);
                });

            });
    }

    /**
     * Fetch all reviews from the database and store it in an idb.
     */


    static fetchReview(id, callback) {

        console.log('yippee id', id);

        fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`)
        // fetch(DBHelper.DATABASE_URL_Review)
            .then(function (response) {
                console.log('response', response);
                // Read the response as json.
                return response.json();
            })
            .then(function (responseAsJson) {
                const review = responseAsJson;
                console.log('review', review);
                var i;
                for (i = 0; i < review.length; i++) {
                    console.log('review id', review[i].id);
                    // DBHelper.addToIDB(review[i].id, review[i], 'restaurant-reviews');
                    DBHelper.addToReviewsIDB(review[i]);
                }
                callback(null, review);
            })
            .catch(function (error) {
                var IDB = DBHelper.getAllFromIDB('restaurant-reviews');
                // console.log('Looks like there was a problem: \n', error);
                IDB.then(function(result) {
                    const myReviews = result;
                    console.log('myReviews', myReviews);
                    var i;
                    const test = [];
                    for (i = 0; i < myReviews.length; i++) {
                        console.log('review id', myReviews[i].id);
                        console.log('review restaurant id', myReviews[i].restaurant_id);
                        if (myReviews[i].restaurant_id == id) {
                            console.log('myReviewYippee', myReviews[i]);
                            test.push(myReviews[i]);
                        }
                        console.log('test', test);
                    }
                    callback(null, test);
                }, function(err) {
                    console.log(err);
                });

            });

    }

    /**
     * Fetch favorite restuarants from the database and store it in an idb.
     */

    static fetchFavorites(callback) {

        fetch(DBHelper.DATABASE_URL_Favorites)

            .then(function (response) {
                console.log('response', response);
                // Read the response as json.
                return response.json();
            })
            .then(function (responseAsJson) {
                const favorites = responseAsJson;
                console.log('favorites', favorites);
                var i;
                for (i = 0; i < favorites.length; i++) {
                    console.log('favorites, id', favorites[i].id);
                    DBHelper.addToIDB(favorites[i].id, favorites[i], 'favorite-restaurants');
                }
                callback(null, favorites);
            })
            .catch(function (error) {
                var IDB = DBHelper.getAllFromIDB('favorite-restaurants');
                console.log('Looks like there was a problem: \n', error);
                IDB.then(function(result) {
                    const favoriteRestaurants = result;
                    console.log('favoriteRestaurants', favoriteRestaurants);
                    callback(null, favoriteRestaurants);

                }, function(err) {
                    console.log(err);
                });

            });
    }

    /**
     * Fetch a review by restaurant ID.
     */
    static fetchReviewById(id, callback) {
        console.log('fetchReviewByID', id);
        // fetch all restaurants with proper error handling.
        DBHelper.fetchReview((error, reviews) => {
            if (error) {
                callback(error, null);
            } else {
                const review = reviews.find(r => r.restaurant_id == id
    )
        ;
        if (review) { // Got the restaurant
            callback(null, review);
        } else { // Restaurant does not exist in the database
            callback('Restaurant does not exist', null);
        }
    }
    });
    }


    /**
     * Fetch a favorites by restaurant ID.
     */
    static fetchFavoritesById(id, callback) {
        console.log('fetchReviewByID', id);
        // fetch all restaurants with proper error handling.
        DBHelper.fetchFavorites((error, favoritess) => {
            if (error) {
                callback(error, null);
            } else {
                const favorites = favoritess.find(r => r.restaurant_id == id
    )
        ;
        if (favorites) { // Got the restaurant
            callback(null, favorites);
        } else { // Restaurant does not exist in the database
            callback('Restaurant does not exist', null);
        }
    }
    });
    }



    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        // fetch all restaurants with proper error handling.
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id
    )
        ;
        if (restaurant) { // Got the restaurant
            callback(null, restaurant);
        } else { // Restaurant does not exist in the database
            callback('Restaurant does not exist', null);
        }
    }
    });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        // Fetch all restaurants  with proper error handling
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given cuisine type
                const results = restaurants.filter(r => r.cuisine_type == cuisine
    )
        ;
        callback(null, results);
    }
    })
        ;
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Filter restaurants to have only given neighborhood
                const results = restaurants.filter(r => r.neighborhood == neighborhood
    )
        ;
        callback(null, results);
    }
    })
        ;
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants
                if (cuisine != 'all'
    )
        { // filter by cuisine
            results = results.filter(r => r.cuisine_type == cuisine
        )
            ;
        }
        if (neighborhood != 'all') { // filter by neighborhood
            results = results.filter(r => r.neighborhood == neighborhood
        )
            ;
        }
        callback(null, results);
    }
    })
        ;
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all neighborhoods from all restaurants
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i
    )
        callback(null, uniqueNeighborhoods);
    }
    })
        ;
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        // Fetch all restaurants
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                // Get all cuisines from all restaurants
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type
    )
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i
    )
        callback(null, uniqueCuisines);
    }
    })
        ;
    }

    /**
     * Restaurant page URL.
     */
    static urlForRestaurant(restaurant) {
        return (`./restaurant.html?id=${restaurant.id}`);
    }

    /**
     * Restaurant image URL.
     */
    static imageUrlForRestaurant(restaurant) {
        console.log('imageUrlForRestaurant', restaurant);
        console.log('restaurantPhoto', restaurant.photograph);

        if (restaurant.photograph === undefined) {
            return (`/img/default.jpg`);
        } else {
            return (`/img/${restaurant.photograph}.jpg`);
        }
    }

    /**
     * Restaurant image srcset.
     */
    static imageSrcsetForRestaurant(restaurant) {

        if (restaurant.photograph === undefined){
            return (`/img/responsive/800w/default.jpg 800w, /img/responsive/480w/default.jpg 480w, /img/responsive/360w/default.jpg 360w`);
        } else {
            return (`/img/responsive/800w/${restaurant.photograph}.jpg 800w, /img/responsive/480w/${restaurant.photograph}.jpg 480w, /img/responsive/360w/${restaurant.photograph}.jpg 360w`);
        }
    }

    /**
     * Map marker for a restaurant.
     */
    static mapMarkerForRestaurant(restaurant, map) {
        const marker = new google.maps.Marker({
                position: restaurant.latlng,
                title: restaurant.name,
                url: DBHelper.urlForRestaurant(restaurant),
                map: map,
                animation: google.maps.Animation.DROP,
                icon:'img/marker-01.png',
            }
        );
        return marker;
    }


    static saveOffline(form) {

        console.log('save offline', form);
        console.log(form.name.value);
        console.log(form.comments.value);
        console.log(form.id.value);

        const formObject = {
            "restaurant_id": form.id.value,
            "name": form.name.value,
            "comments": form.comments.value,
            "rating": form.restaurantRating.value,
        };


        var IDB = DBHelper.addToReviewsIDB(formObject);
        IDB.then(function(result) {
            const restaurantReview = result;
            console.log('restaurantReview', restaurantReview);
            // callback(null, restaurantReview);
        }, function(err) {
            console.log(err);
        });

        DBHelper.postReviewToDatabase(formObject);

    }

    static postReviewToDatabase(formObject) {

        return fetch(`http://localhost:1337/reviews/`,
            {method: 'POST',
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify(formObject),
            })
            .then(function(response) {
                console.log('response', response);
                return response.json();
            })
            .then(function(responseAsJson) {
                const data = responseAsJson;
                console.log('data', data);
                return data;
            })
            .catch(function (error) {
                console.log('Looks like there was a problem: \n', error);
                setTimeout(DBHelper.postReviewToDatabase, 30000, formObject);
                console.log('setTimeout is working');
            });

    }


    /**
     * Set Favorite Status
     */

    static setFavoriteStatus(id, status) {

        return fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=${status}`,
            {method: 'PUT'
            })
            .then(function(response) {
                console.log('response', response);
                return response.json();
            })
            .then(function(responseAsJson) {
                const data = responseAsJson;
                console.log('setFavoriteStatusData', data);
            })
            .catch(function (error) {
                console.log('Looks like there was a problem: \n', error);
                setTimeout(DBHelper.setFavoriteStatus, 30000, id, status);
                console.log('setTimeout is working');
            });

    }

}






