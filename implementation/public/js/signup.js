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
    if (app.firstname != '' && app.lastname != '' && app.gender != '' && app.flat_no != '' && app.street != '' && app.city != '' && app.state != '') {
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
    if (app.username != '' && app.email != '' && app.password != '' && app.phoneno != '') {
        if (app.phoneno.length > 9 && app.phoneno.length < 13) {
            if (renter == app.password) {

                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        alert(xhttp.response);
                        if (xhttp.responseText == 'Successfully Signed Up As Venue Owner' || xhttp.responseText == 'Successfully Signed Up As User') {
                            window.location.replace('/login.html');
                        }
                    }
                    else if (this.readyState == 4 && this.status == 500) {
                        alert("Try again later with correct details");
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
            alert('enter correct mobile number');
        }
    }
    else {
        alert('enter all details correctly');
    }
}
