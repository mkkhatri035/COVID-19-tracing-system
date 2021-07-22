function signn() {
    var uname = document.getElementById('username-input');
    var pass = document.getElementById('password-input');
    if (uname.value == '' && pass.value == '') {
        alert('enter all the values');
        return;
    }

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert('logged in successfully');
            setadmininfo();
            window.location.replace('/');
        }
        else if (this.readyState == 4 && this.status == 401 || this.status == 403) {
            alert(xhttp.responseText);
        }
    };
    xhttp.open("POST", "/admin/adminlogin", true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify({ "user": uname.value, "password": pass.value }));
}

function setadmininfo() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            window.location.replace('/');
        }
    };
    xhttp.open("POST", "/admin/admininfo", true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send();
}

function onSignIn(googleUser) {
    // var profile = googleUser.getBasicProfile();

    var id_token = googleUser.getAuthResponse().id_token;

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            setadmininfo();
        }
        else if (this.readyState == 4 && this.status == 401 || this.status == 403) {
            alert(this.responseText);
        }
    };
    xhr.open('POST', '/admin/tokensignin');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ 'idtoken': id_token }));

}
