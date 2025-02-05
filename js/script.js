/***
 * Author: Nima Mahanloo
 * CST 336 HW 3: Fetch and Web APIs
 * Nov. 14, 2023
 */
//Global variables
var key = "8c34133486706f07a7efdf953ecd8ebb";
var dataValid = true;
var latitude = 0;
var logitude = 0;
var unit = "imperial";
var city = "";
var state = "";
var country = "";

//Initializing interface
initialScreen();

//Event listeners
let textbox1 = document.querySelector("#city_name");
let textbox2 = document.querySelector("#state_name");
let textbox3 = document.querySelector("#country_name");
let textboxes = [textbox1, textbox2, textbox3];
textboxes.forEach((textbox) => {
  textbox.addEventListener('change',getCityData);
});
document.querySelector("#go").addEventListener("click", validateForm);
  
//Functions
//Initializing interface at the beginning
function initialScreen() {
  var weatherDiv = document.querySelector("#display-weather");
  weatherDiv.style.display = "none";
  document.querySelector("#imperial").checked = true;
  document.querySelector("#unit").innerHTML = "F";
  document.querySelector("#dist-unit").innerHTML = "MPH";
  document.querySelector("#dist").innerHTML = "Miles";
}

//Getting necessary information from the user, and the latitude and longitude of the city from the web API
async function getCityData() {
  dataValid = true;
  city = document.querySelector("#city_name").value.toLowerCase();
  state = document.querySelector("#state_name").value.toLowerCase();
  country = document.querySelector("#country_name").value.toLowerCase();
  if ((city.length < 1) || (state.length < 1) || (country.length < 1)) {
    document.querySelector("#addressError").innerHTML = "";
    dataValid = false;
  }
  else {
    for (let i = 0; i < city.length; i++) {
      if ((city.charCodeAt(i) != 32) && (city.charCodeAt(i) < 97 || city.charCodeAt(i) > 122)) {
        dataValid = false;
        document.querySelector("#addressError").innerHTML = "Invalid city name!";
        document.querySelector("#addressError").className = "error";
        break;
      }
    }
    for (let i = 0; i < state.length; i++) {
      if ((state.charCodeAt(i) != 32) && (state.charCodeAt(i) < 97 || state.charCodeAt(i) > 122)) {
        dataValid = false;
        document.querySelector("#addressError").innerHTML = "Invalid state name!";
        document.querySelector("#addressError").className = "error";
        break;
      }
    }
    for (let i = 0; i < country.length; i++) {
      if ((country.charCodeAt(i) != 32) && (country.charCodeAt(i) < 97 || country.charCodeAt(i) > 122)) {
        dataValid = false;
        document.querySelector("#addressError").innerHTML = "Invalid country name!";
        document.querySelector("#addressError").className = "error";
        break;
      }
    }
    if (dataValid) {
      let url = `https://geocode.maps.co/search?city=${city}&state=${state}&country=${country}`;
      let response = await fetch(url);
      let data = await response.json();
      if (data.length > 0) {
        latitude = data[0].lat;
        longitude = data[0].lon;
        document.querySelector("#addressError").innerHTML = "Go ahead!";
        document.querySelector("#addressError").className = "ok";
        dataValid = true;
      }
      else {
        document.querySelector("#addressError").innerHTML = "No city was found based on your input!";
        document.querySelector("#addressError").className = "error";
        dataValid = false;
      }
    }
  }
}

//Validating the input data before processing
async function validateForm() { 
  let dataFilled = true;
  let city = document.querySelector("#city_name").value;
  let state = document.querySelector("#state_name").value;
  let country = document.querySelector("#country_name").value;
  if ((city.length < 1) || (state.length < 1) || (country.length < 1)) {
    dataFilled = false;
  }
  if (document.querySelector("input[name=units]:checked")) {
    unit = document.querySelector("input[name=units]:checked").value;
    if (unit == "metric") {
      document.querySelector("#unit").innerHTML = "C";
      document.querySelector("#dist-unit").innerHTML = "km/h";
      document.querySelector("#dist").innerHTML = "km";
    }
    else {
      document.querySelector("#unit").innerHTML = "F";
      document.querySelector("#dist-unit").innerHTML = "MPH";
      document.querySelector("#dist").innerHTML = "Miles";
    }
  }
  if (!dataValid || !dataFilled) {
    document.querySelector("#addressError").innerHTML = "Fill all the boxes correctly first!";
    document.querySelector("#addressError").className = "error";
  }
  else {
    displayWeather();
    getWeather();
  }
}

//Displaying the result section of the interface
function displayWeather() {
  var weatherDiv = document.querySelector("#display-weather");
  weatherDiv.style.display = "block";
}

//Capitalizing the first letters of city, state, and country
function fixName(name) {
  let i = 0;
  while ((name.charCodeAt(i) == 32) && (i < name.length)) {
    i++;
  }
  let character = name.charAt(i).toUpperCase();
  name = character + name.substring(i+1, name.length);
  for (let j = i+1; j < name.length; j++) {
    if (name.charCodeAt(j) == 32) {
      while (name.charCodeAt(j+1) == 32) {
        j++;
      }
      if (j+2 < name.length) {
        character = name.charAt(j+1).toUpperCase();
        name = name.substring(0, j+1) + character + name.substring(j+2, name.length);
      }
    }
  }
  return name;
}

//Processing sunrise and sunset times
function sunToTime (suntime, timezone) {
  let localDate = new Date();   
  let localOffset = localDate.getTimezoneOffset()*(-1);
  let cityOffset = timezone/60;
  let offset = 0;
  if ((localOffset < 0) && (cityOffset < 0)) {
    offset = cityOffset - localOffset;
    if (offset < 0) {
      offset = offset * (-1);
    }
  }
  else if ((localOffset > 0) && (cityOffset > 0)) {
    offset = cityOffset - localOffset;
    if (offset < 0) {
      offset = offset * (-1);
    }
  }
  else {
    offset = Math.abs(cityOffset) + Math.abs(localOffset);
  }
  let date = new Date(suntime*1000);
  if (cityOffset > localOffset) {
    date.setMinutes(date.getMinutes() + offset);
  }
  else {
    date.setMinutes(date.getMinutes() - offset);
  }
  const gmt = 'en-US';
  return date.toLocaleTimeString(gmt);
}

//Calculating the desired city's current time
function cityNow(timezone) {
  let cityOffset = timezone/60;
  let localDate = new Date();   
  let localOffset = localDate.getTimezoneOffset()*(-1);
  localDate.setMinutes(localDate.getMinutes() - localOffset);
  localDate.setMinutes(localDate.getMinutes() + cityOffset);
  const gmt = 'en-US';
  return localDate.toLocaleTimeString(gmt);
}

//Getting weather data from the web API and displaying the data
async function getWeather() {
  let url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${key}`;
  let response = await fetch(url);
  let data = await response.json();
  if (data) {
    let lastSync = new Date().toLocaleString();
    city = fixName(city);
    state = fixName(state);
    country = fixName(country);
    let sunrise = sunToTime(data.sys.sunrise, data.timezone);
    let sunset = sunToTime(data.sys.sunset, data.timezone);
    let cityTime = cityNow(data.timezone);
    let cityTimeStr = String(cityTime);
    let wall = "";
    let color = "";
    if (((cityTime > sunset) && (cityTimeStr[cityTimeStr.length-2] == 'P')) || ((cityTime < sunrise) && (cityTimeStr[cityTimeStr.length-2] == 'A'))) {
      wall = `url('/img/nightSky.png')`;
      color = "night";
    }
    else {
      wall = `url('/img/daySky.png')`;
      color = "day";
    }
    document.querySelector("#display-weather").style.backgroundImage = wall;
    document.querySelector("#display-weather").className = color;
    let visibility = data.visibility/1000;
    if (unit == "metric") {
      visibility = visibility * 1.609344;
      visibility = visibility.toFixed(2);
    }
    let pic = "";
    let weatherIcon = data.weather[0].icon;
    if (weatherIcon == "01d") {
      pic = "<img src='img/01d.png' 'alt='clear sky'>";
    }
    else if (weatherIcon == "01n") {
      pic = "<img src='img/01n.png' 'alt='night clear sky'>";
    }
    else if (weatherIcon == "02d") {
      pic = "<img src='img/02d.png' 'alt='few clouds'>";
    }
    else if (weatherIcon == "02n") {
      pic = "<img src='img/02n.png' 'alt='night few clouds'>";
    }
    else if (weatherIcon == "03d") {
      pic = "<img src='img/03d.png' 'alt='scattered clouds'>";
    }
    else if (weatherIcon == "03n") {
      pic = "<img src='img/03n.png' 'alt='night scattered clouds'>";
    }
    else if (weatherIcon == "04d") {
      pic = "<img src='img/04d.png' 'alt='broken clouds'>";
    }
    else if (weatherIcon == "04n") {
      pic = "<img src='img/04n.png' 'alt='night broken clouds'>";
    }
    else if (weatherIcon == "09d") {
      pic = "<img src='img/09d.png' 'alt='shower rain'>";
    }
    else if (weatherIcon == "09n") {
      pic = "<img src='img/09n.png' 'alt='night shower rain'>";
    }
    else if (weatherIcon == "10d") {
      pic = "<img src='img/10d.png' 'alt='rain'>";
    }
    else if (weatherIcon == "10n") {
      pic = "<img src='img/10n.png' 'alt='night rain'>";
    }
    else if (weatherIcon == "11d") {
      pic = "<img src='img/11d.png' 'alt='thunderstorm'>";
    }
    else if (weatherIcon == "11n") {
      pic = "<img src='img/11n.png' 'alt='night thunderstorm'>";
    }
    else if (weatherIcon == "13d") {
      pic = "<img src='img/13d.png' 'alt='snow'>";
    }
    else if (weatherIcon == "13n") {
      pic = "<img src='img/13n.png' 'alt='night snow'>";
    }
    else if (weatherIcon == "50d") {
      pic = "<img src='img/50d.png' 'alt='mist'>";
    }
    else if (weatherIcon == "50n") {
      pic = "<img src='img/50n.png' 'alt='night mist'>";
    }
    document.querySelector("#icon-div").innerHTML = pic;
    document.querySelector("#city").innerHTML = city;
    document.querySelector("#state").innerHTML = state;
    document.querySelector("#country").innerHTML = country;
    document.querySelector("#latitude").innerHTML = latitude;
    document.querySelector("#longitude").innerHTML = longitude;
    document.querySelector("#sunrise").innerHTML = sunrise;
    document.querySelector("#sunset").innerHTML = sunset;
    document.querySelector("#local-time").innerHTML = cityTime;
    document.querySelector("#temp").innerHTML = data.main.temp;
    document.querySelector("#weather").innerHTML = data.weather[0].main;
    document.querySelector("#weather-dsc").innerHTML = data.weather[0].description;
    document.querySelector("#feels-like").innerHTML = data.main.feels_like;
    document.querySelector("#temp-min").innerHTML = data.main.temp_min;
    document.querySelector("#temp-max").innerHTML = data.main.temp_max;
    document.querySelector("#wind-speed").innerHTML = data.wind.speed;
    document.querySelector("#wind-degree").innerHTML = data.wind.deg;
    document.querySelector("#clouds").innerHTML = data.clouds.all;
    document.querySelector("#visibility").innerHTML = visibility;
    document.querySelector("#humidity").innerHTML = data.main.humidity;
    document.querySelector("#pressure").innerHTML = data.main.pressure;
    document.querySelector("#last-sync").innerHTML = lastSync;
  }
}