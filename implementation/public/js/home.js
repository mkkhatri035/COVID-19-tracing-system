// google variable used for google charts and supplied by google script
// mapboxgl use for map creation and supplid by script in html file

function loaddata() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            window.location.reload(true);
        }
    };
    xhttp.open("GET", "/load", true);
    xhttp.send();
}

function datasreport() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(xhttp.response);
            var total = data['cases'];
            var dead = data['deaths'];
            var recov = data['recovered'];
            document.querySelectorAll(".recovered h1")[1].innerHTML = recov;
            document.querySelectorAll(".total h1")[1].innerHTML = total;
            document.querySelectorAll(".deaths h1")[1].innerHTML = dead;
            document.querySelectorAll(".total p")[0].innerHTML = "+" + data['todayCases'];
            document.querySelectorAll(".deaths p")[0].innerText = "+" + data['todayDeaths'];

        }
    };
    xhttp.open("GET", "/cases", true);
    xhttp.send();
    setTimeout(180000, datasreport);
}


function noblur() {
    history.go(-1);
}


function addnewrow(item) {
    var table = document.getElementById("tab1");
    var row = document.createElement("TR");
    var cols = new Array();
    for (var i = 0; i < 6; ++i) {
        cols[i] = document.createElement("TD");
    }
    cols[0].innerHTML = item['administrative_area_level_2'];
    cols[1].innerHTML = item['confirmed'];
    cols[2].innerHTML = item['deaths'];
    cols[3].innerHTML = item['recovered'];
    cols[4].innerHTML = item['tests'];
    cols[5].innerHTML = item['vaccines'];
    for (i in cols) {
        row.append(cols[i]);
    }
    table.appendChild(row);

}

function covidcases() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(xhttp.response);
            if (data.length < 1) {
                loaddata();
            }
            else {
                for (var i in data) {
                    addnewrow(data[i]);
                }
            }
        }
    };
    xhttp.open("GET", "/statesdata", true);
    xhttp.send();

}

function newstategraph() {
    var select = document.getElementById('stategraph');

    function loading() {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                chartdata = JSON.parse(xhttp.response);
                if (chartdata.length <= 1) {
                    loaddata();
                }
                else {
                    google.charts.setOnLoadCallback(drawChart);
                }
            }
        };
        xhttp.open("GET", "/totalstatechart?state=" + encodeURIComponent(select.value), true);
        xhttp.send();
    }
    google.charts.load('current', { packages: ['corechart'] });

    var chartdata;
    loading();

    function drawChart() {
        var data = google.visualization.arrayToDataTable(chartdata);

        var options = {
            title: 'Cases around ' + select.value + ' with time',
            curveType: 'function',
            legend: { position: 'bottom' },
            height: 300,
            vAxis: {
                gridlines: { count: 10 }
            },
            hAxis: {
                title: 'Dates',
                gridlines: { interval: [1, 2, 3, 4, 5, 10], count: 5 }
            }
        };

        var chart = new google.visualization.LineChart(document.getElementById('state_chart'));

        chart.draw(data, options);
    }
}

function newvaccinesgraph() {
    var select = document.getElementById('vaccinegraph');

    function loading() {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                chartdata = JSON.parse(xhttp.response);
                if (chartdata.length <= 1) {
                    loaddata();
                }
                else {
                    google.charts.setOnLoadCallback(drawChart);
                }
            }
        };
        xhttp.open("GET", "/vaccinechart?state=" + encodeURIComponent(select.value), true);
        xhttp.send();
    }
    google.charts.load('current', { packages: ['corechart'] });

    var chartdata;
    loading();

    function drawChart() {
        var data = google.visualization.arrayToDataTable(chartdata);

        var options = {
            title: 'Vaccinated in ' + select.value + ' with time',
            curveType: 'function',
            legend: { position: 'bottom' },
            height: 300,
            vAxis: {
                gridlines: { count: 10 }
            },
            hAxis: {
                title: 'Dates',
                gridlines: { interval: [1, 2, 3, 4, 5, 10], count: 5 }
            }
        };

        var chart = new google.visualization.LineChart(document.getElementById('vaccine_chart'));

        chart.draw(data, options);
    }
}

var hotspots;

function map() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            hotspots = JSON.parse(xhttp.responseText);
            if (hotspots.length < 1) {
                alert('No Hotspots Classified');
                window.location.replace('/');
            }
            else {
                var center = [138.5995, -34.911];
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

    mapboxgl.accessToken = 'pk.eyJ1IjoibWtraGF0cmkwMzUiLCJhIjoiYQzM2hkMDUzcjJwcXlwMXdoNmFnZCJ9.9FGNYwPbi33vdiLyipfQ';
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


function covidgraph() {
    function loading() {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                chartdata = JSON.parse(xhttp.response);
                if (chartdata.length <= 1) {
                    loaddata();
                }
                else {
                    google.charts.setOnLoadCallback(drawChart);
                }
            }
        };
        xhttp.open("GET", "/totalchart", true);
        xhttp.send();
    }
    google.charts.load('current', { packages: ['corechart'] });

    var chartdata;
    loading();

    function drawChart() {
        var data = google.visualization.arrayToDataTable(chartdata);

        var options = {
            title: 'Cases around country with time',
            curveType: 'function',
            legend: { position: 'bottom' },
            height: 300,
            vAxis: {
                gridlines: { count: 10 }
            },
            hAxis: {
                title: 'Dates',
                gridlines: { interval: [1, 2, 3, 4, 5, 10], count: 5 }
            }
        };

        var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

        chart.draw(data, options);
    }
}

/* to load new graph for the  new data about the graph*/
function loadnew() {
    var chartdata;
    google.charts.load('current', { packages: ['corechart'] });
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            chartdata = JSON.parse(xhttp.response);
        }
    };
    xhttp.open("GET", "/charts", true);
    xhttp.send();

    function drawChart() {
        var data = google.visualization.arrayToDataTable(chartdata);

        var options = {
            title: 'Cases around country with time',
            curveType: 'function',
            legend: { position: 'bottom' },
            height: 300,
            vAxis: {
                gridlines: { count: 10 }
            },
            hAxis: {
                title: 'Dates',
                gridlines: { interval: [1, 2, 3, 4, 5, 10], count: 5 }
            }
        };

        var chart = new google.visualization.LineChart(document.getElementById('curve_chart'));

        chart.draw(data, options);
    }

}
