function deleteu() {
    var user = this.id.replace('u-', '');
    var conf = confirm('Want to delete this user ' + user);

    if (conf) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                alert('user deleted successfully');
            }
        };
        xhttp.open("POST", "/admin/udelete", true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send(JSON.stringify({ "user": user }));
    }
}

function deletevo() {
    var vo = this.id.replace('vo-', '');
    var conf = confirm('Want to delete this Venueowner ' + vo);
    if (conf) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                alert('user deleted successfully');
            }
        };
        xhttp.open("POST", "/admin/vodelete", true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send(JSON.stringify({ "user": vo }));
    }
}

function deleteven() {
    var ven = this.id.replace('ven-', '');
    var conf = confirm('Want to delete this Venue ' + ven);
    if (conf) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                alert('user deleted successfully');
            }
        };
        xhttp.open("POST", "/admin/vendelete", true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send(JSON.stringify({ "venue": ven }));
    }
}

function firstload() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var users = JSON.parse(this.responseText);
            var doc = document.getElementById("content1");
            doc.innerHTML = '';
            for (var i in users) {
                let o = document.createElement('tr');
                o.setAttribute('class', 'recenter');
                for (var j in users[i]) {
                    var span = document.createElement('td');
                    span.innerText = users[i][j];
                    o.appendChild(span);
                }
                var it = document.createElement('i');
                it.setAttribute('class', 'fas fa-times');
                it.setAttribute('title', "Delete");
                it.setAttribute('id', 'u-' + users[i]['user_id']);
                it.addEventListener('click', deleteu);
                it.setAttribute('style', 'cursor:pointer;font-size:20px; color:red; float:right; padding-right:15px;');
                o.appendChild(it);

                doc.appendChild(o);
            }
        }
    };
    xmlhttp.open("GET", "/admin/ulist", true);
    xmlhttp.send();

}

function VenueOwnerM() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var VenueOwners = JSON.parse(this.responseText);
            var doc = document.getElementById("content2");
            doc.innerHTML = '';
            if (VenueOwners.length == 0) {
                var o = document.createElement('tr');
                o.setAttribute('class', 'recenter');
            }
            else {

                for (var i in VenueOwners) {
                    var oi = document.createElement('tr');
                    oi.setAttribute('class', 'recenter');
                    for (var j in VenueOwners[i]) {
                        var span = document.createElement('td');
                        span.innerText = VenueOwners[i][j];
                        oi.appendChild(span);
                    }
                    var it = document.createElement('i');
                    it.setAttribute('class', 'fas fa-times');
                    it.setAttribute('title', "Delete");
                    it.setAttribute('id', 'vo-' + VenueOwners[i]['Owner']);
                    it.addEventListener('click', deletevo);
                    it.setAttribute('style', 'cursor:pointer;font-size:20px; color:red; float:right; padding-right:15px;');
                    oi.appendChild(it);
                    doc.appendChild(oi);
                }
            }
        }
    };
    xmlhttp.open("GET", "/admin/volist", true);
    xmlhttp.send();

}

function VenueM() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var Venues = JSON.parse(this.responseText);
            var doc = document.getElementById("content3");
            doc.innerHTML = '';
            for (var i in Venues) {
                let o = document.createElement('tr');
                o.setAttribute('class', 'recenter');
                for (var j in Venues[i]) {
                    var span = document.createElement('td');
                    span.innerText = Venues[i][j];
                    o.appendChild(span);
                }
                var it = document.createElement('i');
                it.setAttribute('class', 'fas fa-times');
                it.setAttribute('title', "Delete");
                it.setAttribute('id', 'ven-' + Venues[i]['venue_id']);
                it.addEventListener('click', deleteven);
                it.setAttribute('style', 'cursor:pointer;font-size:20px; color:red; float:right; padding-right:15px;');
                o.appendChild(it);
                doc.appendChild(o);
            }
        }
    };
    xmlhttp.open("GET", "/admin/vlist", true);
    xmlhttp.send();

}

function uactive() {
    document.getElementById("seconddata").style.display = 'none';
    document.getElementById("thirddata").style.display = 'none';
    document.getElementById("uvinsearch").placeholder = "Search By User Name";
    document.getElementById('uvsearch').title = "Search user";
    document.getElementById('ftab').style.backgroundColor = "#eee9e9";
    document.getElementById('stab').style.backgroundColor = "#80a1aa";
    document.getElementById('ttab').style.backgroundColor = "#80a1aa";
    var u = document.getElementById('firstdata');
    u.style.display = "block";
    firstload();

}


function vactive() {
    document.getElementById("firstdata").style.display = 'none';
    document.getElementById("thirddata").style.display = 'none';
    document.getElementById("uvinsearch").placeholder = "Search By Venue Owner Name";
    document.getElementById('uvsearch').title = "Search Venue Owner";
    document.getElementById('stab').style.backgroundColor = "#eee9e9";
    document.getElementById('ftab').style.backgroundColor = "#80a1aa";
    document.getElementById('ttab').style.backgroundColor = "#80a1aa";
    var u = document.getElementById('seconddata');
    u.style.display = "block";
    VenueOwnerM();
}


function veactive() {
    document.getElementById("firstdata").style.display = 'none';
    document.getElementById("seconddata").style.display = 'none';
    document.getElementById("uvinsearch").placeholder = "Search By Venue Name";
    document.getElementById('uvsearch').title = "Search Venue";
    document.getElementById('ttab').style.backgroundColor = "#eee9e9";
    document.getElementById('ftab').style.backgroundColor = "#80a1aa";
    document.getElementById('stab').style.backgroundColor = "#80a1aa";
    var u = document.getElementById('thirddata');
    u.style.display = "block";
    VenueM();
}

function userspecific(search) {
    var input = document.getElementById('uvinsearch');
    if (input.value != '') {
        var xmlhttp = new XMLHttpRequest();
        if (search.title == "Search user") {
            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var users = JSON.parse(this.responseText);
                    var doc = document.getElementById("content1");
                    doc.innerHTML = '';
                    if (users.length == 0) {
                        doc.innerText = "NO Users To Show";
                    }
                    else {
                        for (var i in users) {
                            let o = document.createElement('tr');
                            o.setAttribute('class', 'recenter');
                            for (var j in users[i]) {
                                var span = document.createElement('td');
                                span.innerText = users[i][j];
                                o.appendChild(span);
                            }
                            var it = document.createElement('i');
                            it.setAttribute('class', 'fas fa-times');
                            it.setAttribute('title', "Delete");
                            it.setAttribute('id', 'u-' + users[i]['user_id']);
                            it.addEventListener('click', deleteu);
                            it.setAttribute('style', 'cursor:pointer;font-size:20px; color:red; float:right; padding-right:15px;');
                            o.appendChild(it);
                            doc.appendChild(o);
                        }
                    }
                }
            };
            xmlhttp.open("POST", "/admin/usplist", true);
            xmlhttp.setRequestHeader('Content-type', "application/json");
            xmlhttp.send(JSON.stringify({ "inputs": input.value }));

        }
        else if (search.title == "Search Venue Owner") {

            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var VenueOwners = JSON.parse(this.responseText);
                    var doc = document.getElementById("content2");
                    doc.innerHTML = '';
                    if (VenueOwners.length == 0) {
                        var o = document.createElement('tr');
                        o.setAttribute('class', 'recenter');
                        o.innerText = "NO Venue Owner To Show";
                        doc.appendChild(o);
                    }
                    else {

                        for (var i in VenueOwners) {
                            var oi = document.createElement('tr');
                            oi.setAttribute('class', 'recenter');
                            for (var j in VenueOwners[i]) {
                                var span = document.createElement('td');
                                span.innerText = VenueOwners[i][j];
                                oi.appendChild(span);
                            }
                            var it = document.createElement('i');
                            it.setAttribute('class', 'fas fa-times');
                            it.setAttribute('title', "Delete");
                            it.setAttribute('id', 'vo-' + VenueOwners[i]['Owner']);
                            it.addEventListener('click', deletevo);
                            it.setAttribute('style', 'cursor:pointer;font-size:20px; color:red; float:right; padding-right:15px;');
                            oi.appendChild(it);
                            doc.appendChild(oi);
                        }
                    }
                }
            };
            xmlhttp.open("POST", "/admin/vosplist", true);
            xmlhttp.setRequestHeader('Content-type', "application/json");
            xmlhttp.send(JSON.stringify({ "inputs": input.value }));
        }
        else {

            xmlhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var Venues = JSON.parse(this.responseText);
                    var doc = document.getElementById("content3");
                    doc.innerHTML = '';
                    if (Venues.length == 0) {
                        doc.innerText = "NO Venues To Show";
                    }
                    else {
                        for (var i in Venues) {
                            let o = document.createElement('tr');
                            o.setAttribute('class', 'recenter');
                            for (var j in Venues[i]) {
                                var span = document.createElement('td');
                                span.innerText = Venues[i][j];
                                o.appendChild(span);
                            }
                            var it = document.createElement('i');
                            it.setAttribute('class', 'fas fa-times');
                            it.setAttribute('title', "Delete");
                            it.setAttribute('id', 'ven-' + Venues[i]['venue_id']);
                            it.addEventListener('click', deleteven);
                            it.setAttribute('style', 'cursor:pointer;font-size:20px; color:red; float:right; padding-right:15px;');
                            o.appendChild(it);
                            doc.appendChild(o);
                        }
                    }
                }
            };
            xmlhttp.open("POST", "/admin/vsplist", true);
            xmlhttp.setRequestHeader('Content-type', "application/json");
            xmlhttp.send(JSON.stringify({ "inputs": input.value }));

        }
    }
    else {
        if (search.title == "Search user") {
            firstload();
        }
        else if (search.title == "Search Venue Owner") {
            VenueOwnerM();
        }
        else {
            VenueM();
        }
    }
}
