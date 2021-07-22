function islogin() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if (xhttp.response != 'false') {
                var data=JSON.parse(xhttp.responseText);
                document.getElementById('l-menu').innerHTML=data['left'];
                document.getElementsByClassName('r-menu')[0].innerHTML = data['right'];
            }
        }
    };
    xhttp.open("POST", "/logincheck", true);
    xhttp.send();
}
