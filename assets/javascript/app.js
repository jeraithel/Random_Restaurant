// Setup Firebase Config

// drop firebase config above this line
// firebase.initializeApp(config);

// initializing moment.js
moment().format();
console.log(moment());

// Get a snapshot of Firebase Data
// database.ref().on('value', function(snapshot) {
// console.log(snapshot.val());
// });

// Global Vars to hold general details
// var database = firebase.database();
var currentLatitude = 0;
var currentLongitude = 0;
var zAPI = 'bfe6cabea5affbbecd1d9161e766b35c';
var cuisine1 = [];
var cuisine2 = [];
var cuisineCombined = [];

function getCuisines (lat,long) {

console.log ("Inside getCuisines Lat: " + lat);
console.log ("Inside getCuisines Lat: " + long);
var cuisineQuery = "https:developers.zomato.com/api/v2.1/cuisines?lat=" + lat + "&lon=" + long;
var geoQuery = "https:developers.zomato.com/api/v2.1/geocode?lat=" + lat + "&lon=" + long;

$.ajax({
    url: geoQuery,
    method: "GET",
    beforeSend: function (xhr) { xhr.setRequestHeader('user-key', zAPI) }
}).then(function (response) {
    console.log(response.nearby_restaurants);
    console.log(response.nearby_restaurants[0].restaurant.name);
    for (let i=0; i < response.nearby_restaurants.length; i++) {
        // create arrays of each cuisine to compare them 
    }

});

$.ajax({
    url: cuisineQuery,
    method: "GET",
    beforeSend: function (xhr) { xhr.setRequestHeader('user-key', zAPI) }
}).then(function (response) {
    console.log(response.cuisines);
    console.log(response.cuisines[0].cuisine.cuisine_name);
    for (let i=0; i < response.cuisines.length; i++) {
        var menuItem = $("<a>");
        menuItem.text(response.cuisines[i].cuisine.cuisine_name);
        menuItem.addClass("dropdown-item");
        menuItem.addClass("cuisine1");
        menuItem.attr("data", response.cuisines[i].cuisine.cuisine_name);
        $("#dropdown-menu1").append(menuItem);
    };
    for (let i=0; i < response.cuisines.length; i++) {
        var menuItem = $("<a>");
        menuItem.text(response.cuisines[i].cuisine.cuisine_name);
        menuItem.addClass("dropdown-item");
        menuItem.addClass("cuisine2");
        menuItem.attr("data", response.cuisines[i].cuisine.cuisine_name);
        $("#dropdown-menu2").append(menuItem);
    };
});
};

$(document).on("click", ".cuisine1", function() {
    var cuisineSelection = $(this).attr("data");
    $("#cuisine-button1").text(cuisineSelection);
});

$(document).on("click", ".cuisine2", function() {
    var cuisineSelection = $(this).attr("data");
    $("#cuisine-button2").text(cuisineSelection);
});

// Geolocation
// Geolocation takes time so need to call main() function after geolocation has completed

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(saveLocation, locationError);
    } else {
        console.log("Geolocation Error : Geolocation is not supported by this browser.");
    }
}

function saveLocation(position) {
    main(position.coords.latitude, position.coords.longitude);
}

function locationError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            console.log("Geolocation Error : User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Geolocation Error : Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.log("Geolocation Error : The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console.log("Geolocation Error : An unknown error occurred.");
            break;
    }
}

function main(currentLatitude, currentLongitude) {
    console.log("Latitude: " + currentLatitude);
    console.log("Longitude: " + currentLongitude);
    
    console.log(navigator)
    getCuisines(currentLatitude,currentLongitude);
}
getLocation();
