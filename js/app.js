

var map, pos, infoWindow, $localImg, $location, $date, $temperature, $carousel, $minTemp, $maxTemp, $owl;
var $todayDate = new Date();
var $formatTodayDate = moment( $todayDate ).format("dddd MMM Do YYYY");
var $map = $("#map");
initMap();


function initMap() {
  
  pos = { lat: 53.6333, lng: -1.1333 };
  map = new google.maps.Map(document.getElementById('map'), {
    center: pos,
    zoom: 8
  });
  infoWindow = new google.maps.InfoWindow;

  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
     pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      
      getLocalInfo( callbackFunction );

    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }  
}

function handleLocationError(browserHasGeolocation, infoWindow) {
  
  getLocalInfo( callbackFunction );
}

google.maps.event.addListener( map, 'click', function(event) {

    pos = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    getLocalInfo( callbackFunction );
});

// get local images with google places library
function getLocalInfo( callback ) {
    
    var service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
      location: pos,
      radius: 500
      //type: ['shop']
    }, callback);
}                         
                         
function callbackFunction(places, status) {

  if (status == google.maps.places.PlacesServiceStatus.OK) {

    var photos = places[0].photos;
    if (!photos) {
      $localImg = "Image Unavailable";
      
    } else {
      $localImg = photos[0].getUrl( {'maxWidth': 400, 'maxHeight': 400} );     
    }

    var $urlCurrent = "//api.openweathermap.org/data/2.5/weather?lat="+pos.lat+"&lon="+pos.lng+"&appid=870352a402aa1a0d286c389219fa05ea";

    $.getJSON( $urlCurrent, function (data) {
      handleCurrentWeather( data );       
    });
  }  
} // end google places  

function handleCurrentWeather( data ) {
  
  var $town = data.name;
  var $country = data.sys.country;  

  var $celsius_min = Number( ( data.main.temp_min - 273.15 ).toFixed(1) );  
  var $celsius_max = Number( ( data.main.temp_max - 273.15 ).toFixed(1) );  

  var $description = data.weather[0].description;
  var $iconCode = data.weather[0].icon;

  //var $td = new Date();

  $location = $town + ", " + $country + "<br>";
  $date = $todayDate;
  $temperature = "Low( "+ $celsius_min + "°C )" + "High( " + $celsius_max + "°F ) <br>";
  $carousel = 
    "<div id='forecastCarousel' class='owl-carousel owl-theme'>" +
    "<div class='item hi'>" +
    "<span class='date'>" + $date + "</span>" +
    "<span class='min'>" + $celsius_min + "</span>" +
    "<span class='max'>" + $celsius_max + "</span>" +
    "<span class='iconCode'>" + $iconCode + "</span>" +
    moment( $date ).format('h a') + "<br>" +  
    "<img src='http://openweathermap.org/img/w/" + $iconCode +
    ".png' alt='Icon depicting current weather.'>" + "<br>" +
    $description +
    "</div>";

    var $urlForecast = "//api.openweathermap.org/data/2.5/forecast?lat="+pos.lat+"&lon="+pos.lng+"&appid=870352a402aa1a0d286c389219fa05ea";

    $.getJSON( $urlForecast, function (data) {
      handleForecastWeather( data );
    });
}

function handleForecastWeather( data ) {
   
  $.each( data.list, function( index, value ) {
    
    var $celsius_min = Number( ( value.main.temp_min - 273.15 ).toFixed(1) );  
    var $celsius_max = Number( ( value.main.temp_max - 273.15 ).toFixed(1) );  
    $carousel +=
                     "<div class='item low'>" +
                         "<span class='date'>" + value.dt_txt + "</span>" +
                         "<span class='min'>" + $celsius_min + "</span>" +
                         "<span class='max'>" + $celsius_max + "</span>" +
                         "<span class='iconCode'>" + value.weather[0].icon + "</span>" +
                         moment( value.dt_txt ).format('h a') +
                         "<img src='http://openweathermap.org/img/w/" + value.weather[0].icon + 
                              ".png' alt='Icon depicting current weather.'>" +
                         value.weather[0].description +   
                     "</div>"; 
    });
    $carousel += "</div>"; // end carousel

  buildInfoWin();
  initOwl();
}

function buildInfoWin() {

  infoWindow.setPosition( pos );
  infoWindow.setContent( "<div id='infoContent' >" + 
                           "<div class='pane'>" +
                             "<h3>" + $location + "</h3>" +
                             "<h4 id='date'>" + $date + "</h4>" + 
                             "<h6 id='temp'>" + $temperature + "</h6>" + 
                             "<a href='#' class='btn btn-primary' id='tempConvert' onclick='convertTemp();' role='button'>°C</a>" + 
                           "</div>" +
                           "<div class='pane'>" +
                              $carousel + 
                           "</div>" +
                           "<div id='placesPhoto' style='background-image: url(" + $localImg + ")' ></div>" +
                        "</div>"
                       );
  infoWindow.open( map );
  map.setCenter( pos );    
 
}

function initOwl() {
  
  $owl = $("#forecastCarousel");

  $owl.owlCarousel({
    loop: true,
    margin: 10,
    nav: true,
    center: true,
    dots: false,
/*  */
    onChanged: function (property) {
      var current = property.item.index;
      $(property.target).find(".owl-item").css({ "border": "none", "transform": "scale(1)"});
      $(property.target).find(".owl-item").eq(current).css({ "border": "3px black dashed", "transform": "scale(1.2)"});
      
      $date = $(property.target).find(".owl-item").eq(current).find(".date").html();
      $minTemp = $(property.target).find(".owl-item").eq(current).find(".min").html();
      $maxTemp = $(property.target).find(".owl-item").eq(current).find(".max").html();
      //var $iconCode = $(property.target).find(".owl-item").eq(current).find(".iconCode").html();

      $("#temp").html( "Low( "+ $minTemp + "°C )" + "High( " + $maxTemp + "°C ) <br>" );

      $("a#tempConvert").removeClass("f");
      $("a#tempConvert").html( "°F" );
        
      $formatDate = moment( $date ).format("dddd MMM Do YYYY");  
      $day = moment( $date ).format("dddd");
      $date = moment( $date ).format("MMM Do YYYY");  
      if ( $formatDate === $formatTodayDate ) {

        $("#date").html( "TODAY" + "<br>" + $date );
      } else {
        $("#date").html( $day + "<br>" + $date );
      }         
    },  
    responsive:{
      0:{
        items:1,
        nav: false
      },
      1000:{
        items:3
      }
    }   
  });  // end owl     
 
  var $btnPrev = $("#forecastCarousel .owl-nav .owl-prev");
  var $btnNext = $("#forecastCarousel .owl-nav .owl-next");

  $btnPrev.html("<img src='img/control-arrow.png'>");
  $btnNext.html("<img src='img/control-arrow.png'>");
}

function convertTemp() {

  var $fahrenheit_min = Number( ( $minTemp * 1.8 + 32 ).toFixed(1) );  
  var $fahrenheit_max = Number( ( $maxTemp * 1.8 + 32 ).toFixed(1) );   

  if( !$("a#tempConvert").hasClass("f") ) {
    
      $("#temp").html( "Low( "+ $fahrenheit_min+ "°F )" + "High( " + $fahrenheit_max + "°F ) <br>" );

     $("a#tempConvert").addClass("f").html( "°C" );
  } else {
    
      $("#temp").html( "Low( "+ $minTemp + "°C )" + "High( " + $maxTemp + "°C ) <br>" );
 
      $("a#tempConvert").removeClass("f").html( "°F" );
  } 
}