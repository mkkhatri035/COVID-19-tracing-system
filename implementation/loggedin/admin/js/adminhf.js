   function uactive() {
       document.getElementById("seconddata").style.display = 'none';
       document.getElementById('ftab').style.backgroundColor = "#eee9e9";
       document.getElementById('stab').style.backgroundColor = "#80a1aa";
       var u = document.getElementById('firstdata');
       document.getElementById("uvinsearch").placeholder = "Search By Venue";
       document.getElementById('uvsearch').title = "Search Venue";
       u.style.display = "block";
       firstload();

   }

   function vactive() {
       document.getElementById("firstdata").style.display = 'none';
       document.getElementById('stab').style.backgroundColor = "#eee9e9";
       document.getElementById('ftab').style.backgroundColor = "#80a1aa";
       var u = document.getElementById('seconddata');
       document.getElementById("uvinsearch").placeholder = "Search By Hotspot";
       document.getElementById('uvsearch').title = "Search Hotspot";
       u.style.display = "block";
       secondload();
   }

   function firstload() {
       var xmlhttp = new XMLHttpRequest();
       xmlhttp.onreadystatechange = function() {
           if (this.readyState == 4 && this.status == 200) {
               var hotspots = JSON.parse(this.responseText);
               var doc = document.getElementById("content1");
               doc.innerHTML = '';
               if (hotspots.length == 0) {
                   var inn = document.createElement('TR');
                   var td = document.createElement('TD');
                   td.innerText = "NO Venues";
                   inn.appendChild(td);
                   inn.style.textAlign = "center";
                   doc.appendChild(inn);
               }
               else {

                   for (var i in hotspots) {
                       let o = document.createElement('tr');
                       o.setAttribute('class', 'recenter');
                       for (var j in hotspots[i]) {
                           var span = document.createElement('td');
                           span.innerText = hotspots[i][j];
                           o.appendChild(span);
                       }
                       var it = document.createElement('i');
                       it.setAttribute('class', 'fas fa-plus');
                       it.setAttribute('title', "Change to hotspot");
                       it.setAttribute('id', 'vn-' + hotspots[i]['venue_id']);
                       it.setAttribute('style', 'cursor:pointer;float:right;font-size:28px;padding-right:10px;');
                       it.addEventListener("click", addhotspots);
                       o.appendChild(it);

                       doc.appendChild(o);
                   }
               }
           }
       };
       xmlhttp.open("GET", "/admin/venuelist", true);
       xmlhttp.send();

   }

   function addhotspots() {
       var veneue = this.id.replace('vn-', '');
       var main = document.getElementById('cont');
       var v = document.getElementById('venue_id');
       v.value = veneue;
       v.disabled = true;
       main.style.opacity = 0;
       var po = document.getElementById('popup');
       po.style.display = 'block';
   }




   function closeinfo() {
       var main = document.getElementById('cont');
       main.style.opacity = 1;
       document.getElementById('popup').style.display = 'none';
       document.getElementById('popup2').style.display = 'none';
   }




   function confirmcr() {
       var check = confirm('Create Hotspots with Specified Details');
       if (check == true) {
           var data = {
               venue_id: document.getElementById('venue_id').value,
               hs_date_start: document.getElementById('hs_date_start').value,
               hs_date_end: document.getElementById('hs_date_end').value,
           };
           var flag = 0;
           for (var i in data) {
               if (data[i] == '') {
                   flag = 1;
               }
           }
           if (flag == 0) {
               var xhttp = new XMLHttpRequest();
               xhttp.onreadystatechange = function() {
                   if (this.readyState == 4 && this.status == 200) {
                       alert('Successfully Created Hotspots');
                       window.location.reload(true);
                   }
               };
               xhttp.open("POST", "/admin/addnewhotspot", true);
               xhttp.setRequestHeader('Content-type', 'application/json');
               xhttp.send(JSON.stringify(data));
           }

           else {
               alert('enter correct values');
           }
       }

   }



   function deleteh() {
       var vo = this.id.replace('ht-', '');
       var conf = confirm('Want to delete this Hotspot ' + vo);
       if (conf) {
           var xhttp = new XMLHttpRequest();
           xhttp.onreadystatechange = function() {
               if (this.readyState == 4 && this.status == 200) {
                   alert('Hotspot deleted successfully');
                   secondload();
               }
           };
           xhttp.open("POST", "/admin/htdelete", true);
           xhttp.setRequestHeader('Content-type', 'application/json');
           xhttp.send(JSON.stringify({ "hotsp": vo }));
       }
   }

   function secondload() {
       var xmlhttp = new XMLHttpRequest();
       xmlhttp.onreadystatechange = function() {
           if (this.readyState == 4 && this.status == 200) {
               var hotspots = JSON.parse(this.responseText);
               var doc = document.getElementById("content2");
               doc.innerHTML = '';
               if (hotspots.length == 0) {
                   var inn = document.createElement('TR');
                   inn.innerText = "NO Hotspots";
                   inn.style.textAlign = "center";
                   doc.appendChild(inn);
               }
               else {

                   for (var i in hotspots) {
                       let o = document.createElement('tr');
                       o.setAttribute('class', 'recenter');
                       for (var j in hotspots[i]) {
                           var span = document.createElement('td');
                           span.innerText = hotspots[i][j];
                           o.appendChild(span);
                       }
                       var it = document.createElement('i');
                       it.setAttribute('class', 'fas fa-pencil-alt');
                       it.setAttribute('title', "Edit profile");
                       it.setAttribute('id', 'ht-' + hotspots[i]['hotspot_id']);
                       it.setAttribute('style', 'cursor:pointer; font-size:20px; margin-left:3em;');
                       it.addEventListener("click", EditTimeframe);
                       o.appendChild(it);
                       var ifr = document.createElement('i');
                       ifr.setAttribute('class', 'fas fa-times');
                       ifr.setAttribute('title', "Delete");
                       ifr.setAttribute('id', 'ht-' + hotspots[i]['hotspot_id']);
                       ifr.addEventListener('click', deleteh);
                       ifr.setAttribute('style', 'cursor:pointer;font-size:20px; color:red; float:right; padding-right:15px;');
                       o.appendChild(ifr);

                       doc.appendChild(o);
                   }
               }
           }
       };
       xmlhttp.open("GET", "/admin/hplist", true);
       xmlhttp.send();

   }



   function EditTimeframe() {
       var hotspot = this.id.replace('ht-', '');
       var main = document.getElementById('cont');
       var mn = document.getElementById('hotspot_id');
       mn.value = hotspot;
       mn.disabled = true;
       main.style.opacity = 0;
       var po = document.getElementById('popup2');
       po.style.display = 'block';
   }


   function updateTimeframe() {
       var check = confirm('Edit timeframe with Specified Details');
       if (check == true) {
           var data = {
               hotspot_id: document.getElementById('hotspot_id').value,
               hs_date_start2: document.getElementById('hs_date_start2').value,
               hs_date_end2: document.getElementById('hs_date_end2').value,
           };
           var flag = 0;
           for (var i in data) {
               if (data[i] == '') {
                   flag = 1;
               }
           }
           if (flag == 0) {
               var xhttp = new XMLHttpRequest();
               xhttp.onreadystatechange = function() {
                   if (this.readyState == 4 && this.status == 200) {
                       alert('Successfully Edit!');
                       window.location.reload(secondload());


                   }
               };
               xhttp.open("POST", "/admin/updateTimeframe", true);
               xhttp.setRequestHeader('Content-type', 'application/json');
               xhttp.send(JSON.stringify(data));
           }

           else {
               alert('enter correct values');
           }
       }

   }

   function userspecific(search) {
       var xhttp = new XMLHttpRequest();
       var input = document.getElementById('uvinsearch');
       if (input.value != '') {
           if (search.title == "Search venue") {

               xhttp.onreadystatechange = function() {
                   if (this.readyState == 4 && this.status == 200) {

                       var hotspots = JSON.parse(this.responseText);
                       var doc = document.getElementById("content1");
                       doc.innerHTML = '';
                       if (hotspots.length == 0) {
                           var inn = document.createElement('TR');
                           var td = document.createElement('TD');
                           td.innerText = "NO Venues";
                           inn.appendChild(td);
                           inn.style.textAlign = "center";
                           doc.appendChild(inn);
                       }
                       else {

                           for (var i in hotspots) {
                               let o = document.createElement('tr');
                               o.setAttribute('class', 'recenter');
                               for (var j in hotspots[i]) {
                                   var span = document.createElement('td');
                                   span.innerText = hotspots[i][j];
                                   o.appendChild(span);
                               }
                               var it = document.createElement('i');
                               it.setAttribute('class', 'fas fa-plus');
                               it.setAttribute('title', "Change to hotspot");
                               it.setAttribute('id', 'vn-' + hotspots[i]['venue_id']);
                               it.setAttribute('style', 'cursor:pointer;float:right;font-size:28px;padding-right:10px;');
                               it.addEventListener("click", addhotspots);
                               o.appendChild(it);




                               doc.appendChild(o);
                           }
                       }

                   }
               };
               xhttp.open("POST", "/admin/venulists", true);
               xhttp.setRequestHeader('Content-type', 'application/json');
               xhttp.send(JSON.stringify({ "inputs": input.value }));
           }
           else {

               xhttp.onreadystatechange = function() {
                   if (this.readyState == 4 && this.status == 200) {
                       var hotspots = JSON.parse(this.responseText);
                       var doc = document.getElementById("content2");
                       doc.innerHTML = '';
                       if (hotspots.length == 0) {
                           var inn = document.createElement('TR');
                           inn.innerText = "NO Hotspots";
                           inn.style.textAlign = "center";
                           doc.appendChild(inn);
                       }
                       else {

                           for (var i in hotspots) {
                               let o = document.createElement('tr');
                               o.setAttribute('class', 'recenter');
                               for (var j in hotspots[i]) {
                                   var span = document.createElement('td');
                                   span.innerText = hotspots[i][j];
                                   o.appendChild(span);
                               }
                               var it = document.createElement('i');
                               it.setAttribute('class', 'fas fa-pencil-alt');
                               it.setAttribute('title', "Edit profile");
                               it.setAttribute('id', 'ht-' + hotspots[i]['hotspot_id']);
                               it.setAttribute('style', 'cursor:pointer; font-size:2em; margin-left:3em;');
                               it.addEventListener("click", EditTimeframe);
                               o.appendChild(it);

                               doc.appendChild(o);
                           }
                       }
                   }
               };
               xhttp.open("POST", "/admin/hotslists", true);
               xhttp.setRequestHeader('Content-type', 'application/json');
               xhttp.send(JSON.stringify({ "inputs": input.value }));
           }

       }
       else {
           if (search.title == "Search venue") {
               firstload();
           }
           else {
               secondload();
           }
       }
   }
   