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
var geoQuery;
var zAPI = 'bfe6cabea5affbbecd1d9161e766b35c';
var mapboxAPI = "pk.eyJ1Ijoiam9obmxvYnN0ZXIiLCJhIjoiY2p2NzY0dXZhMGNrcTRkbnRsczB2dmoyMSJ9.CoNbhJ5cOMwdsr3PCFy-XA";
var cuisine1 = [];
var cuisine2 = [];
var cuisineCombined = [];

var userDistance = 7;
var userRating = 3;
var restaurants = {};
var counter = 0;

function goSearch() {
    console.log('searching...')
    $.ajax({
        url: geoQuery,
        method: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('user-key', zAPI); },
    }).then(function (response) {
        console.log ("ROB's API CALL ***********")
        console.log (response.restaurants);
        for (let i = 0; i < response.restaurants.length; i++) {
            counter++;
            console.log("Presenting Restaurant #: " + counter);
            console.log("Restaurant Name: " + response.restaurants[i].restaurant.name);
            console.log("i = " + i);
            var tBody = $("tbody");
            var tRow = $("<tr>");
            // Methods run on jQuery selectors return the selector they we run on
            // This is why we can create and save a reference to a td in the same statement we update its text


            restName = $("<td>").text(response.restaurants[i].restaurant.name);
            restAddress = $("<td>").text(response.restaurants[i].restaurant.location.address);
            restCuisines = $("<td>").text(response.restaurants[i].restaurant.cuisines);
            // Append the newly created table data to the table row
            tRow.append(restName, restAddress, restCuisines);
            // Append the table row to the table body
            tBody.append(tRow);

            // hack for testing remove this
            if (i === (response.restaurants.length -1 )) {
                // console.log("full response " + response.restaurants[i]);
                console.log(geoQuery);
                var myTemp = response.restaurants[i];
                console.log("full response " + JSON.stringify(response.restaurants[i].restaurant));
                johnImg = response.restaurants[i].restaurant.featured_image;
                johnName = response.restaurants[i].restaurant.name;
                johnLong = response.restaurants[i].restaurant.location.longitude;
                johnLat = response.restaurants[i].restaurant.location.latitude;
                johnCuisine = response.restaurants[i].restaurant.cuisines;
                johnAddr = response.restaurants[i].restaurant.location.address;
            }
        }
        console.log("Search Start: " + searchStart);
    });
}

function getCuisines(lat, long) {

    console.log("Inside getCuisines Lat: " + lat);
    console.log("Inside getCuisines Lat: " + long);
    var cuisineQuery = "https:developers.zomato.com/api/v2.1/cuisines?lat=" + lat + "&lon=" + long;

    $.ajax({
        url: cuisineQuery,
        method: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('user-key', zAPI) }
    }).then(function (response) {
        console.log(response.cuisines);
        console.log(response.cuisines[0].cuisine.cuisine_name);
        for (let i = 0; i < response.cuisines.length; i++) {
            var menuItem = $("<a>");
            menuItem.text(response.cuisines[i].cuisine.cuisine_name);
            menuItem.addClass("dropdown-item");
            menuItem.addClass("cuisine1");
            menuItem.attr("data", response.cuisines[i].cuisine.cuisine_name);
            $("#dropdown-menu1").append(menuItem);
        };
        for (let i = 0; i < response.cuisines.length; i++) {
            var menuItem = $("<a>");
            menuItem.text(response.cuisines[i].cuisine.cuisine_name);
            menuItem.addClass("dropdown-item");
            menuItem.addClass("cuisine2");
            menuItem.attr("data", response.cuisines[i].cuisine.cuisine_name);
            $("#dropdown-menu2").append(menuItem);
        };
    });

    var geoQuery2 = "https:developers.zomato.com/api/v2.1/geocode?lat=" + lat + "&lon=" + long;

    $.ajax({
        url: geoQuery2,
        method: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('user-key', zAPI) }
    }).then(function (response) {
        restaurants = response.nearby_restaurants;
        console.log(response.nearby_restaurants);
        console.log(response.nearby_restaurants[0].restaurant.name);
    });
};

$(document).on("click", ".cuisine1", function () {
    var cuisineSelection = $(this).attr("data");
    $("#cuisine-button1").text(cuisineSelection);
    createRestArray();
});

$(document).on("click", ".cuisine2", function () {
    var cuisineSelection = $(this).attr("data");
    $("#cuisine-button2").text(cuisineSelection);
    createRestArray();
});

// reads defaults from local storage, then sets up listeners on buttons
function setupDistanceRating() {
    console.log("setup distance and rating");
    if (localStorage.getItem("restaurantDistance") === null) {
        localStorage.setItem("restaurantDistance", userDistance);
    }
    else {
        userDistance = localStorage.getItem("restaurantDistance")
    }
    if (localStorage.getItem("restaurantRating") === null) {
        localStorage.setItem("restaurantRating", userRating);
    }
    else {
        userRating = localStorage.getItem("restaurantRating")
    }
    console.log("distance = " + userDistance + " rating = " + userRating);
    // update the defaults on screen
    $("#distanceBox").val(userDistance);
    $("#ratingBox").val(userRating);
    // set up listeners ( one for form, other for button)
    $("#distanceFormButton").on("click", function (event) {
        event.preventDefault(); // form submit so don't post
        userDistance = $("#distanceBox").val().trim();
        console.log("User distance " + userDistance);
        $("#distanceBox").val(userDistance);
    });
    $(".distanceItem").on("click", function () {
        userDistance = $(this).attr("data-value");
        console.log("User distance from button " + userDistance);
        // update local storage and displayed text
        localStorage.setItem("restaurantDistance", userDistance);
        $("#distanceBox").val(userDistance);
    })
    $("#ratingFormButton").on("click", function (event) {
        event.preventDefault(); // form submit so don't post
        userRating = $("#ratingBox").val().trim();
        console.log("User rating " + userRating);
        $("#ratingBox").val(userRating);
    });
    $(".ratingItem").on("click", function () {
        userRating = $(this).attr("data-value");
        console.log("User rating from button " + userRating);
        // update local storage and displayed text
        localStorage.setItem("restaurantRating", userRating);
        $("#ratingBox").val(userRating);
    });
}

function createRestArray() {
    console.log("----Creation Restaurant Array----");
    console.log(restaurants.length);
    cuisine1 = [];
    cuisine2 = [];
    var j = 0;
    var k = 0;
    for (let i = 0; i < restaurants.length; i++) {
        console.log("danger: " + restaurants[i].restaurant.cuisines);
        if (restaurants[i].restaurant.cuisines.includes($("#cuisine-button1").text())) {
            j++;
            console.log("restaurants in cuisine 1: " + j);
            cuisine1.push(restaurants[i].restaurant.name);
            console.log("Restaurants in Cuisine 1: " + cuisine1);
        }
        else if (restaurants[i].restaurant.cuisines.includes($("#cuisine-button2").text())) {
            k++;
            console.log("restaurants in cuisine 2: " + k);
            cuisine2.push(restaurants[i].restaurant.name);
            console.log("Restaurants in Cuisine 2: " + cuisine2);
        }
    }
};


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

// uses mapbox to get a map image
function getMap() {
    mapboxgl.accessToken = mapboxAPI;
    var map = new mapboxgl.Map({
        container: "restaurantMap", // HTML container id
        style: 'mapbox://styles/mapbox/streets-v9', // style URL
        center: [johnLong, johnLat], // starting position as [lng, lat]
        zoom: 14
    });
    var marker = new mapboxgl.Marker()
        .setLngLat([johnLong, johnLat])
        .addTo(map);
}

function main(currentLatitude, currentLongitude) {
    console.log("Latitude: " + currentLatitude);
    console.log("Longitude: " + currentLongitude);

    console.log(navigator);
    getCuisines(currentLatitude, currentLongitude);
    setupDistanceRating();
    searchType = "search";
    searchStart = 0;
    searchCount = 20;
    totalSearch = 140;

    // this for loop gets multiple queries completed
    console.log(searchType);
    for (let searchStart = 0; searchStart < totalSearch; searchStart += 20) {
        geoQuery = "https://developers.zomato.com/api/v2.1/" + searchType +  "?start=" + searchStart + "&count=" + searchCount + "&lat=" + currentLatitude + "&lon=" + currentLongitude + "&sort=real_distance&order=asc";
        console.log("GeoQuery: " + geoQuery);
        goSearch();
    }

    var temp= setTimeout( function() {
        console.log("Show modal");
        johnImg = "";
        $("#winningRestaurant").text(johnName);
        $("#restaurantImage").attr("src", johnImg);
        $("#winningCuisine").text("Cuisine : " + johnCuisine);
        $("#restaurantAddress").text(johnAddr);
        // johnLat = 38.6786100000;
        // johnLong = -121.1755400000;
        
        
        $("#winnerModal").modal({
            show: true
        }); 
        var temp2 = setTimeout(function () {
            getMap();
            $(".mapboxgl-missing-css").hide();
        }, 1000);
    }, 3000);
    
}

getLocation();
