var app = new Vue({
    'el': '#app',
    data: {
        give_name: 'First',
        last_name: 'Last',
        gender: '',
        phone_numbe: '',
        email: '',
        username: 'Username',
        flat_no: '',
        street_name: '',
        city: '',
        state: '',
        admin: {
            give_name: '',
            last_name: '',
            gender: '',
            phone_numbe: '',
            email: '',
            username: '',
            password: '',
            flat_no: '',
            street_name: '',
            city: '',
            state: '',
        }
    }
});

function admininfofetch() {

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var data = JSON.parse(this.responseText);

            for (var i in data[0]) {
                app._data[i] = data[0][i];
            }
        }
    };
    xhttp.open("POST", "/admin/admininfo", true);
    xhttp.send();

}

function createadmin() {
    if (app.admin.give_name != '' || app.admin.last_name != '' || app.admin.username != '' || app.admin.email != '' || app.admin.phone_numbe != '' || app.admin.flat_no != '' || app.admin.street_name != '' || app.admin.city != '' || app.admin.state != '' || app.admin.password != '' || app.admin.gender != '') {
        create();
    }
    else {
        alert('Enter All the details');
    }
}

function create() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert(this.responseText);
            if (this.responseText == 'Successfully Signed Up As Admin') {
                window.location.reload(true);
            }
        }
    };
    xhttp.open("POST", "/admin/createadmin", true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(app.admin));
}
