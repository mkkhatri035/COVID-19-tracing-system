var email;

function resend() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            alert(this.responseText);
        }
    };
    xhttp.open("POST", "/recoverforgot", true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify({ "login": email }));
}

function sendtoserver() {
    var loginoption = document.getElementById('loginoption');
    if (loginoption.value != '') {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                email = loginoption.value;
                document.getElementById('emailout').innerText = email;
                loginoption.placeholder = "Enter Recovery code";
                loginoption.value = '';
                document.getElementById('head').innerText = "Enter Recovery Code Sent on Mail";
                document.getElementById('btn-recover').innerText = "Validate";
                document.getElementById('btn-recover').removeEventListener('click', sendtoserver);
                document.getElementById('btn-recover').addEventListener('click', validate);
                var btnsend = document.createElement('button');
                btnsend.setAttribute('id', 'btn-resend');
                btnsend.innerText = "Resend Code";
                btnsend.addEventListener('click', resend);
                var main = document.getElementsByTagName('main')[0];
                main.appendChild(btnsend);
                var p = document.createElement('p');
                p.innerText = 'If your email exits on server then you might have got a recovery code....';
                p.style.marginLeft = "2em";

                main.appendChild(p);
                var inpass = document.createElement('input');
                inpass.setAttribute('type', 'password');
                inpass.placeholder = 'New password';
                inpass.setAttribute('class', 'passinput');
                main.appendChild(inpass);
                var inpass2 = document.createElement('input');
                inpass2.setAttribute('type', 'password');
                inpass2.setAttribute('class', 'passinput');
                inpass2.placeholder = "Re-enter New password";
                main.appendChild(inpass2);
            }
        };
        xhttp.open("POST", "/recoverforgot", true);
        xhttp.setRequestHeader('Content-type', 'application/json');
        xhttp.send(JSON.stringify({ "login": loginoption.value }));


    }
    else {
        alert('enter correct email/username');
    }
}

function validate() {
    var code = document.getElementById('loginoption').value;
    if (code.value != '') {
        var pas = document.getElementsByClassName('passinput')[0].value;
        var repas = document.getElementsByClassName('passinput')[0].value;
        if (pas == repas && pas != '') {
            var xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    alert(this.responseText);
                    window.location.replace('/login.html');
                }
                else if (this.readyState == 4 && this.status == 401) {
                    alert(this.responseText);
                }
            };
            xhttp.open("POST", "/codevalidate", true);
            xhttp.setRequestHeader('Content-type', 'application/json');
            xhttp.send(JSON.stringify({ "email": email, "code": code, "passs": pas }));
        }
        else {
            alert('Password Mismatch');
        }
    }
    else {
        alert('enter code correctly');
    }
}
