let restaurant;
const favorite_btn = document.createElement('button');

/**
 * Add an event listener for offline/online notification.
 */
window.addEventListener("load", () => {
    if (navigator.onLine) {
        document.getElementById("offline-notification").classList.add("hide");
    } else {
        document.getElementById("offline-notification").classList.remove("hide");
    }

    function handleNetworkChange(event) {
        if (navigator.onLine) {
            document.getElementById("offline-notification").classList.add("hide");
        } else {
            document.getElementById("offline-notification").classList.remove("hide");
        }
    }

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);
});

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
    fetchRestaurantFromURL((error, restaurant) => {
        if (error) {
            console.error(error);
        } else {
            self.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 16,
                center: restaurant.latlng,
                scrollwheel: false
            });
            fillBreadcrumb();
            DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
        }
    });
    fetchFavoritesFromURL((error, favorites) => {
        if (error) {
            console.error(error);
        }
    });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
    if (self.restaurant) {
        callback(null, self.restaurant)
        return;
    }
    const id = getParameterByName('id');
    if (!id) {
        const error = 'No restaurant id in URL'
        callback(error, null);
    } else {
        DBHelper.fetchRestaurantById(id, (error, restaurant) => {
            self.restaurant = restaurant;
            if (!restaurant) {
                console.error(error);
                return;
            }
            fillRestaurantHTML();
            callback(null, restaurant)
        });
    }
}


/**
 * Get a list of favourite restaurants from the DB
 */
fetchFavoritesFromURL = (callback) => {
    if (self.favorites) {
        callback(null, self.favorites);
        return;
    }
    const id = getParameterByName('id');
    if (!id) {
        let error = 'No restaurant id in URL';
        callback(error, null);
    } else {
        DBHelper.fetchFavoritesById(id, (error, favorites) => {
            if (!favorites) {
                console.error(error);
                return;
            }
            callback(null, favorites);
        });
    }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews) => {
    const container = document.getElementById('reviews-container');
    if (!reviews) {
        const noReviews = document.createElement('p');
        noReviews.innerHTML = 'No reviews yet!';
        container.appendChild(noReviews);
        return;
    }
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
        ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
}


/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {

    const name = document.getElementById('restaurant-name');
    name.innerHTML = restaurant.name;
    const id = self.restaurant.id;

    const favorite = document.getElementById('favorite-restaurant');
    fillFavouriteRestaurantHTML(self.restaurant.id, self.restaurant.is_favorite, self.restaurant);

    favorite.appendChild(favorite_btn);

    const address = document.getElementById('restaurant-address');
    address.innerHTML = restaurant.address;

    const image = document.getElementById('restaurant-img');
    image.className = 'restaurant-img';

    // const imageSrc = DBHelper.imageUrlForRestaurant(restaurant);

    image.srcset = DBHelper.imageSrcsetForRestaurant(restaurant);
    image.sizes = "30vw";
    image.title = restaurant.name;
    image.alt = 'Image of ' + restaurant.name + ' restaurant';

    const cuisine = document.getElementById('restaurant-cuisine');
    cuisine.innerHTML = restaurant.cuisine_type;

    if (restaurant.operating_hours) {
        fillRestaurantHoursHTML();
    }
    createReviewFormHTML();

    DBHelper.fetchReview(id, (error, review) => {
        self.review = review;
        if (!review) {
            console.error(error);
            return;
        } else {
            fillReviewsHTML(review);
        }
    });

}

fillFavouriteRestaurantHTML = (id, status, data) => {

    if (status === 'true' || status === true) {
        favorite_btn.innerHTML = 'Remove from Favorites';
        favorite_btn.setAttribute('onclick', 'toggleFavorite(self.restaurant.id, false, self.restaurant)');

    } else {
        favorite_btn.innerHTML = 'Add to Favorites';
        favorite_btn.setAttribute('onclick', 'toggleFavorite(self.restaurant.id, true, self.restaurant)');
    }

}

function toggleFavorite(id, status, data) {

    if (status === 'true' || status === true) {
        DBHelper.addToIDB(id, data, 'favorite-restaurants');
        fillFavouriteRestaurantHTML(id, status, data);

    } else {
        DBHelper.deleteFromIDB(id, 'favorite-restaurants');
        fillFavouriteRestaurantHTML(id, status, data);
    }

    DBHelper.setFavoriteStatus(id, status);
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
    const hours = document.getElementById('restaurant-hours');
    for (let key in operatingHours) {
        const row = document.createElement('tr');

        const day = document.createElement('td');
        day.innerHTML = key;
        row.appendChild(day);

        const time = document.createElement('td');
        time.innerHTML = operatingHours[key];
        row.appendChild(time);

        hours.appendChild(row);
    }
}


/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
    const li = document.createElement('li');
    li.tabIndex = 0;
    const name = document.createElement('p');
    name.innerHTML = review.name;
    li.appendChild(name);

    const timestamp = new Date(review.createdAt);

    const date = document.createElement('p');
    date.innerHTML = timestamp.toDateString();
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${review.rating}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = review.comments;
    li.appendChild(comments);

    return li;
}

/**
 * Create review HTML and add it to the webpage.
 */

createReviewFormHTML = (id = self.restaurant.id) => {

    const form = document.getElementById('review-form');
    const reviewForm = document.createElement('form');

    reviewForm.setAttribute('onSubmit', 'fillOfflineReviewsHTML(event, this)');
    form.appendChild(reviewForm);

    const title = document.createElement('h2');
    title.setAttribute("class", "review");
    title.innerHTML = "Add a Review?";
    reviewForm.appendChild(title);

    const nameLabel = document.createElement('label');
    nameLabel.innerHTML = "Name"; // Set Field Labels
    nameLabel.setAttribute("class", "formElements");
    reviewForm.appendChild(nameLabel);

    const name = document.createElement('input');
    name.className = 'reviewer-name';
    name.setAttribute("type", "text");
    name.setAttribute("name", "name");
    name.setAttribute("aria-label", "name");
    name.setAttribute("class", "form-name");
    reviewForm.appendChild(name);

    const restaurantID = document.createElement('input');
    restaurantID.setAttribute("type", "hidden");
    restaurantID.setAttribute("name", "id");
    restaurantID.setAttribute("value", `${id}`);
    reviewForm.appendChild(restaurantID);

    const lineBreak1 = document.createElement('br');
    reviewForm.appendChild(lineBreak1);

    const ratingLabel = document.createElement('label');
    ratingLabel.innerHTML = "Rating"; // Set Field Labels
    reviewForm.appendChild(ratingLabel);

    const rating = document.createElement('select');
    rating.setAttribute('aria-label', 'restaurant rating');
    rating.setAttribute('id', 'restaurant-rating');
    rating.setAttribute('name', 'restaurantRating');

    const one = document.createElement('option');
    one.innerHTML = '1';
    one.setAttribute('selected', 'selected');
    one.setAttribute('value', '1');
    rating.appendChild(one);

    const two = document.createElement('option');
    two.innerHTML = '2';
    two.setAttribute('value', '2');
    rating.appendChild(two);

    const three = document.createElement('option');
    three.innerHTML = '3';
    three.setAttribute('value', '3');
    rating.appendChild(three);

    const four = document.createElement('option');
    four.innerHTML = '4';
    four.setAttribute('value', '4');
    rating.appendChild(four);

    const five = document.createElement('option');
    five.innerHTML = '5';
    five.setAttribute('value', '5');
    rating.appendChild(five);

    reviewForm.appendChild(rating);

    const lineBreak2 = document.createElement('br');
    reviewForm.appendChild(lineBreak2);

    const lineBreak3 = document.createElement('br');
    reviewForm.appendChild(lineBreak3);

    const commentsLabel = document.createElement('label');
    commentsLabel.innerHTML = "Comments"; // Set Field Labels
    commentsLabel.setAttribute("class", "formElements");
    reviewForm.appendChild(commentsLabel);

    const lineBreak4 = document.createElement('br');
    reviewForm.appendChild(lineBreak4);

    const comments = document.createElement('textarea');
    comments.setAttribute("name", "comments");
    comments.setAttribute("aria-label", "comments");
    comments.setAttribute("class", "formElements");
    comments.setAttribute("class", "comments");
    reviewForm.appendChild(comments);

    const lineBreak5 = document.createElement('br');
    reviewForm.appendChild(lineBreak5);

    const submit = document.createElement('input');
    submit.setAttribute("type", "submit");
    submit.setAttribute("name", "dsubmit");
    submit.setAttribute("value", "Submit");
    submit.setAttribute("id", "submitButton");
    submit.setAttribute("class", "submitButton");
    reviewForm.appendChild(submit);
}


/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
    const linkName = document.getElementById('current-page');
    const linkString = restaurant.name;
    linkName.innerHTML = linkString;
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
    if (!url)
        url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
        results = regex.exec(url);
    if (!results)
        return null;
    if (!results[2])
        return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


function fillOfflineReviewsHTML(event, form) {
    event.preventDefault();
    const timestamp = new Date().getTime();

    DBHelper.saveOffline(form);
    const container = document.getElementById('offline-reviews-container');

    const ul = document.getElementById('offline-reviews-list');

    const li = document.createElement('li');
    li.tabIndex = 0;
    const name = document.createElement('p');
    name.innerHTML = form.name.value;
    name.id = 'reviewer';
    li.appendChild(name);

    const ts = new Date(timestamp);

    const date = document.createElement('p');
    date.innerHTML = ts.toDateString();
    li.appendChild(date);

    const rating = document.createElement('p');
    rating.innerHTML = `Rating: ${form.restaurantRating.value}`;
    li.appendChild(rating);

    const comments = document.createElement('p');
    comments.innerHTML = form.comments.value;
    li.appendChild(comments);

    ul.appendChild(li);
    container.appendChild(ul);
    form.reset();
}
