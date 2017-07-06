$(document).ready(function() {
  createSun();
  document.getElementById('weather').innerHTML = "loading...";
  document.getElementById('city').innerHTML = "somewhere";
  document.getElementById('region').innerHTML = "USA";
  document.getElementById('temp').innerHTML = "70";
});

// num of snow/raindrops
var numDrops = 500; 

// function to generate a random number range
function randRange(min, max) {
  return (Math.floor(Math.random() * (max - min + 1)) + min);
}

// function to generate rain
function createRain() {
	for(i = 1; i < numDrops; i++) {
    var dropLeft = randRange(0,1600);
    var dropTop = randRange(-1000,1000);

    $('.rain').append('<div class="drop" id="drop'+i+'"></div>');
    $('#drop'+i).css({
      left: dropLeft,
      top: dropTop,
      zIndex: '-900',
      position: 'absolute',
      'animation-duration': (Math.random()*1)+.4 + 's'
    });
  }
}

// function to generate sun
function createSun() {
  $('.sun').append('<div class="bg"></div>');
  $('body').css('background','red');
  
  $('.sun').append('<div id="sun-sphere"></div>');
  $('#sun-sphere').css({
    background: '#FF9800',
    width: '300px',
    height: '300px',
    bottom: '-150px',
    left: '50%',
    'border-radius': '50%',
    position: 'fixed'
  })
}

function createNight() {
  $('.night').append('<div class="moon"></div>');
  for (i=1;i<numDrops-200;i++){
    var starLeft = randRange(0,1600);
    var starTop = randRange(-1000,1000);
    
    $('.night').append('<div class="star" id="star'+i+'"></div>');
    $('#star'+i).css({
      left: starLeft,
      top: starTop,
      'border-radius': '25%',
      zIndex: '-900',
      position: 'absolute',
      'animation': 'twinkle linear infinite',
      'animation-duration': (Math.random()*3)+4 + 's'
    });
  }
}

// function to generate snow
function createSnow() {
  for(i = 1; i < numDrops-200; i++) {
    var dropLeft = randRange(0,1600);
    var dropTop = randRange(-1000,1000);

    $('body').css({'background-color': '#7E8AA2'});
    $('.rain').append('<div class="drop" id="drop'+i+'"></div>');
    $('#drop'+i).css({
      left: dropLeft,
      top: dropTop,
      'border-radius': '25%',
      zIndex: '-900',
      position: 'absolute',
      'animation': 'snow linear infinite',
      'animation-duration': (Math.random()*3)+5 + 's'
    });
  }
}

// weather api connections
(function () {
  var lat = "";
  var long = "";
  var degUnits = "c";
  var summary;
  var temp;
  var icon;
  var cityName;
  var regionName;

  // get user location information
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(setLatAndLong);
    }
  }
  
  function setLatAndLong(position) {
    lat = position.coords.latitude;
    long = position.coords.longitude;
    
    getWeatherData();
    getCity();
  }
  
  function updateInfo() {
    document.getElementById('weather').innerHTML = summary.toLowerCase();
    document.getElementById('city').innerHTML = cityName.toLowerCase();
    document.getElementById('region').innerHTML = regionName.toLowerCase();
    document.getElementById('temp').innerHTML = Math.round(temp);
    
    updateUI(summary);
  }
  
  function updateUI(weather) {
    switch(weather.toLowerCase()){
      case 'clear-day':
        createSun();
        break;
        
      case 'clear-night':
        createNight();
        break;
        
      case 'rain':
        createRain();
        break;
        
      case 'snow':
      case 'sleet':
        createSnow();
        break;
        
      /** TODO
      case 'fog':
        createFog();
        break;
        **/
        
      /** TODO
      case 'cloudy':
      case 'partly-cloudy-day':
        createClouds();
        break;
        **/
        
      /** TODO
      case 'wind':
        createWind();
        break()
        **/
        
      /** TODO
      case 'partly-cloudy-night':
        createNightClouds();
        break;
        **/
        
      default:
        createSun();
    }
  }
    
  // set imperial or metric
  function setDegrees(units) {
    if (units === "us") {
      degUnits = "f";
      document.getElementById('temp-changer').innerHtml = "view in °F";
    } else {
      degUnits = "c";
      document.getElementById('temp-changer').innerHtml = "view in °C";
    }
  }
  
  // get information from weather api
  function getWeatherData() {
    var url = 'https://cors.now.sh/https://api.darksky.net/forecast/dd91c6de8ebc3aa7ec1666cf4a0ae62b/' + String(lat) + ',' + String(long);
    
    var weatherRequest = new XMLHttpRequest();
    weatherRequest.onreadystatechange = function() {
      if (weatherRequest.readyState === 4 && weatherRequest.status === 200) {  
        var weatherInfo = JSON.parse(weatherRequest.responseText);
        summary = weatherInfo.currently.summary;
        temp = weatherInfo.currently.temperature;
        icon = weatherInfo.currently.icon;
        setDegrees(weatherInfo.flags.units);
        
        console.log("Current weather: " + summary);
      }
    };

    weatherRequest.open("GET", url, false);
    weatherRequest.send();
  }
  
  function getCity() {
    var url = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=' +
        String(lat) + ',' + String(long) + '&result_type=locality' + '&key=' + 
        'AIzaSyBaM91pvb7DME45UR6Fa6zGh1XnrIxun4w';
    var cityRequest = new XMLHttpRequest();
    cityRequest.onreadystatechange = function() {
      
      if (cityRequest.readyState === 4 && cityRequest.status === 200) {
        var cityInfo = JSON.parse(cityRequest.responseText);        
        cityName = cityInfo.results[0].address_components[0].long_name;
        regionName = cityInfo.results[0].address_components[2].long_name;
        
        console.log("Current city: " + cityName);
        console.log("Current city: " + regionName);
        
        updateInfo();
      }
    };

    cityRequest.open("GET", url, true);
    cityRequest.send();
  }

  getLocation();

})();

function convertTemp(unit) {
  if (unit === "F") {
    var curr = document.getElementById('temp').innerHTML;
    var result = Math.round((curr*9/5) + 32);
    console.log("Changed to C");
    return result;
  } else {
    var curr = document.getElementById('temp').innerHTML;
    var result = Math.round((curr-32)*5/9);
    console.log("Changed to F");
    return result;
  }
}

function changeUnits(obj) {
  if (obj.value === "view in °C") {
    obj.value = "view in °F";
    var t = convertTemp("C");
    document.getElementById('temp').innerHTML = t;
    document.getElementById('temp-unit').innerHTML = "C";
  } else {
    obj.value = "view in °C";
    var t = convertTemp("F");
    document.getElementById('temp').innerHTML = t;
    document.getElementById('temp-unit').innerHTML = "F";
  }

}
//  TODO: 1.  Change bg based on weather