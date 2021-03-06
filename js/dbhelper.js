const dbPromise = idb.open('restaurant-details', 1, upgradeDB => {
    upgradeDB.createObjectStore('restaurants');
    upgradeDB.createObjectStore('favorite-restaurants');
    upgradeDB.createObjectStore('restaurant-reviews', {autoIncrement: true});
});

/**
 * Common database helper functions.
 */
class DBHelper {

    /**
     * Database URL.
     * Change this to restaurants.json file location on your server.
     */

    static getFromIDB(key, objectStore) {
        return dbPromise.then(db => {
            return db.transaction(objectStore)
                .objectStore(objectStore).get(key);
        });
    }

    static getAllFromIDB(objectStore) {
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
        const port = 1337;
        return `http://localhost:${port}/restaurants`;
    }

    static get DATABASE_URL_Review() {
        const port = 1337;
        return `http://localhost:${port}/reviews`;
    }

    static get DATABASE_URL_Favorites() {
        const port = 1337;
        return `http://localhost:${port}/restaurants/?is_favorite=true`;
    }

    /**
     * Fetch all restaurants from the database and store it in an idb.
     */
    static fetchRestaurants(callback) {
        fetch(DBHelper.DATABASE_URL)
            .then(function (response) {
                return response.json();
            })
            .then(function (responseAsJson) {
                const restaurants = responseAsJson;
                callback(null, restaurants);
                DBHelper.addToIDB('restaurant', restaurants, 'restaurants');
            })
            .catch(function (error) {
                const IDB = DBHelper.getFromIDB('restaurant', 'restaurants');
                IDB.then(function (result) {
                    const myRestaurant = result;
                    callback(null, myRestaurant);
                }, function (err) {
                    console.log(err);
                });

            });
    }

    /**
     * Fetch all reviews from the database and store it in an idb.
     */
    static fetchReview(id, callback) {

        fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`)
            .then(function (response) {
                return response.json();
            })
            .then(function (responseAsJson) {
                const review = responseAsJson;
                let i;
                for (i = 0; i < review.length; i++) {
                    DBHelper.addToReviewsIDB(review[i]);
                }
                callback(null, review);
            })
            .catch(function (error) {
                const IDB = DBHelper.getAllFromIDB('restaurant-reviews');
                IDB.then(function (result) {
                    const myReviews = result;
                    let i;
                    const test = [];
                    for (i = 0; i < myReviews.length; i++) {
                        if (myReviews[i].restaurant_id == id) {
                            test.push(myReviews[i]);
                        }
                    }
                    callback(null, test);
                }, function (err) {
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
                return response.json();
            })
            .then(function (responseAsJson) {
                const favorites = responseAsJson;
                let i;
                for (i = 0; i < favorites.length; i++) {
                    DBHelper.addToIDB(favorites[i].id, favorites[i], 'favorite-restaurants');
                }
                callback(null, favorites);
            })
            .catch(function (error) {
                const IDB = DBHelper.getAllFromIDB('favorite-restaurants');
                IDB.then(function (result) {
                    const favoriteRestaurants = result;
                    callback(null, favoriteRestaurants);
                }, function (err) {
                    console.log(err);
                });

            });
    }

    /**
     * Fetch a review by restaurant ID.
     */
    static fetchReviewById(id, callback) {
        DBHelper.fetchReview((error, reviews) => {
            if (error) {
                callback(error, null);
            } else {
                const review = reviews.find(r => r.restaurant_id == id
                    )
                ;
                if (review) {
                    callback(null, review);
                } else {
                    callback('Restaurant does not exist', null);
                }
            }
        });
    }


    /**
     * Fetch a favorites by restaurant ID.
     */
    static fetchFavoritesById(id, callback) {
        DBHelper.fetchFavorites((error, favoritess) => {
            if (error) {
                callback(error, null);
            } else {
                const favorites = favoritess.find(r => r.restaurant_id == id
                    )
                ;
                if (favorites) {
                    callback(null, favorites);
                } else {
                    callback('Restaurant does not exist', null);
                }
            }
        });
    }


    /**
     * Fetch a restaurant by its ID.
     */
    static fetchRestaurantById(id, callback) {
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const restaurant = restaurants.find(r => r.id == id
                    )
                ;
                if (restaurant) {
                    callback(null, restaurant);
                } else {
                    callback('Restaurant does not exist', null);
                }
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine type with proper error handling.
     */
    static fetchRestaurantByCuisine(cuisine, callback) {
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const results = restaurants.filter(r => r.cuisine_type == cuisine
                );
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a neighborhood with proper error handling.
     */
    static fetchRestaurantByNeighborhood(neighborhood, callback) {
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const results = restaurants.filter(r => r.neighborhood == neighborhood);
                callback(null, results);
            }
        });
    }

    /**
     * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
     */
    static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                let results = restaurants
                if (cuisine != 'all'
                ) {
                    results = results.filter(r => r.cuisine_type == cuisine);
                }
                if (neighborhood != 'all') {
                    results = results.filter(r => r.neighborhood == neighborhood);
                }
                callback(null, results);
            }
        });
    }

    /**
     * Fetch all neighborhoods with proper error handling.
     */
    static fetchNeighborhoods(callback) {
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
                const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i
                )
                callback(null, uniqueNeighborhoods);
            }
        });
    }

    /**
     * Fetch all cuisines with proper error handling.
     */
    static fetchCuisines(callback) {
        DBHelper.fetchRestaurants((error, restaurants) => {
            if (error) {
                callback(error, null);
            } else {
                const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
                const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
                callback(null, uniqueCuisines);
            }
        });
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

        if (restaurant.photograph === undefined) {
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
                icon: 'img/marker-01.png',
            }
        );
        return marker;
    }

    /**
     * Save reviews to idb before sending to the db.
     */
    static saveOffline(form) {
        const formObject = {
            "restaurant_id": form.id.value,
            "name": form.name.value,
            "comments": form.comments.value,
            "rating": form.restaurantRating.value,
        };

        const IDB = DBHelper.addToReviewsIDB(formObject);
        IDB.then(function (result) {
            const restaurantReview = result;
        }).catch(function (error) {
            console.log(error);
        });
        DBHelper.postReviewToDatabase(formObject);
    }

    /**
     * Post reviews to db.
     */
    static postReviewToDatabase(formObject) {
        return fetch(`http://localhost:1337/reviews/`,
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify(formObject),
            })
            .then(function (response) {
                return response.json();
            })
            .then(function (responseAsJson) {
                const data = responseAsJson;
                console.log('online', data);
                return data;
            })
            .catch(function (error) {
                console.log('offline');
                setTimeout(DBHelper.postReviewToDatabase, 30000, formObject);
            });
    }

    /**
     * Set favorite status.
     */
    static setFavoriteStatus(id, status) {
        return fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=${status}`,
            {
                method: 'PUT'
            })
            .then(function (response) {
                return response.json();
            })
            .then(function (responseAsJson) {
                const data = responseAsJson;
            })
            .catch(function (error) {
                setTimeout(DBHelper.setFavoriteStatus, 30000, id, status);
            });
    }
}






