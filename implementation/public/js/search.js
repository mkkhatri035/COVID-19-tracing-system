var nn = window.location.search;
var qu = nn.split('=')[1];
if (qu != '' && qu != undefined) {
    searchfor(qu);
}

function searchfor(query) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

            var data = JSON.parse(this.responseText);
            var wrapp = document.getElementById('searchresult');
            wrapp.innerHTML = '';
            var heading = document.createElement('h1');
            var span = document.createElement('span');
            span.setAttribute('id', 'queried');
            heading.innerText = "Search Result for ";
            heading.style.padding = "0.5em";
            span.innerText = query;
            heading.appendChild(span);
            wrapp.appendChild(heading);

            if (data.length != 0) {
                data.forEach(item => {
                    var div = document.createElement('div');
                    div.setAttribute('class', 'res-wrapper');
                    var h = document.createElement('h3');
                    var a = document.createElement('a');
                    a.innerText = item['head'];
                    a.setAttribute('href', item['url']);
                    h.appendChild(a);
                    div.appendChild(h);
                    var p = document.createElement('p');
                    p.innerText = item['url'];
                    p.setAttribute('class', 'slink');
                    div.appendChild(p);
                    var p2 = document.createElement('p');
                    p2.innerText = item['describe'];
                    p2.setAttribute('class', 'sdescrip');
                    div.appendChild(p2);
                    wrapp.appendChild(div);

                });
            }
            else {
                var div = document.createElement('div');
                var h2 = document.createElement('h2');
                h2.innerText = "NO Results Found...";
                div.appendChild(h2);
                wrapp.appendChild(div);

            }
        }
    };
    xhttp.open("GET", "/searchr?query=" + encodeURIComponent(query), true);
    xhttp.send();
}
