// Setup Firebase Config

// database created by John Webster
// https://console.firebase.google.com/project/scratchdatabase/database/scratchdatabase/data
var config = {
    apiKey: "AIzaSyASaUqEw6TM_1v7LkG0iVZyDUI-WnTIUXg",
    authDomain: "scratchdatabase.firebaseapp.com",
    databaseURL: "https://scratchdatabase.firebaseio.com",
    projectId: "scratchdatabase",
    storageBucket: "scratchdatabase.appspot.com",
    messagingSenderId: "652319313164"
};

firebase.initializeApp(config);
var database = firebase.database();
// using sampleUser for now, app could be upgraded to have database for each user
var dbRef = database.ref("/randomRestaurant/sampleUser");
var blacklistRef = database.ref("/randomRestaurant/sampleUser/blacklist");
var visitedRef = database.ref("/randomRestaurant/sampleUser/visited");
var allowRef = database.ref("/randomRestaurant/sampleUser/allow");

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

var userDistance = 7;
var userRating = 3;
var restaurants = {};
var blacklistedRestaurants = [];
var visitedRestaurants = [];
var allowAgainRestaurants = [];

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

    var geoQuery = "https:developers.zomato.com/api/v2.1/geocode?lat=" + lat + "&lon=" + long;

    $.ajax({
        url: geoQuery,
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
    if ( localStorage.getItem("restaurantDistance") === null) {
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
    $("#distanceFormButton").on("click", function(event) {
        event.preventDefault(); // form submit so don't post
        userDistance = $("#distanceBox").val().trim();
        console.log("User distance " + userDistance);
        $("#distanceBox").val(userDistance);
    });
    $(".distanceItem").on("click", function() {
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
    })


    
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
            console.log("Restaurants in Cuisine 1: "+ cuisine1);
        }
        else if (restaurants[i].restaurant.cuisines.includes($("#cuisine-button2").text())) {
            k++;
            console.log("restaurants in cuisine 2: " + k);
            cuisine2.push(restaurants[i].restaurant.name);
            console.log("Restaurants in Cuisine 2: "+ cuisine2);
        }
    }
};

function getVisitedOrBlacklisted() {
    visitedRef.on("child_added", function (snapshot) {
        // fires once for each value in database and once for each new value added
        console.log("get visited " + snapshot.val());
        visitedRestaurants.push(JSON.parse(snapshot.val()));
    }, function (errorObject) {
        console.log("Reading blacklisted data failed: " + errorObject.code);
    });
    blacklistRef.on("child_added", function (snapshot) {
        // fires once for each value in database and once for each new value added
        blacklistedRestaurants.push(JSON.parse(snapshot.val()));
    }, function (errorObject) {
        console.log("Reading visited restaurants data failed: " + errorObject.code);
    });
    blacklistRef.on("child_added", function (snapshot) {
        // fires once for each value in database and once for each new value added
        blacklistedRestaurants.push(JSON.parse(snapshot.val()));
    }, function (errorObject) {
        console.log("Reading visited restaurants data failed: " + errorObject.code);
    });
    allowRef.on("child_added", function (snapshot) {
        // fires once for each value in database and once for each new value added
        allowedRestaurants.push(JSON.parse(snapshot.val()));
    }, function (errorObject) {
        console.log("Reading allowed restaurants data failed: " + errorObject.code);
    });




}


// used for testing
function createDummyDataBase(){
    for (i = 0; i < visitedRestaurants.length; i++) {
        visitedRef.push( JSON.stringify(visitedRestaurants[i]) );
    }
}
// used for testing
function createTestData() {
    visitedRestaurants[0] = {
        name: "Freds",
        date: "3/3/2019",
        cuisine: "fish and chips",
        city: "Folsom"
    }
    visitedRestaurants[1] = {
        name: "doobys",
        date: "3/4/2019",
        cuisine: "burgers",
        city: "Folsom"
    }
    visitedRestaurants[2] = {
        name: "McDonalds",
        date: "3/5/2019",
        cuisine: "burgers",
        city: "San Francisco"
    }

}

function updateTable() {

    // clear table
    $("#winnersTableBody").empty();
    for (var i = 0; i < visitedRestaurants.length; i++) {
        // add information on visited restaurants
        var newRow = $("<tr>");
        newRow.append($("<td>").text(visitedRestaurants[i].name));
        newRow.append($("<td>").text(visitedRestaurants[i].date));
        newRow.append($("<td>").text(visitedRestaurants[i].cuisine));
        newRow.append($("<td>").text(visitedRestaurants[i].city));
        // create buttons for allow
        var newAllowButton = $("<button>");
        newAllowButton.attr("id", "allow" + String(i));
        newAllowButton.attr("data-value", i);
        newAllowButton.addClass("allowButton");
        newAllowButton.text("allow");
        var temp = ($("<td>")).append(newAllowButton);
        newRow.append(temp);


        var newBlacklistButton = $("<button>");
        newBlacklistButton.attr("id", "blacklist" + String(i));
        newBlacklistButton.attr("data-value", i);
        newBlacklistButton.addClass("blacklistButton");
        newBlacklistButton.text("never again");
        temp = ($("<td>")).append(newBlacklistButton);
        newRow.append(temp);
        // add to table
        $("#winnersTableBody").append(newRow);

    }
    // add button listeners
    $(".allowButton").off("click");
    $(".allowButton").on("click", function () {
        console.log("Allow button pressed row " + $(this).attr("data-value"));
    });
    $(".blacklistButton").off("click");
    $(".blacklistButton").on("click", function () {
        console.log("Never again button pressed row " + $(this).attr("data-value"));
    });

}


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
getVisitedOrBlacklisted();
function main(currentLatitude, currentLongitude) {
    console.log("Latitude: " + currentLatitude);
    console.log("Longitude: " + currentLongitude);

    console.log(navigator)
    getCuisines(currentLatitude,currentLongitude);
    setupDistanceRating();

    getVisitedOrBlacklisted();

    updateTable();

}
getLocation();
//createTestData();
//createDummyDataBase();
