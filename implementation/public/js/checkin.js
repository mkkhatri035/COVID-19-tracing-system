function checkin() {
    var ccode = this.id.replace('b-', '');
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if (xhttp.response != 'false') {
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        alert('successfully Checked In');
                    }
                };
                xmlhttp.open("POST", "/users/checkInVenue", true);
                xmlhttp.setRequestHeader('Content-type', 'application/json');
                xmlhttp.send(JSON.stringify({ 'code': ccode }));
            }
            else {
                alert('Please Login To the system First');
                window.location.replace('/login.html');
            }
        }
    };
    xhttp.open("POST", "/logincheck", true);
    xhttp.send();
}


function getcheckins() {
    var top = 50;
    var start = 1 * top - 50;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var d = JSON.parse(this.responseText);
            if (d.length == 0) {
                alert('No Available Venues');
                window.location.replace('/');
            }
            var maincont = document.getElementsByClassName('checkins')[0];
            for (var i in d) {
                var outerdiv = document.createElement('DIV');
                outerdiv.setAttribute('class', 'element');
                var container = document.createElement('DIV');
                var img = document.createElement('IMG');
                img.setAttribute('class', "qrcode");
                img.setAttribute('src', 'https://qrickit.com/api/qr.php?d=https://ide-5bc262e5cd0f40bf9d411af2edd8f2e1-8080.cs50.ws/users/checkInVenue/' + d[i]['Check-in code'] + '&addtext=Venue+QR+Code&txtcolor=000000&fgdcolor=000000&bgdcolor=ffffff&qrsize=450&t=p&e=m');
                img.setAttribute('alt', 'QR Code for Check-In');
                container.appendChild(img);
                var innerdiv = document.createElement('DIV');
                var p;
                for (var j in (d[i])) {
                    p = document.createElement('P');
                    p.innerHTML = j + ': ' + d[i][j];
                    innerdiv.appendChild(p);
                }
                var button = document.createElement('BUTTON');
                button.setAttribute('class', 'chbtn');
                button.innerHTML = "Check-In";
                button.setAttribute('id', 'b-' + d[i]['Check-in code']);
                button.addEventListener('click', checkin);
                innerdiv.appendChild(button);
                container.appendChild(innerdiv);
                outerdiv.appendChild(container);
                maincont.appendChild(outerdiv);
            }
        }
    };
    xhttp.open("POST", "/allavailcheckins", true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify({ "listno": top, "start": start }));
}
