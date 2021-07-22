function uactive() {
    document.getElementById("seconddata").style.display = 'none';
    document.getElementById('ftab').style.backgroundColor = "#eee9e9";
    document.getElementById("uvinsearch").placeholder = "Search By User Name";
    document.getElementById('uvsearch').title = "Search user";
    document.getElementById('stab').style.backgroundColor = "#80a1aa";
    var u = document.getElementById('firstdata');
    u.style.display = "block";

}

function vactive() {
    document.getElementById("firstdata").style.display = 'none';
    document.getElementById('stab').style.backgroundColor = "#eee9e9";
    document.getElementById("uvinsearch").placeholder = "Search By Venue";
    document.getElementById('uvsearch').title = "Search venue";
    document.getElementById('ftab').style.backgroundColor = "#80a1aa";
    var u = document.getElementById('seconddata');
    u.style.display = "block";
}
