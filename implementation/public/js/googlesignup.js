var app = new Vue({
    el: "#signupapp",
    data: {
        utype: 'None',
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: '',
        phoneno: '',
        gender: '',
        flat_no: '',
        street: '',
        city: '',
        state: ''
    }
});


function userdetails() {
    document.getElementById("basic").style.display = 'None';
    document.getElementById("logindet").style.display = 'block';
}

function checkdetails() {
    if (app.firstname != '' && app.lastname != '' && app.gender != '') {
        userdetails();
    }
    else {
        alert('Enter all the details correctly');
        return;
    }
}

function SignUp() {

    document.getElementsByTagName("main")[0].style.height = "120vh";
    document.getElementsByClassName("blurr")[0].style.height = "132vh";
    document.getElementById("type").style.display = 'None';
    document.getElementById("basic").style.display = 'block';
}

function SendNew() {
    var renter = document.getElementById('password-reinput').value;
    if (app.username != '' && app.email != ' ' && app.password != '' && app.phoneno != '') {
        if (renter == app.password) {

            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    alert(xhttp.response);
                    if (xhttp.responseText == 'Successfully Signed Up As Venue Owner' || xhttp.responseText == 'Successfully Signed Up As User') {
                        window.location.replace('/login.html');
                    }
                }
            };
            xhttp.open("POST", "/signup", true);
            xhttp.setRequestHeader('Content-type', 'application/json');

            xhttp.send(JSON.stringify(app._data));
        }
        else {
            alert('password does not match');
        }
    }
    else {
        alert('enter all details correctly');
    }
}

function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    app.email = profile.getEmail();
    var id_token = googleUser.getAuthResponse().id_token;

}
