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
// var robs-zAPI = 'bfe6cabea5affbbecd1d9161e766b35c';
var zAPI = '6b7a0827c3398a3d31d61d19498285ac';
var mapboxAPI = "pk.eyJ1Ijoiam9obmxvYnN0ZXIiLCJhIjoiY2p2NzY0dXZhMGNrcTRkbnRsczB2dmoyMSJ9.CoNbhJ5cOMwdsr3PCFy-XA";
var cuisine1 = [];
var cuisine2 = [];
var cuisineCombined = [];
var currentCuisines = [];
console.log("++++++Starting Cuisines Array++++");
console.log(currentCuisines);

var userDistance = 7;
var userRating = 3;
var restaurants = [];
var blacklistedRestaurants = [];
var visitedRestaurants = [];
var allowedRestaurants = [];
var counter = 0;
var rand = 0;
var winner = [];

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
            // tBody.append(tRow);
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
            console.log("Cuisine Test: " + cuisineSplit[i]);
            console.log(currentCuisines);
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
    console.log("Length: " + currentCuisines.length);
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
    cuisine1 = [];
    cuisine2 = [];
    cuisineCombined = [];
    var cuisineSelection = $(this).attr("data");
    $("#cuisine-button1").text(cuisineSelection);
    createRestArray();
});

$(document).on("click", ".cuisine2", function () {
    cuisine1 = [];
    cuisine2 = [];
    cuisineCombined = [];
    var cuisineSelection = $(this).attr("data");
    $("#cuisine-button2").text(cuisineSelection);
    createRestArray();
});

// click function for "Choose My Dinner" button
$(document).on("click", "#chooseButton", function (event) {
    event.preventDefault();
    console.log("Choose Button Clicked");
    rand = cuisineCombined[Math.floor(Math.random() * cuisineCombined.length)];
    console.log("rob - Winner: " + rand);
    winner = cuisineCombined[rand];
    console.log(restaurants);
    winner = restaurants.filter(function(restaurant) {
        return restaurant.restaurant.name === rand;
    })
    var todayDate = new Date();
    todayString = todayDate.getMonth()+1 + "/" + todayDate.getDate() + "/" + todayDate.getFullYear();
    addVisitedRestaurant(winner[0].restaurant.name, todayString, winner[0].restaurant.cuisines, winner[0].restaurant.location.locality)
    console.log("winner details: " + JSON.stringify(winner));
    console.log("Name: " + winner[0].restaurant.name);
    console.log("Address: " + winner[0].restaurant.location.address);
    console.log("Rating: " + winner[0].restaurant.user_rating.rating_text);
    showWinner(winner[0]);
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
    var j = 0;
    var k = 0;
    for (let i = 0; i < restaurants.length; i++) {
        // console.log("danger: " + restaurants[i].restaurant.cuisines);
        if (restaurants[i].restaurant.cuisines.includes($("#cuisine-button1").text()) && validRestaurant(restaurants[i].restaurant.name)) {
            j++;
            cuisine1.push(restaurants[i].restaurant.name);
        }
        if (restaurants[i].restaurant.cuisines.includes($("#cuisine-button2").text()) && validRestaurant(restaurants[i].restaurant.name)) {
            k++;
            cuisine2.push(restaurants[i].restaurant.name);
        }
    }
    console.log("restaurants in cuisine 1: " + j);
    console.log("restaurants in cuisine 2: " + k);
    l = Math.min(j, k);
    console.log("max restaurants in either cuisine: " + l);
    cuisineCombined = [];
    for (maxChoices = 0; maxChoices < l; maxChoices++) {
        cuisineCombined.push(cuisine1[maxChoices]);
    }
    for (maxChoices = 0; maxChoices < l; maxChoices++) {
        cuisineCombined.push(cuisine2[maxChoices]);
    }
    console.log("-------Restaurant Choices-------");
    console.log(cuisineCombined);
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
function addVisitedRestaurant(name, date, cuisine, city) {
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
function validRestaurant(rName) {
    // if in allow list, return true
    if (inArray(rName, allowedRestaurants)) {
        return true;
    }
    if (inArray(rName, visitedRestaurants) || inArray(rName, blacklistedRestaurants)) {
        return false;
    }
    else {
        return true;
    }


}
// check whether a restaurant name is present in an array
function inArray(rName, rArray) {
    for (var i = 0; i < rArray.length; i++) {
        if (rArray[i].name === rName) {
            return true;
        }
    }
    // wasn't found return false
    return false;
}

// used for testing, not part of main flow
function createDummyDataBase() {
    console.log("Create dummy database " + JSON.stringify(visitedRestaurants));
    visitedRef.set({ data: JSON.stringify(visitedRestaurants) });
    allowRef.set({ data: JSON.stringify([]) });
    blacklistRef.set({ data: JSON.stringify([]) });

}
// utility function for debugging
function clearDatabase() {
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
    visitedRestaurants[3] = {
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
        allowedRestaurants.unshift(visitedRestaurants[rowNumber]);
        allowRef.set({ data: JSON.stringify(allowedRestaurants) });
    });
    $(".allowRevertButton").off("click");
    $(".allowRevertButton").on("click", function () {
        var rowNumber = $(this).attr("data-value");
        console.log(" reverting allow " + visitedRestaurants[rowNumber].name);
        // remove restaurant from allowed list
        for (var i = 0; i < allowedRestaurants.length; i++) {
            if (allowedRestaurants[i].name === visitedRestaurants[rowNumber].name) {
                allowedRestaurants.splice(i, 1);
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

function showWinner (winnerObject) {
    
    
 
    // need to wait until all api fetches finish, 3 seconds
    var temp = setTimeout(function () {
        
        
        $("#restaurantImage").attr("src", "assets/images/knifeAndFork.jpg");
        // if ( winnerObject.restaurant.featured_image === "") {
        //     // use a generic image if no image available
        //     $("#restaurantImage").attr("src", "../images/knifeAndFork.img");
        // }
        // else {
        //     $("#restaurantImage").attr("src", winnerObject.restaurant.featured_image);
        // }
        
        $("#winningRestaurant").text(winnerObject.restaurant.name);

        $("#winningCuisine").text("Cuisine : " + winnerObject.restaurant.cuisines);
        $("#restaurantAddress").text(winnerObject.restaurant.location.address);
        
        console.log("Show modal");
        $("#winnerModal").modal({
            show: true
        });
        // wait until modal has shown before setting up map otherwise map appears in wrong place
        var temp2 = setTimeout(function () {
            getMap(winnerObject.restaurant.location.latitude, winnerObject.restaurant.location.longitude);
            $(".mapboxgl-missing-css").hide();
        }, 1000);
    }, 2000);
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
function getMap(lattitude, longitude) {
    mapboxgl.accessToken = mapboxAPI;
    var map = new mapboxgl.Map({
        container: "restaurantMap", // HTML container id
        style: 'mapbox://styles/mapbox/streets-v9', // style URL
        center: [longitude, lattitude], // starting position as [lng, lat]
        zoom: 14
    });
    var marker = new mapboxgl.Marker()
        .setLngLat([longitude, lattitude])
        .addTo(map);
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
    totalSearch = 120;

    // this for loop gets multiple queries completed
    console.log(searchType);
    for (let searchStart = 0; searchStart < totalSearch; searchStart += 20) {
        geoQuery = "https://developers.zomato.com/api/v2.1/" + searchType + "?start=" + searchStart + "&count=" + searchCount + "&lat=" + currentLatitude + "&lon=" + currentLongitude + "&sort=real_distance&order=asc";
        console.log("GeoQuery: " + geoQuery);
        goSearch();
    }

    // testing showWinner()
    // var temp=setTimeout( function () {
    //     console.log("check first restaurant");
    //     console.log(JSON.stringify(restaurants[0]));
    //     showWinner( restaurants[0]);
    // }, 3000);
    

    

    
    
}

getLocation();

// console.log("Valid restaurant " + validRestaurant("Freds"));
// console.log("Valid restaurant " + validRestaurant("Elephant"));
// addVisitedRestaurant("Again", "3/13/2019", "burger","Folsom");
// addVisitedRestaurant("and again", "3/13/2019", "burger", "Folsom");


