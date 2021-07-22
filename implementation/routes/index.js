var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var fs = require('fs');
var argon2i = require('argon2-ffi').argon2i;
var crypto = require('crypto');

var caseData;
var statedata = new String();
var dataprepared = 0;
var latest_states = {};
var total_conf = [];
var statearr = [];
var stateschart = [];
var vaccineschart = [];


/* case summary for a short info about cases*/
function casesummary() {
    fetch('https://coronavirus-19-api.herokuapp.com/countries/australia')
        .then(res => res.json())
        .then(json => caseData = json);
}
casesummary();

function state_det() {
    fetch('https://raw.githubusercontent.com/M3IT/COVID-19_Data/master/Data/COVID19_Data_Hub.csv')
        .then(res => res.text())
        .then(body => statedata = body.toString());
    dataprepared = 0;
}
state_det();
/* data preparation for state summary*/
function dataprep() {
    if (dataprepared == 0 && typeof(statedata) == 'string') {
        statedata = (statedata.replace(/\\"/g, '')).replace(/"/g, "'");
        statedata = statedata.split('\n');
        statearr = [];
        statearr.push(statedata[0].split(','));
        for (var i = 2; i < location + 2; ++i) {
            statearr.push(statedata[statedata.length - i].split(','));
        }

        for (let i in statearr) {
            for (var j in statearr[i]) {
                statearr[i][j] = statearr[i][j].replace(/'/g, '');
            }
        }

        for (i = 1; i < statearr.length; ++i) {
            var o = {};
            for (j in statearr[i]) {
                o[statearr[0][j]] = statearr[i][j];
            }
            latest_states[i] = o;
        }
        dataprepared = 1;
    }
    return latest_states;
}

/* data preparation for the charts*/
function chardataprep() {
    if (dataprepared == 0 && typeof(statedata) == 'string') {
        statedata = (statedata.replace(/\\"/g, '')).replace(/"/g, "'");
        statedata = statedata.split('\n');
        var temp = [];
        for (var i in statedata) {
            temp.push(statedata[i].split(','));
        }

        for (let i in temp) {
            for (var j in temp[i]) {
                temp[i][j] = temp[i][j].replace(/'/g, '');
            }
        }
        total_conf = [];
        for (i in temp) {
            var t = [];
            if (temp[i][11] != "1" && i != 0) {
                break;
            }

            t.push(temp[i][0]);
            if (i != 0) {
                t.push(parseInt(temp[i][1]));
                t.push(parseInt(temp[i][5]));
                t.push(parseInt(temp[i][2]));
            }
            else {
                t.push(temp[i][1]);
                t.push(temp[i][5]);
                t.push(temp[i][2]);
            }

            total_conf.push(t);
        }
        dataprepared = 1;
    }
    return total_conf;
}


function state_all(state) {
    if (dataprepared == 0 && typeof(statedata) == 'string') {
        statedata = (statedata.replace(/\\"/g, '')).replace(/"/g, "'");
        statedata = statedata.split('\n');
        dataprepared = 1;
    }
    var temp = [];
    for (var i in statedata) {
        temp.push(statedata[i].split(','));
    }

    for (let i in temp) {
        for (var j in temp[i]) {
            temp[i][j] = temp[i][j].replace(/'/g, '');
        }
    }

    stateschart = [
        ["date", "confirmed", "recovered", "deaths"]
    ];
    for (i in temp) {
        if (temp[i][13] == state) {
            var t = [];
            t.push(new Date(temp[i][0]));
            t.push(parseInt(temp[i][1]));
            t.push(parseInt(temp[i][5]));
            t.push(parseInt(temp[i][2]));
            stateschart.push(t);
        }

    }
    return stateschart;

}

function vaccine_det(state) {
    if (dataprepared == 0 && typeof(statedata) == 'string') {
        statedata = (statedata.replace(/\\"/g, '')).replace(/"/g, "'");
        statedata = statedata.split('\n');
        dataprepared = 1;
    }
    var temp = [];
    for (var i in statedata) {
        temp.push(statedata[i].split(','));
    }

    for (let i in temp) {
        for (var j in temp[i]) {
            temp[i][j] = temp[i][j].replace(/'/g, '');
        }
    }

    vaccineschart = [
        ["date", "Vaccinated"]
    ];
    for (i in temp) {
        if (temp[i][13] == state) {
            var t = [];
            t.push(new Date(temp[i][0]));
            t.push(parseInt(temp[i][9]));
            vaccineschart.push(t);
        }

    }
    return vaccineschart;
}




router.get('/', function(req, res, next) {
    casesummary();
    state_det();
    next();
});

router.get('/load', function(req, res, next) {
    casesummary();
    state_det();
    res.send();
});

router.post('/logincheck', function(req, res, next) {
    var data;
    if (req.session.stat == 'loggedin' && req.session.type == 'user') {
        data = {
            "right": `<div class="dropdown dropstart">
            <nav id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
              <i class="fas fa-caret-down" style="cursor: pointer;"></i>
              <i class="fas fa-user-circle u-profile" style="font-size:3em; cursor:pointer; color:red;"></i>
            </nav>

            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
              <li><a class="dropdown-item" href="/users/checkinhistory.html">My Check-IN</a></li>
              <li><a class="dropdown-item" href="/users/UserCheckIn.html">Make Check-In</a></li>
              <li><a class="dropdown-item" href="/users/UserprofInfo.html">Profile</a></li>
              <li><a class="dropdown-item" href="/users/logout">Log Out</a></li>
            </ul>
          </div>`,
            "left": ` <li class="nav-item">
              <a class="nav-link" href="/checkin.html">Check-Ins</a> </li>
            <li class="nav-item"> <a class="nav-link" href="/hotspot.html?type='normal'">Hotspots</a></li>
            <li class="nav-item"> <a class="nav-link" href="/covidcases.html">Covid Cases</a></li>
            <li class="nav-item"> <a class="nav-link" href="/users/myvisits.html">My Hotspot Visits</a>
            </li>`
        };

    }
    else if (req.session.stat == 'loggedin' && req.session.type == 'VenueOwner') {
        data = {
            "right": `<div class="dropdown dropstart">
                        <nav id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-caret-down" style="cursor: pointer;"></i>
                            <i class="fas fa-user-circle u-profile" style="font-size:3em; cursor:pointer; color:red;"></i>
                        </nav>
                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                            <li><a class="dropdown-item" href="/venueowner/venues.html">My Venues</a></li>
                            <li><a class="dropdown-item" href="/venueowner/vencreate.html">Create Venue</a></li>
                            <li><a class="dropdown-item" href="/venueowner/vprofInfo.html">Profile</a></li>
                            <li><a class="dropdown-item" href="/users/logout">Log Out</a></li>
                        </ul>
                    </div>`,
            "left": `<li class="nav-item"> <a class="nav-link" href="/hotspot.html">Hotspots</a></li>
                    <li class="nav-item"> <a class="nav-link" href="/covidcases.html">Covid Cases</a></li>
                    <li class="nav-item"> <a class="nav-link" href="/venueowner/venues.html">My Venues</a>
                    </li>`

        };
    }
    else if (req.session.stat == 'loggedin' && req.session.type == 'Admin') {
        data = {
            "right": `<div class="dropdown dropstart">
                        <nav id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="fas fa-caret-down" style="cursor: pointer;"></i>
                            <i class="fas fa-user-circle u-profile" style="font-size:3em; cursor:pointer; color:red;"></i>
                        </nav>

                        <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                            <li><a class="dropdown-item" href="/admin/addnew.html">Create Admin</a></li>
                            <li><a class="dropdown-item" href="/admin/adhotfra.html">Manage hotspots</a></li>
                            <li><a class="dropdown-item" href="/admin/adprofInfo.html">Profile Options</a></li>
                            <li><a class="dropdown-item" href="/users/logout">Log Out</a></li>
                        </ul>
                    </div>`,
            "left": ` <li class="nav-item"> <a class="nav-link" href="/hotspot.html">Hotspots</a></li>
                    <li class="nav-item"> <a class="nav-link" href="/covidcases.html">Covid Cases</a></li>
                    <li class="nav-item"> <a class="nav-link" href="/admin/admincheckin.html">See Check-Ins</a>
                    </li>
                    <li class="nav-item"> <a class="nav-link" href="/admin/addnew.html">Create Admin</a>
                    </li>`
        };

    }
    else {
        data = false;
    }
    res.json(data);
});


/* summarised covid data*/
router.get("/cases", function(req, res, next) {
    casesummary();
    res.send(caseData);
});


/* Australia's covid cases summary report show*/
var location = 8;
router.get("/statesdata", function(req, res, next) {
    state_det();
    res.json(dataprep());
});

router.get('/totalstatechart', function(req, res, next) {
    var data = state_all(req.query.state);
    res.json(data);
});

router.get("/totalchart", function(req, res, next) {
    state_det();
    res.json(chardataprep());
});

router.get('/vaccinechart', function(req, res, next) {
    var state = req.query.state;
    if (req.query.state == "Vaccines in Country") {
        state = 'NA';
    }
    var data = vaccine_det(state);
    res.json(data);
});


router.get('/hotspotmap', function(req, res, next) {
    req.pool.getConnection(function(err, connection) {
        if (err) {

            res.sendStatus(500);
            return;
        }
        var query = 'SELECT venue_longitude,venue_latitude,venue_id AS Checkin_code FROM Hotspots INNER JOIN Venues ON Venues.venue_id = Hotspots.venue;';
        connection.query(query, function(err, rows, fields) {
            connection.release();
            if (err) {
                var er = {
                    "action": "hotspot data fetch",
                    "error": err
                };
                fs.writeFile("log.json", JSON.stringify(er), err => {
                    if (err) throw err;
                    console.log("Error Occured And logged into file");
                    res.sendStatus(500);
                    return;
                });
            }

            var h = [];
            for (var i in rows) {
                var ho = [];
                for (var j in rows[i]) {
                    ho.push(rows[i][j]);
                }
                h.push(ho);
            }
            res.json(h);
        });

    });
});



router.post('/signup', function(req, res, next) {
    for (var i in req.body) {
        if (req.body[i].search('"') != -1 || req.body[i].search("'") != -1) {
            res.sendStatus(403);
            break;
        }
    }
    var lid, uid, addr_id;
    crypto.randomBytes(32, function(err, salt) {
        if (err) throw err;

        argon2i.hash(req.body.password, salt).then(hashed => {

            req.pool.getConnection(function(err, connection) {
                if (err) {
                    res.sendStatus(500);
                    return;
                }

                var query = 'INSERT INTO Login (email,username,password,user_type) VALUES (?,?,?,?);';
                connection.query(query, [req.body.email, req.body.username, hashed, req.body.utype], function(err, rows, fields) {
                    connection.release();
                    if (err) {

                        if (err['errno'] == 1062) {
                            res.send("Username or email already taken");
                        }
                        else {
                            var er = {
                                "action": "Sign Up Login Data Insertion",
                                "error": err
                            };
                            fs.writeFile("log.json", JSON.stringify(er), err => {
                                if (err) throw err;
                                console.log("Error Occured And logged into file");
                                res.sendStatus(500);
                                return;
                            });
                        }
                    }


                    req.pool.getConnection(function(err, connection) {
                        if (err) {
                            res.sendStatus(500);
                            return;
                        }

                        query = 'SELECT login_id FROM Login WHERE username = ?;';
                        connection.query(query, [req.body.username], function(err, rows, fields) {
                            connection.release();
                            if (err) {

                                res.sendStatus(500);
                                return;

                            }

                            lid = rows[0]['login_id'];

                            req.pool.getConnection(function(err, connection) {
                                if (err) {
                                    res.sendStatus(500);
                                    return;
                                }
                                query = 'INSERT INTO Address (flat_no,street_name,city,state) VALUES (?,?,?,?);';
                                connection.query(query, [req.body.flat_no, req.body.street, req.body.city, req.body.state], function(err, rows, fields) {
                                    connection.release();
                                    if (err) {
                                        var er = {
                                            "action": "Sign Up Address Data Insertion",
                                            "error": err
                                        };
                                        fs.writeFile("log.json", JSON.stringify(er), err => {
                                            if (err) throw err;
                                            console.log("Error Occured And logged into file");


                                            req.pool.getConnection(function(err, connection) {
                                                if (err) {
                                                    res.sendStatus(500);
                                                    return;
                                                }
                                                var query = `DELETE FROM Login WHERE username=?;`;
                                                connection.query(query, [req.body.username], function(err, rows, fields) {
                                                    connection.release();
                                                    if (err) {
                                                        res.sendStatus(500);
                                                        return;
                                                    }
                                                    res.sendStatus(500);
                                                    return;
                                                });
                                            });
                                        });
                                    }

                                    req.pool.getConnection(function(err, connection) {
                                        if (err) {
                                            res.sendStatus(500);
                                            return;
                                        }
                                        query = 'SELECT address_id FROM Address WHERE flat_no=? AND street_name=? AND city=? AND state=?;';
                                        connection.query(query, [req.body.flat_no, req.body.street, req.body.city, req.body.state], function(err, rows, fields) {
                                            connection.release();
                                            if (err) {

                                                res.sendStatus(500);
                                                return;
                                            }

                                            addr_id = rows[0]['address_id'];

                                            req.pool.getConnection(function(err, connection) {
                                                if (err) {
                                                    res.sendStatus(500);
                                                    return;
                                                }
                                                query = 'INSERT INTO User (give_name,last_name,gender,phone_numbe,address, creation_date, login) VALUES (?,?,?,?,?,NOW(),?);';
                                                connection.query(query, [req.body.firstname, req.body.lastname, req.body.gender, req.body.phoneno, addr_id, lid], function(err, rows, fields) {
                                                    connection.release();
                                                    if (err) {
                                                        var er = {
                                                            "action": "Sign Up Address Data Insertion",
                                                            "error": err
                                                        };
                                                        fs.writeFile("log.json", JSON.stringify(er), err => {
                                                            if (err) throw err;
                                                            console.log("Error Occured And logged into file");

                                                            req.pool.getConnection(function(err, connection) {
                                                                if (err) {
                                                                    res.sendStatus(500);
                                                                    return;
                                                                }
                                                                var query = `DELETE FROM Login WHERE username=?; DELETE FROM Address WHERE flat_no=? AND street_name=? AND city=? AND state=?;`;
                                                                connection.query(query, [req.body.username, req.body.flat_no, req.body.street, req.body.city, req.body.state], function(err, rows, fields) {
                                                                    connection.release();
                                                                    if (err) {
                                                                        res.sendStatus(500);
                                                                        return;
                                                                    }
                                                                    res.sendStatus(500);
                                                                    return;
                                                                });
                                                            });
                                                        });

                                                    }

                                                    if (req.body.utype == 'VenueOwner') {
                                                        /* get user id for owner*/
                                                        req.pool.getConnection(function(err, connection) {
                                                            if (err) {
                                                                res.sendStatus(500);
                                                                return;
                                                            }
                                                            query = 'SELECT user_id FROM User WHERE login=?;';
                                                            connection.query(query, [lid], function(err, rows, fields) {
                                                                connection.release();
                                                                if (err) {

                                                                    res.sendStatus(500);
                                                                    return;
                                                                }
                                                                uid = rows[0]['user_id'];

                                                                req.pool.getConnection(function(err, connection) {
                                                                    if (err) {
                                                                        res.sendStatus(500);
                                                                        return;
                                                                    }
                                                                    query = 'INSERT INTO VenueOwner (user_id) VALUES (?);';
                                                                    connection.query(query, [uid], function(err, rows, fields) {
                                                                        connection.release();
                                                                        if (err) {
                                                                            var er = {
                                                                                "action": "Sign Up VenueOwner table Insertion",
                                                                                "error": err
                                                                            };
                                                                            fs.writeFile("log.json", JSON.stringify(er), err => {
                                                                                if (err) throw err;
                                                                                console.log("Error Occured And logged into file");

                                                                                req.pool.getConnection(function(err, connection) {
                                                                                    if (err) {
                                                                                        res.sendStatus(500);
                                                                                        return;
                                                                                    }
                                                                                    var query = `DELETE FROM Login WHERE username=?; DELETE FROM Address WHERE flat_no=? AND street_name=? AND city=? AND state=?; DELETE FROM User WHERE user_id=?;`;
                                                                                    connection.query(query, [req.body.username, req.body.flat_no, req.body.street, req.body.city, req.body.state, uid], function(err, rows, fields) {
                                                                                        connection.release();
                                                                                        if (err) {
                                                                                            res.sendStatus(500);
                                                                                            return;
                                                                                        }
                                                                                        res.sendStatus(500);
                                                                                        return;
                                                                                    });
                                                                                });
                                                                            });
                                                                        }
                                                                        res.send('Successfully Signed Up As Venue Owner');
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    }
                                                    else {
                                                        res.send('Successfully Signed Up As User');
                                                    }
                                                });
                                            });

                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

});

router.post('/allavailcheckins', function(req, res, next) {
    var top = 50;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }

        let query = 'SELECT venue_id AS "Check-in code",venue_type AS Type,venue_date AS "Venue Timing",CONCAT(flat_no,", ",street_name,", ",city,", ",state) AS Address,CONCAT(give_name," ",last_name) AS Owner FROM Venues AS v INNER JOIN Address AS a ON a.address_id = v.address INNER JOIN VenueOwner AS vo ON vo.owner_id=v.venue_owner INNER JOIN User ON User.user_id=vo.user_id ORDER BY v.created_at DESC LIMIT ?;';
        connection.query(query, [top], function(err, rows, fields) {
            connection.release();
            if (err) {
                var er = {
                    "action": "available checkins data get",
                    "error": err
                };
                fs.writeFile("log.json", JSON.stringify(er), err => {
                    if (err) throw err;
                    console.log("Error Occured And logged into file");
                    res.sendStatus(500);
                    return;
                });

            }
            res.json(rows);
        });
    });
});

const nodemailer = require('nodemailer');


let mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'thecovidtracker21@gmail.com',
        pass: 'Covid03@@'
    }
});


router.post('/recoverforgot', function(req, res, next) {
    var log = req.body.login;
    var email;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }

        let query = 'SELECT email from Login WHERE email=? OR username=?;';
        connection.query(query, [log, log], function(err, rows, fields) {
            connection.release();
            if (err) {

                res.sendStatus(500);
                return;
            }
            if (rows.length != 0) {
                email = rows[0]['email'];
                var number = Math.floor(100000 + Math.random() * 900000);
                req.pool.getConnection(function(err, connection) {
                    if (err) {
                        res.sendStatus(500);
                        return;
                    }

                    let query = 'SELECT * FROM Recovery WHERE email=?;';
                    connection.query(query, [email], function(err, rows, fields) {
                        connection.release();
                        if (err) {

                            res.sendStatus(500);
                            return;
                        }
                        if (rows.length != 0) {
                            res.send("Done");
                            let mailDetails = {
                                from: 'thecovidtracker21@gmail.com',
                                to: email,
                                subject: 'Recovery code',
                                html: `<div><p>Recovery code for resetting the password is:</p><br>
                                    <h1 style="text-align:center">code: <strong>${rows[0]['code']}</strong></h1>
                                    </div>`
                            };

                            mailTransporter.sendMail(mailDetails, function(err, data) {
                                if (err) {
                                    console.log(err);
                                }
                                else {
                                    console.log('Email sent successfully');
                                }

                            });
                        }
                        else {
                            req.pool.getConnection(function(err, connection) {
                                if (err) {
                                    res.sendStatus(500);
                                    return;
                                }
                                let query = 'INSERT INTO Recovery (email,code,date_create) VALUES (?,?,NOW()); CALL checkentries_recovery();';
                                connection.query(query, [email, number], function(err, rows, fields) {
                                    connection.release();
                                    if (err) {
                                        var er = {
                                            "action": "Recovery Table data insertion",
                                            "error": err
                                        };
                                        fs.writeFile("log.json", JSON.stringify(er), err => {
                                            if (err) throw err;
                                            console.log("Error Occured And logged into file");
                                            res.sendStatus(500);
                                            return;
                                        });
                                    }

                                    req.pool.getConnection(function(err, connection) {
                                        if (err) {
                                            res.sendStatus(500);
                                            return;
                                        }

                                        let query = 'SELECT code FROM Recovery WHERE email=?;';
                                        connection.query(query, [email], function(err, rows, fields) {
                                            connection.release();
                                            if (err) {

                                                res.sendStatus(500);
                                                return;
                                            }

                                            res.send("Done");
                                            let mailDetails = {
                                                from: 'thecovidtracker21@gmail.com',
                                                to: email,
                                                subject: 'Recovery code',
                                                html: `<div><p>Recovery code for resetting the password is:</p><br><h1 style="text-align:center">code: <strong>${rows[0]['code']}</strong></h1>
                                    </div>`
                                            };

                                            mailTransporter.sendMail(mailDetails, function(err, data) {
                                                if (err) {
                                                    console.log(err);
                                                }
                                                else {
                                                    console.log('Email sent successfully');
                                                }

                                            });
                                        });
                                    });
                                });

                            });
                        }
                    });
                });
            }

        });
    });

});



router.post('/codevalidate', function(req, res, next) {
    var code = req.body.code;
    var email = req.body.email;
    var passs = req.body.passs;
    if (passs == '') {
        res.status(401);
        res.send('enter right password');
    }
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = 'SELECT * FROM Recovery WHERE email=? AND code=? AND date_create < DATE_ADD(date_create, INTERVAL 10 MINUTE); CALL reducecount(?,@count);SELECT @count;';
        connection.query(query, [email, code, email], function(err, rows, fields) {
            connection.release();
            if (err) {
                var er = {
                    "action": "codevalidation for recovery",
                    "error": err
                };
                fs.writeFile("log.json", JSON.stringify(er), err => {
                    if (err) throw err;
                    console.log("Error Occured And logged into file");
                    res.sendStatus(500);
                    return;
                });
            }

            if (rows[0].length == 0) {
                res.status(401);

                if (rows[2][0]['@count'] > 0) {
                    res.send("INVALID Recovery code");
                }
                else
                    res.send('Maximum Attempts Reached!! Try again Later');
            }
            else {
                crypto.randomBytes(32, function(err, salt) {
                    if (err) throw err;

                    argon2i.hash(passs, salt).then(hashed => {

                        req.pool.getConnection(function(err, connection) {
                            if (err) {
                                res.sendStatus(500);
                                return;
                            }
                            var query = 'UPDATE Login SET password = ? WHERE email = ? ; CALL deleterecov(?);';
                            connection.query(query, [hashed, email, email], function(err, rows, fields) {
                                connection.release();
                                if (err) {
                                    var er = {
                                        "action": "password update after recovery",
                                        "error": err
                                    };
                                    fs.writeFile("log.json", JSON.stringify(er), err => {
                                        if (err) throw err;
                                        console.log("Error Occured And logged into file");
                                        res.sendStatus(500);
                                        return;
                                    });
                                }
                                res.status(200);
                                res.send('Succesfully password Reset');
                                let mailDetails = {
                                    from: 'covidtracker@gmail.com',
                                    to: email,
                                    subject: 'Password Reset Successfully',
                                    html: `<div>Greetings of the Day!<br><p>Your password reset was successful on
                                ${new Date()}.</p><br></div>`
                                };

                                mailTransporter.sendMail(mailDetails, function(err, data) {
                                    if (err) {
                                        console.log(err);
                                    }
                                    else {
                                        console.log('Email sent successfully');
                                    }
                                });
                            });
                        });
                    });
                });
            }

        });
    });

});

// gmail less secure app confirm: https://www.google.com/settings/security/lesssecureapps
// gmail captcha enable each time login:https://accounts.google.com/b/0/displayunlockcaptcha
router.get('/searchr', function(req, res, next) {
    var qu = req.query.query;
    var se = [];
    fs.readFile('./result.json', 'utf8', (err, data) => {

        if (err) {
            console.log(`Error reading file from disk: ${err}`);
        }
        else {
            let result = JSON.parse(data);
            result.forEach(item => {

                if (item['head'].match(qu) || item[`url`].match(qu) || item['describe'].match(qu)) {
                    se.push(item);
                }
            });
            res.send(se);
        }

    });

});

router.get('/signup.html', function(req, res, next) {
    if (req.session.stat == 'loggedin') {
        res.redirect('/');
    }
    else {
        next();
    }
});
router.get('/login.html', function(req, res, next) {
    if (req.session.stat == 'loggedin') {
        res.redirect('/');
    }
    else {
        next();
    }
});
router.get('/googlesignup.html', function(req, res, next) {
    if (req.session.stat == 'loggedin') {
        res.redirect('/');
    }
    else {
        next();
    }
});

module.exports = router;
