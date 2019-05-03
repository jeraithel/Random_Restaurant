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
var cuisine1 = [];
var cuisine2 = [];
var cuisineCombined = [];
var currentCuisines = [];
console.log ("++++++Starting Cuisines Array++++");
console.log(currentCuisines);

var userDistance = 7;
var userRating = 3;
var restaurants = [];
var counter = 0;

function goSearch() {
    console.log('searching...')
    $.ajax({
        url: geoQuery,
        method: "GET",
        beforeSend: function (xhr) { xhr.setRequestHeader('user-key', zAPI); },
    }).then(function (response) {
        // console.log("ROB's API CALL ***********")
        // console.log(response.restaurants);
        for (let i = 0; i < response.restaurants.length; i++) {
            counter++;
            // console.log("Presenting Restaurant #: " + counter);
            // console.log("Restaurant Name: " + response.restaurants[i].restaurant.name);
            // console.log("i = " + i);
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
            restaurants.push(response.restaurants[i]);
            // console.log("Object of All Restaurants: ");
            // console.log(restaurants);
        }
        console.log("Search Start: " + searchStart);
    });
}

function getCuisines() {

    for (let i = 0; i < restaurants.length; i++) {
        console.log("Cuisines");
        console.log(restaurants[i].restaurant.cuisines);
        var cuisineSplit = restaurants[i].restaurant.cuisines.split(", ");
        console.log(cuisineSplit);
        for (let i = 0; i < cuisineSplit.length; i++) {
            console.log ("Cuisine Test: " + cuisineSplit[i]);
            console.log (currentCuisines);
            if (currentCuisines.includes(cuisineSplit[i])) {
                console.log(cuisineSplit[i] + " already included");
            }
            else {
                console.log("Adding: " + cuisineSplit[i]);
                currentCuisines.push(cuisineSplit[i]);
            }
        }
    };
    currentCuisines.sort();
    console.log ("Length: " + currentCuisines.length);
    for (let i = 0; i < currentCuisines.length; i++) {
        var menuItem = $("<a>");
        menuItem.text(currentCuisines[i]);
        menuItem.addClass("dropdown-item");
        menuItem.addClass("cuisine1");
        menuItem.attr("data", currentCuisines[i]);
        $("#dropdown-menu1").append(menuItem);
    }
    for (let i = 0; i < currentCuisines.length; i++) {
        var menuItem = $("<a>");
        menuItem.text(currentCuisines[i]);
        menuItem.addClass("dropdown-item");
        menuItem.addClass("cuisine2");
        menuItem.attr("data", currentCuisines[i]);
        $("#dropdown-menu2").append(menuItem);
    }
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



function main(currentLatitude, currentLongitude) {
    console.log("Latitude: " + currentLatitude);
    console.log("Longitude: " + currentLongitude);

    console.log(navigator);
    setTimeout(getCuisines, 2000);
    setupDistanceRating();
    searchType = "search";
    searchStart = 0;
    searchCount = 20;
    totalSearch = 140;

    // this for loop gets multiple queries completed
    console.log(searchType);
    for (let searchStart = 0; searchStart < totalSearch; searchStart += 20) {
        geoQuery = "https://developers.zomato.com/api/v2.1/" + searchType + "?start=" + searchStart + "&count=" + searchCount + "&lat=" + currentLatitude + "&lon=" + currentLongitude + "&sort=real_distance&order=asc";
        console.log("GeoQuery: " + geoQuery);
        goSearch();
    }
}

getLocation();
