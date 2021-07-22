// mapboxgl used for map creation supplied by script file in html
function sendcode() {
    var code = document.getElementById('checkincode').value;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert(xhttp.responseText);
        }
    };
    xhttp.open("POST", "/users/checkInVenue", true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify({ "code": code }));
}

function sendchcode(code) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert(xhttp.responseText);
        }
    };
    xhttp.open("POST", "/users/checkInVenue", true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify({ "code": code }));
}
/* for history show on map*/
var mapdata = [];

function gethistory() {
    var tbody = document.getElementById('history-wrapper');
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {

        if (this.readyState == 4 && this.status == 200) {

            if (this.responseText == 'No checkins') {
                var trr = document.createElement('TR');
                var tdd = document.createElement('TD');
                tdd.innerText = this.responseText;
                tdd.setAttribute('colspan', '4');
                tdd.style.textAlign = 'center';
                trr.appendChild(tdd);
                tbody.appendChild(trr);
            }
            else {
                var data = JSON.parse(this.responseText);
                for (var i in data) {
                    var tr = document.createElement('TR');
                    var td = [];
                    for (var j = 0; j < 4; ++j) {
                        td.push(document.createElement('TD'));
                    }

                    td[0].innerText = data[i]['S_No'];
                    td[1].innerText = data[i]['venue_type'];
                    td[2].innerText = data[i]['checkin_time'];
                    td[3].innerText = data[i]['flat_no'] + ', ' + data[i]['street_name'] + ', ' + data[i]['city'] + ', ' + data[i]['state'];
                    for (j = 0; j < 4; ++j) {
                        tr.appendChild(td[j]);
                    }
                    mapdata.push([data[i]['venue_longitude'], data[i]['venue_latitude'], data[i]['S_No']]);
                    tbody.appendChild(tr);
                }

            }
            checkinmap();
        }
    };
    xhttp.open("POST", "/users/checkInHistory ", true);
    xhttp.send();
}


/* for creation of checkin map where google is supplied by existing script in html file*/
function checkinmap() {
    var center = [138.5995, -34.911];
    if (mapdata.length == 0) {
        createmapwithmark(center, []);

    }
    else {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(create, showmError);
        }
        else {
            createmapwithmark(center, []);
        }
    }
}

function create(position) {
    var center = [position.coords.longitude, position.coords.latitude];
    createmapwithmark(center, center);
}

function showmError(error) {
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
    if (mapdata.length != 0) {
        for (var i in mapdata) {
            var el = document.createElement('DIV');
            el.className = 'marker';
            el.style.backgroundImage =
                'url(https://icons.iconarchive.com/icons/icons-land/vista-map-markers/48/Map-Marker-Bubble-Pink-icon.png)';
            el.style.width = '40px';
            el.style.height = '40px';
            el.style.backgroundSize = '100%';
            new mapboxgl.Marker(el)
                .setLngLat([mapdata[i][0], mapdata[i][1]])
                .setPopup(new mapboxgl.Popup().setHTML(`<h5>${mapdata[i][2]}</h5>`))
                .addTo(map);
        }
    }
    else {
        alert('No Checkins');
    }
}



function browserlocate() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(browsercheckin, showError);
    }
    else {
        alert("Geolocation is not supported by this browser");
    }
}


function browsercheckin(position) {

    var lat = position.coords.latitude;
    var longi = position.coords.longitude;
    var current = [longi, lat];
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var mapd = JSON.parse(this.responseText);
            if ('status' in mapd) {
                alert(mapd['status']);
            }

            else {

                document.getElementById('avail-checkins').style.display = "block";
                mapboxgl.accessToken = 'pk.eyJ1IjoibWtraGF0cmkwMzUiLCJhIjoiY2twaTQzM2hkMDUzcjJwcXlwMXdoNmFnZCJ9.QI9FGNYwPbi33vdiLyipfQ';
                var map = new mapboxgl.Map({
                    container: 'checkinmap',
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: current,
                    zoom: 9
                });

                new mapboxgl.Marker()
                    .setLngLat(current)
                    .setPopup(new mapboxgl.Popup().setHTML(`<h5>Current location</h5>`))
                    .addTo(map);


                for (var i in mapd) {
                    var el = document.createElement('DIV');
                    el.className = 'marker';
                    el.style.backgroundImage =
                        'url(https://icons.iconarchive.com/icons/icons-land/vista-map-markers/48/Map-Marker-Bubble-Pink-icon.png)';
                    el.style.width = '40px';
                    el.style.height = '40px';
                    el.style.backgroundSize = '100%';
                    new mapboxgl.Marker(el)
                        .setLngLat([mapd[i]['venue_longitude'], mapd[i]['venue_latitude']])
                        .setPopup(new mapboxgl.Popup().setHTML(`<h5>Venue Information</h5><div style="line-height:5px;"><p>Checkin code: ${mapd[i]['venue_id']}</p>
                        <p>Venue Owner: ${mapd[i]['give_name'] +' '+mapd[i]['last_name']}</p>
                        <p>Venue Date: ${mapd[i]['venue_date']}</p>
                        <p>Venue Address: ${mapd[i]['Address']}</p>
                        <p>Venue: ${mapd[i]['venue_type']}</p>
                        <button style="height:1.2em;" id='${mapd[i]['venue_id']}' onclick='sendchcode(this.id);'> Check-In Venue</button> </div>`))
                        .addTo(map);
                }

            }
        }
    };
    xhttp.open("POST", "/users/checkInVenuelocation", true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify({ "lati": lat, "longi": longi }));
}


function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred");
            break;
    }
}
