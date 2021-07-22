function checkindetails(venue) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var d = JSON.parse(xhttp.responseText);
            if (d.length == 0) {
                alert('NO Check-Ins So Far');
                unpop();
            }
            else {
                var doc = document.getElementById('checkin-content');
                doc.innerHTML = '';
                for (var i in d) {
                    var tr = document.createElement('TR');
                    var td;
                    for (var j in d[i]) {
                        td = document.createElement('TD');
                        td.innerText = d[i][j];
                        tr.appendChild(td);
                    }
                    doc.appendChild(tr);
                }
            }
        }
    };
    xhttp.open("POST", "/venueowner/checkininfo", true);
    xhttp.setRequestHeader('Content-type', "application/json");
    xhttp.send(JSON.stringify({ "venue": venue }));
}


function pop() {
    checkindetails(this.id.replace('u-', ''));
    var main = document.getElementsByTagName('main')[0];
    main.style.filter = 'blur(50px)';
    main.style.opacity = 0;
    var po = document.getElementById('popup');
    po.style.display = 'block';


}

function unpop() {
    var main = document.getElementsByTagName('main')[0];
    main.style.opacity = 1;
    main.style.filter = 'blur(0)';
    document.getElementById('popup').style.display = 'none';
}

function createvenue() {
    var main = document.getElementById('venue-wrapper');
    main.style.opacity = 0;
    var po = document.getElementById('popup');
    po.style.display = 'block';
}

function closeinfo() {
    var main = document.getElementById('venue-wrapper');
    main.style.opacity = 1;
    document.getElementById('popup').style.display = 'none';
}

function editvenu() {
    var venue = this.id.replace('d-', '');
    createvenue();
    var data = {
        venue_type: document.getElementById('venue_type'),
        venue_date: document.getElementById('venue_date'),
        flat_no: document.getElementById('flat_no'),
        street_name: document.getElementById('street'),
        city: document.getElementById('city'),
        state: document.getElementById('state'),
        venue_latitude: document.getElementById('venue_latitude'),
        venue_longitude: document.getElementById('venue_longitude'),
        send: document.getElementById('sending')
    };
    data.send.innerText = "Update";
    data.send.setAttribute('class', "v-" + venue);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var d = JSON.parse(xhttp.responseText);

            for (var i in d[0]) {
                var as = d[0][i];
                if (i == 'venue_date') {
                    as = as.replace('Z', '');
                }
                data[i].value = as;
            }
        }
    };
    xhttp.open("POST", "/venueowner/Venueinfo", true);
    xhttp.setRequestHeader('Content-type', "application/json");
    xhttp.send(JSON.stringify({ "venue": venue }));
}

function getvenues() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText == 'NO Venues to Show') {
                alert(xhttp.responseText);
                showvhistory([]);
            }
            else {
                showvhistory(JSON.parse(this.responseText));
            }
        }
    };
    xhttp.open("POST", "/venueowner/Venueinfo", true);
    xhttp.send();
}

function showvhistory(venues) {

    var wrapper = document.getElementById('venue-wrapper');
    if (venues.length != 0) {

        for (var i in venues) {
            var div = document.createElement('div');
            div.setAttribute('class', 'cover');
            div.setAttribute('id', 'u-' + venues[i]['venue_id']);
            div.setAttribute('title', 'click to know details');
            div.addEventListener('click', pop);

            for (var j in venues[i]) {
                var p = document.createElement('p');
                var data = venues[i][j];
                p.innerText = data;
                p.style.lineHeight = '1em';
                div.appendChild(p);
            }
            wrapper.appendChild(div);
        }
    }
    else {
        wrapper.innerText = "Nothing to show";
        wrapper.style.textAlign = "center";
    }
}

function vendelete() {
    var venue = this.id.replace('i-', '');
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert('Successfully Deleted Venue');
            window.location.reload(true);
        }
    };
    xhttp.open("POST", "/venueowner/deleteven", true);
    xhttp.setRequestHeader('Content-type', "application/json");
    xhttp.send(JSON.stringify({ "venue": venue }));
}

function showvenues() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText == 'NO Venues to Show') {
                showven([]);
            }
            else {
                showven(JSON.parse(this.responseText));
            }
        }
    };
    xhttp.open("POST", "/venueowner/Venueinfo", true);
    xhttp.send();
}

function showven(venues) {
    var wrapper = document.getElementById('venue-wrapper');
    if (venues.length != 0) {
        for (var i in venues) {
            var div = document.createElement('div');
            div.setAttribute('id', 'd-' + venues[i]['venue_id']);
            div.setAttribute('class', 'cover');
            div.setAttribute('title', 'click to edit');
            div.addEventListener('click', editvenu);

            var div2 = document.createElement('div');
            var img = document.createElement('img');
            img.setAttribute('src', 'https://qrickit.com/api/qr.php?d=https://ide-5bc262e5cd0f40bf9d411af2edd8f2e1-8080.cs50.ws/users/checkInVenue/' + venues[i]['venue_id'] + '&addtext=Venue+QR+Code&txtcolor=000000&fgdcolor=000000&bgdcolor=ffffff&qrsize=550&t=p&e=m');
            img.setAttribute('class', 'qrc');
            img.setAttribute('alt', 'QR code of the Venue');

            var it = document.createElement('i');
            it.setAttribute('id', 'i-' + venues[i]['venue_id']);
            it.setAttribute('class', 'fas fa-times');
            it.setAttribute('style', 'float:right; cursor:pointer; font-size:2.5em;');
            it.setAttribute('title', 'Delete Venue');
            it.addEventListener('click', vendelete);
            div2.appendChild(img);
            div2.appendChild(it);
            div.appendChild(div2);
            div.appendChild(document.createElement('hr'));
            for (var j in venues[i]) {
                var p = document.createElement('p');
                var data = venues[i][j];
                p.innerText = data;
                p.style.lineHeight = '1em';
                div.appendChild(p);
            }
            var div3 = document.createElement('div');
            div3.style.textAlign = 'left';
            it = document.createElement('i');
            it.setAttribute('class', 'fas fa-pencil-alt');
            it.setAttribute('style', 'cursor:pointer; font-size:2em;');
            it.setAttribute('title', 'Edit Venue');
            div3.appendChild(it);
            div.appendChild(div3);
            wrapper.appendChild(div);
        }
    }

    else {
        var div1 = document.createElement('div');
        div1.setAttribute('class', 'cover');
        div1.setAttribute('title', 'Nothing to Show');
        var span = document.createElement('SPAN');
        span.innerText = "No Venues Created";

        div1.appendChild(span);
        div1.style.textAlign = "center";
        div1.style.paddingTop = "40%";
        wrapper.appendChild(div1);
    }

}



function resetcr() {
    var data = {
        vtype: document.getElementById('venue_type'),
        vdate: document.getElementById('venue_date'),
        vflat: document.getElementById('flat_no'),
        vcity: document.getElementById('city'),
        vstreet: document.getElementById('street'),
        vstate: document.getElementById('state'),
        vlat: document.getElementById('venue_latitude'),
        vlon: document.getElementById('venue_longitude')
    };
    for (var i in data) {
        data[i].value = '';
    }
}

function confirmcr() {
    var check = confirm('Create Venue with Specified Details');
    if (check == true) {
        var data = {
            vtype: document.getElementById('venue_type').value,
            vdate: document.getElementById('venue_date').value,
            vflat: document.getElementById('flat_no').value,
            vcity: document.getElementById('city').value,
            vstreet: document.getElementById('street').value,
            vstate: document.getElementById('state').value,
            vlat: document.getElementById('venue_latitude').value,
            vlon: document.getElementById('venue_longitude').value,
            send: document.getElementById('sending')
        };
        var flag = 0;
        for (var i in data) {
            if (data[i] == '') {
                flag = 1;
            }
        }
        if (flag == 0) {
            var xhttp = new XMLHttpRequest();
            if (data.send.innerText == "Update") {
                data['venue_id'] = data.send.getAttribute('class').replace('v-', '');
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        resetcr();
                        alert('Successfully Updated Venue');
                        window.location.reload(true);
                    }
                };
                xhttp.open("POST", "/venueowner/updatevenue", true);
                xhttp.setRequestHeader('Content-type', 'application/json');
                xhttp.send(JSON.stringify(data));
            }
            else {
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        resetcr();
                        alert('Successfully Created Venue');
                        window.location.reload(true);
                    }
                };
                xhttp.open("POST", "/venueowner/createvenue", true);
                xhttp.setRequestHeader('Content-type', 'application/json');
                xhttp.send(JSON.stringify(data));
            }
        }
        else {
            alert('enter correct values');
        }
    }

}
