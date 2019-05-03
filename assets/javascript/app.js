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
var geoQuery;
var zAPI = 'bfe6cabea5affbbecd1d9161e766b35c';
var mapboxAPI = "pk.eyJ1Ijoiam9obmxvYnN0ZXIiLCJhIjoiY2p2NzY0dXZhMGNrcTRkbnRsczB2dmoyMSJ9.CoNbhJ5cOMwdsr3PCFy-XA";
var cuisine1 = [];
var cuisine2 = [];
var cuisineCombined = [];

var userDistance = 7;
var userRating = 3;
var restaurants = {};
var blacklistedRestaurants = [];
var visitedRestaurants = [];
var allowedRestaurants = [];
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
            var tBody = $("#debugTableBody");
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

function getVisitedOrBlacklisted() {
    visitedRef.on("value", function (snapshot) {
        // console.log("get visited " + snapshot.val().data);
        visitedRestaurants = JSON.parse(snapshot.val().data);
        // console.log("visited  " + visitedRestaurants + " allowed "+ allowedRestaurants);
        updateTable();
    }, function (errorObject) {
        console.log("Reading visited data failed: " + errorObject.code);
    });
    blacklistRef.on("value", function (snapshot) {
        blacklistedRestaurants = JSON.parse(snapshot.val().data);
        // console.log( "blacklist " + blacklistedRestaurants.length + " " + blacklistedRestaurants);
        updateTable();
    }, function (errorObject) {
        console.log("Reading blacklisted restaurants data failed: " + errorObject.code);
    });
    allowRef.on("value", function (snapshot) {
        allowedRestaurants = JSON.parse(snapshot.val().data);
        // console.log("allow " + allowedRestaurants.length + " " + allowedRestaurants);
        updateTable();
    }, function (errorObject) {
        console.log("Reading allowed restaurants data failed: " + errorObject.code);
    });




}

// adds restaurant to the visited list and updates database
function addVisitedRestaurant( name, date, cuisine, city) {
    // add to front of array so keep in date order
    // for (var i = 0; i < visitedRestaurants.length; i++) {
    //     console.log("Before " + i + " " + JSON.stringify(visitedRestaurants[i]));
    // }
    visitedRestaurants.unshift({
        name: name,
        date: date,
        cuisine: cuisine,
        city: city
    });
    // add to database
    visitedRef.set({ data: JSON.stringify(visitedRestaurants) });
    // for (var i=0; i < visitedRestaurants.length; i++) {
    //     console.log(i + " " + JSON.stringify(visitedRestaurants[i])) ;
    // }
    // watcher will see this and update table
}

// function returns a boolean - true if restaurant has not been visited, blacklisted or is in allow list
function validRestaurant (rName) {
    // if in allow list, return true
    if (inArray(rName, allowedRestaurants)) {
        return true;
    }
    if ( inArray(rName, visitedRestaurants) || inArray( rName, blacklistedRestaurants)) {
        return false;
    }
    else {
        return true;
    }


}
// check whether a restaurant name is present in an array
function inArray(rName, rArray) {
    for( var i = 0; i < rArray.length ; i++) {
        if (rArray[i].name === rName) {
            return true;
        }
    }
    // wasn't found return false
    return false;
}

// used for testing, not part of main flow
function createDummyDataBase(){
    console.log("Create dummy database " + JSON.stringify(visitedRestaurants));
    visitedRef.set( {data: JSON.stringify(visitedRestaurants)} );
    allowRef.set({ data: JSON.stringify([])});
    blacklistRef.set({ data: JSON.stringify([]) });
    
}
// utility function for debugging
function clearDatabase () {
    console.log("Firebase atabase reset");
    visitedRef.set({ data: JSON.stringify([]) });
    allowRef.set({ data: JSON.stringify([]) });
    blacklistRef.set({ data: JSON.stringify([]) });
}
// used for testing, not part of main flow
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
    visitedRestaurants[3]= {
        name: "Murder burger",
        date: "1/4/19",
        cuisine: "burgers",
        city: "Davis"
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

        // console.log("Update table " + visitedRestaurants[i].name + " allowed " + JSON.stringify(allowedRestaurants));
        if (inArray(visitedRestaurants[i].name, allowedRestaurants)) {
            // in allow list, create td with green background
            var aTemp = ($("<td>"));
            aTemp.css("background", "lightgreen");
            
            var newAllowRevertButton = $("<button>");
            newAllowRevertButton.attr("id", "allowRevert" + String(i));
            newAllowRevertButton.attr("data-value", i);
            newAllowRevertButton.addClass("allowRevertButton btn btn-dark");
            newAllowRevertButton.text("revert");
            aTemp.append(newAllowRevertButton);
            newRow.append(aTemp);
        }
        else {
            // create buttons for allow
            var newAllowButton = $("<button>");
            newAllowButton.attr("id", "allow" + String(i));
            newAllowButton.attr("data-value", i);
            newAllowButton.addClass("allowButton btn btn-info");
            newAllowButton.text("allow");
            var temp = ($("<td>")).append(newAllowButton);
            newRow.append(temp);
        }

        if (inArray(visitedRestaurants[i].name, blacklistedRestaurants)) {
            // blacklisted create td with red background
            var bTemp = ($("<td>"));
            bTemp.css("background", "lightcoral");
            // add revert button
            var newBlacklistRevertButton = $("<button>");
            newBlacklistRevertButton.attr("id", "blacklistRevert" + String(i));
            newBlacklistRevertButton.attr("data-value", String(i));
            newBlacklistRevertButton.addClass("blacklistRevertButton btn btn-dark");
            newBlacklistRevertButton.text("revert");
            bTemp.append(newBlacklistRevertButton);
            newRow.append(bTemp);
        }
        else {
            var newBlacklistButton = $("<button>");
            newBlacklistButton.attr("id", "blacklist" + String(i));
            newBlacklistButton.attr("data-value", String(i));
            newBlacklistButton.addClass("blacklistButton btn btn-info");
            newBlacklistButton.text("never again");
            temp = ($("<td>")).append(newBlacklistButton);
            newRow.append(temp);
        }
        // add to table
        $("#winnersTableBody").append(newRow);

    }
    // add button listeners
    $(".allowButton").off("click");
    $(".allowButton").on("click", function () {
        var rowNumber = $(this).attr("data-value");
        console.log("Allow button pressed row " + rowNumber);
        // console.log( visitedRestaurants[ rowNumber].name);
        allowedRestaurants.unshift(visitedRestaurants[rowNumber] );
        allowRef.set({ data: JSON.stringify(allowedRestaurants) });
    });
    $(".allowRevertButton").off("click");
    $(".allowRevertButton").on("click", function () {
        var rowNumber = $(this).attr("data-value");
        console.log(" reverting allow " + visitedRestaurants[rowNumber].name);
        // remove restaurant from allowed list
        for (var i = 0; i < allowedRestaurants.length; i++) {
            if (allowedRestaurants[i].name === visitedRestaurants[rowNumber].name) {
                allowedRestaurants.splice(i,1);
                allowRef.set({ data: JSON.stringify(allowedRestaurants) });
                break;
            }
        }    
    });
    $(".blacklistButton").off("click");
    $(".blacklistButton").on("click", function () {
        var rowNumber = $(this).attr("data-value");
        console.log("Never again button pressed row " + $(this).attr("data-value"));
        console.log(visitedRestaurants[rowNumber].name);
        blacklistedRestaurants.unshift(visitedRestaurants[rowNumber]);
        blacklistRef.set({ data: JSON.stringify(blacklistedRestaurants) });
    });
    $(".blacklistRevertButton").off("click");
    $(".blacklistRevertButton").on("click", function () {
        var rowNumber = $(this).attr("data-value");
        console.log(" reverting blacklist " + visitedRestaurants[rowNumber].name);
        // remove restaurant from allowed list
        for (var i = 0; i < blacklistedRestaurants.length; i++) {
            if (blacklistedRestaurants[i].name === visitedRestaurants[rowNumber].name) {
                blacklistedRestaurants.splice(i, 1);
                blacklistRef.set({ data: JSON.stringify(blacklistedRestaurants) });
                break;
            }
        }
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
// get information from firebase 
getVisitedOrBlacklisted();

// clearDatabase();
// createTestData();
// createDummyDataBase();

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

// console.log("Valid restaurant " + validRestaurant("Freds"));
// console.log("Valid restaurant " + validRestaurant("Elephant"));
// addVisitedRestaurant("Again", "3/13/2019", "burger","Folsom");
// addVisitedRestaurant("and again", "3/13/2019", "burger", "Folsom");


