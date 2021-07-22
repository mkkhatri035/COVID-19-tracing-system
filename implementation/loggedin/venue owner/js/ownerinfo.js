var app = new Vue({
    'el': '#app',
    data: {
        give_name: 'Name',
        last_name: 'Name',
        gender: '',
        phone_numbe: '',
        email: '',
        username: 'Username',
        flat_no: '',
        street_name: '',
        city: '',
        state: '',
        update: {
            gname: 'First Name',
            lname: 'Last Name',
            uname: 'UserName',
            email: 'email',
            phno: '',
            password: 'password',
            oldpass: '',
            flat_no: '',
            street: '',
            state: '',
            city: ''
        }
    },
    computed: {
        address: function() {
            return this.flat_no + ' ' + this.street_name + ' ' + this.city + ' ' + this.state;
        }
    }
});

function uinfofetch() {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);

            for (var i in data[0]) {
                app._data[i] = data[0][i];
            }

            app.update['gname'] = data[0]['give_name'];
            app.update['lname'] = data[0]['last_name'];
            app.update['uname'] = data[0]['username'];
            app.update['email'] = data[0]['email'];
            app.update['phno'] = data[0]['phone_numbe'];
            app.update['flat_no'] = data[0]['flat_no'];
            app.update['street'] = data[0]['street_name'];
            app.update['city'] = data[0]['city'];
            app.update['state'] = data[0]['state'];
        }
    };
    xhttp.open("POST", "/venueowner/ownerinfo", true);
    xhttp.send();

}

function changeinput() {
    var inpu = document.getElementsByClassName('indet');
    for (var i in inpu) { inpu[i].disabled = !inpu[i].disabled; }
}

function update() {
    if (app.update.gname != app.give_name || app.update.lname != app.last_name || app.update.uname != app.username || app.update.email != app.email || app.update.phno != app.phone_numbe || app.update.flat_no != app.flat_no || app.update.street != app.street_name || app.update.city != app.city || app.update.state != app.state || app.update.password != 'password') {
        document.getElementById('details').style.visibility = 'hidden';
        changeinput();
        document.getElementById("confirm").style.display = "block";
    }
}

function updatedet() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert('successfully updated profile');
            window.location.reload(true);
        }
        else if (this.readyState == 4 && this.status == 403) {
            alert('wrong password');
        }
        else if (this.readyState == 4 && this.status == 401) {
            alert(this.responseText);
            window.location.reload(true);
        }
    };
    xhttp.open("POST", "/venueowner/update", true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(app.update));
}
