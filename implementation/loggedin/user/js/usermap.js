// mapboxgl used for map creation supplied by script file in html
var hotspots;

function map() {
    var center = [138.5995, -34.911];
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            hotspots = JSON.parse(xhttp.responseText);
            if (hotspots.length < 1) {
                alert('No Hotspots Classified');
                createmapwithmark(center, []);
            }
            else {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(create, showError);
                }
                else {
                    createmapwithmark(center, []);
                }
            }
        }
    };
    xhttp.open("GET", "/hotspotmap", true);
    xhttp.send();
}

function create(position) {
    var center = [position.coords.longitude, position.coords.latitude];
    createmapwithmark(center, center);
}

function showError(error) {
    var center = [138.5995, -34.911];
    createmapwithmark(center, []);
}

function createmapwithmark(center, current) {

    mapboxgl.accessToken = 'pk.eyJ1IjoibWtraGF0cmkwMzUiLCJhIjoiY2twaTQzM2hkMDUzcjJwcXlwMXdoNmFnZCJ9.QI9FGNYwPbi33vdiLyipfQ';
    var map = new mapboxgl.Map({
        container: 'map_markers_div',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: center,
        zoom: 9
    });
    if (current.length != 0) {
        new mapboxgl.Marker()
            .setLngLat(current)
            .setPopup(new mapboxgl.Popup().setHTML(`<h5>Current location</h5>`))
            .addTo(map);
    }
    for (var i in hotspots) {
        var el = document.createElement('DIV');
        el.className = 'marker';
        el.style.backgroundImage =
            'url(https://icons.iconarchive.com/icons/icons-land/vista-map-markers/48/Map-Marker-Bubble-Pink-icon.png)';
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.backgroundSize = '100%';
        new mapboxgl.Marker(el)
            .setLngLat([hotspots[i][0], hotspots[i][1]])
            .setPopup(new mapboxgl.Popup().setHTML(`<h5>${hotspots[i][2]}</h5>`))
            .addTo(map);
    }
}



function isalerted() {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var hotspot = xhttp.responseText;
            if (hotspot == 'No Hotspot Visits') {
                alert('You Have not been to any hotspot!!');
            }
            else {
                alert('You have been to hotspots shown in map!!!!!');
                hotspots = JSON.parse(hotspot);
                createmapwithmark([hotspots[0][0], hotspots[0][1]], []);
            }
        }
    };
    xhttp.open("GET", "/users/hotspotmap/myvisit", true);
    xhttp.send();
}
