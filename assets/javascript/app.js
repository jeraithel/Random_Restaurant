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
var userLat = 38.6662008;
var userLon = -121.1789272;
var zAPI = 'bfe6cabea5affbbecd1d9161e766b35c';
var cuisine1 = "";
var cuisine2 = "";
// variables for restaurant details
var restName = "";
var restAddress = "";
var restCuisines = "";

var cuisineQuery = "https:developers.zomato.com/api/v2.1/cuisines/?lat=" + userLat + "&lon=" + userLon;
var geoQuery = "https:developers.zomato.com/api/v2.1/geocode?lat=" + userLat + "&lon=" + userLon;

    $.ajax({
      url: geoQuery,
      method: "GET",
      beforeSend: function(xhr){xhr.setRequestHeader('user-key', zAPI);},
    }).then(function(response) {
        console.log(response.nearby_restaurants);
        console.log(response.nearby_restaurants[0].restaurant.name);
      var tBody = $("tbody");
      var tRow = $("<tr>");
      // Methods run on jQuery selectors return the selector they we run on
      // This is why we can create and save a reference to a td in the same statement we update its text
      restName = $("<td>").text(response.nearby_restaurants[i].restaurant.name);
      restAddress = $("<td>").text(response.address);
      restCuisines = $("<td>").text(response.cuisines);
      // Append the newly created table data to the table row
      tRow.append(restName, restAddress, restCuisines);
      // Append the table row to the table body
      tBody.append(tRow);
      console.log(restName);
      console.log(restAddress);
      console.log(restCuisines);

    });


// Geolocation
// Geolocation takes time so need to call main() function after geolocation has completed

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(saveLocation,locationError);
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
            console.log( "Geolocation Error : User denied the request for Geolocation.");
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

function main(currentLatitude, currentLongitude){
    // console.log("Latitude: " + currentLatitude);
    // console.log("Longitude: " + currentLongitude);

}
getLocation();
