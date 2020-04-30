# Mobile Web Specialist Certification Course

![image](img/project-image.png)

## Project Overview: 

Restaurant Reviews is a responsive, offline first, progressive web application (PWA), done for the Udacity Mobile Web Specialist Nanodegree as part of the Google Developer Scholarship program.


### Challenge

>Leverage front end web patterns & APIs, such as service workers to convert a static web page into a mobile-ready web application, allowing users to look up restaurants in the New York area and view additional information about a selected restaurant.
>Any data previously accessed by the user whilst connected is reachable while offline.
>A user must also be able to leave a review and add a restaurant to their list of favourites both online and offline.  

The application must achieve a lighthouse score > 90.

### Approach
In order to achieve a lighthouse score > 90 I focused on 4 main areas; 
>1.Responsive Design
>2.Accessibility
>3.Application Data & Offline Use
>4.Performance

### Install & Run
1. Clone this repository
2. Add a Google Maps API Key
> As displaying the location of each restaurant on a map is a feature of this project you will to supply an Google Maps JavasScript API key in both the index.html and the restaurant.html files.
> For more information on how to do this please follow the instructions provided [here](https://developers.google.com/maps/documentation/javascript/get-api-key).
3. With your API keys added, in this folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer. 
In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.
4. With your server running, visit the site: `http://localhost:8000`, and look around for a bit to see what the current experience looks like.

### Serving Data
The data for this application has been provided by Udacity. 
In order to serve the data for the application please follow the instructions found [here](https://github.com/udacity/mws-restaurant-stage-2).
The port this runs in should match the path found in the IDB helper. Ensure these match, if not update the patch in the IDB helper to match that of the port hosting the server.




