function firstload() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var checkins = JSON.parse(this.responseText);
            var output = `<h3>Recent User checkins</h3> `;
            for (var i = 0; i < checkins.length; i++) {
                output += ` <div class="recenter">User <span><b> ${checkins[i].User} </b></span> from <span><b>${checkins[i].Address}</b></span> checked-In to Venue <span><b>${checkins[i].venue}</b></span> at <span><b>${checkins[i].checkin_time}</b></span></div>`;
            }

            document.getElementById("firstdata").innerHTML = output;
        }
    };

    xmlhttp.open("GET", "/admin/viewuCheckins", true);
    xmlhttp.send();
}

function userspecific(search) {
    var input = document.getElementById('uvinsearch');
    if (input.value != '') {
        var xmlhttp = new XMLHttpRequest();
        if (search.title == "Search user") {
            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var checkins = JSON.parse(this.responseText);
                    if (checkins.length != 0) {
                        var output = `<h3>Recent User checkins</h3> `;
                        for (var i = 0; i < checkins.length; i++) {
                            output += ` <div class="recenter">User <span><b> ${checkins[i].User} </b></span> from <span><b>${checkins[i].Address}</b></span> checked-In to Venue <span><b>${checkins[i].venue}</b></span> at <span><b>${checkins[i].checkin_time}</b></span></div>`;
                        }
                        document.getElementById("firstdata").innerHTML = output;
                    }
                    else {
                        document.getElementById("firstdata").innerHTML = "NO user Matched";
                    }
                }
            };

            xmlhttp.open("POST", "/admin/viewuCh", true);
            xmlhttp.setRequestHeader('Content-type', 'application/json');
            xmlhttp.send(JSON.stringify({ "inputs": input.value }));
        }
        else {
            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var checkins = JSON.parse(this.responseText);
                    if (checkins.length != 0) {
                        var output = `<h3>Recent Venue Checkins</h3>`;
                        for (var i = 0; i < checkins.length; i++) {
                            output += `<div class="recenter"> Venue <span><b> ${checkins[i].venue}</b></span> Got User <span><b>${checkins[i].User}</b></span> checked In at <span><b>${checkins[i].checkin_time}</b></span></div>`;
                        }

                        document.getElementById("seconddata").innerHTML = output;
                    }
                    else {
                        document.getElementById("seconddata").innerHTML = "No Venue Matched";
                    }
                }
            };

            xmlhttp.open("POST", "/admin/viewvCh", true);
            xmlhttp.setRequestHeader('Content-type', 'application/json');
            xmlhttp.send(JSON.stringify({ 'inputs': input.value }));
        }
    }
}

function uactive() {
    document.getElementById("seconddata").style.display = 'none';
    document.getElementById('ftab').style.backgroundColor = "#eee9e9";
    document.getElementById("uvinsearch").placeholder = "Search By User Name";
    document.getElementById('uvsearch').title = "Search user";
    document.getElementById('stab').style.backgroundColor = "#80a1aa";
    var u = document.getElementById('firstdata');
    u.style.display = "block";
    firstload();

}



function vactive() {
    document.getElementById("firstdata").style.display = 'none';
    document.getElementById('stab').style.backgroundColor = "#eee9e9";
    document.getElementById("uvinsearch").placeholder = "Search By Venue";
    document.getElementById('uvsearch').title = "Search venue";
    document.getElementById('ftab').style.backgroundColor = "#80a1aa";
    var u = document.getElementById('seconddata');
    u.style.display = "block";
    viewVenue();
}


function viewVenue() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var checkins = JSON.parse(this.responseText);
            var output = `<h3>Recent Venue Checkins</h3>`;
            for (var i = 0; i < checkins.length; i++) {
                output += `<div class="recenter"> Venue <span><b> ${checkins[i].venue}</b></span> Got User <span><b>${checkins[i].User}</b></span> checked In at <span><b>${checkins[i].checkin_time}</b></span></div>`;
            }

            document.getElementById("seconddata").innerHTML = output;
        }
    };

    xmlhttp.open("GET", "/admin/viewvCheckins", true);
    xmlhttp.send();
}
