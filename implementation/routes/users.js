var express = require('express');
var router = express.Router();
var argon2i = require('argon2-ffi').argon2i;
var crypto = require('crypto');
const CLIENT_ID = '990564276476-jtov9kn26975kavfa7311l1pu2a2vm89.apps.googleusercontent.com';

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

/*
req.pool.getConnection(function(err,connection){
  if(err){
    res.sendStatus(500);
    return;
  }
  var quer='wanted query';
  connection.query(query,function(err,rows,fields){
      connection.release();
      if(err){
          res.sendStatus(500);
          return;
      }

      res.sendjson(rows);
  });

  });
  */
function denyuser(req, res) {
    res.status(403);
    res.send('Username or password not valid');
}

function setuser(req, res, rows) {
    req.session.stat = 'loggedin';
    req.session.user = rows[0]['login_id'];
    req.session.type = rows[0]['user_type'];
    res.status(200);
    res.send();
}
router.post('/ulogin', function(req, res, next) {
    var uname = req.body.user;
    var pass = req.body.password;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = 'SELECT * FROM Login WHERE (username=? OR email=?);';
        connection.query(query, [uname, uname], function(err, rows, fields) {
            connection.release();
            if (err) {
                res.sendStatus(500);
                return;
            }
            if (rows.length == 0) {
                res.status(403);
                res.send('Username or password not valid');
                return;
            }
            else {
                if (rows[0]['user_type'] == 'Admin') {
                    res.status(403);
                    res.send('Username or password not valid');
                    return;
                }
                var password = new Buffer.from(pass);

                argon2i.verify(rows[0]['password'], password).then(correct => correct ? setuser(req, res, rows) : denyuser(req, res));

            }

        });

    });

});

// token function used for google sign in and it needs asynchronous transmission
router.post('/tokensignin', async function(req, res, next) {

    try {
        const ticket = await client.verifyIdToken({
            idToken: req.body.idtoken,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        const email = payload['email'];


        req.pool.getConnection(function(err, connection) {
            if (err) {
                res.sendStatus(500);
                return;
            }
            var query = 'SELECT * FROM Login WHERE email=?;';
            connection.query(query, [email], function(err, rows, fields) {
                connection.release();
                if (err) {
                    res.sendStatus(500);
                    return;
                }
                if (rows.length == 0) {
                    res.status(401);
                    res.send('/googlesignup.html');

                }
                else {
                    if (rows[0]['user_type'] == 'Admin') {
                        res.status(403);
                        res.send('Username or password not valid');
                        return;
                    }
                    req.session.stat = 'loggedin';
                    req.session.user = rows[0]['login_id'];
                    req.session.type = rows[0]['user_type'];

                    res.status(200);
                    res.send();
                }

            });


        });


    }
    catch {

        res.sendStatus(401);

    }

});


router.get('/logout', function(req, res, next) {
    req.session.stat = "notlogged";
    req.session.uid = "";
    req.session.utype = "";
    res.status(200);
    res.redirect('/');

});

/* login system*/
router.use('/', function(req, res, next) {
    if (req.session.stat == 'loggedin' && req.session.type == 'user') {
        next();
    }
    else {
        res.redirect('/login.html');
    }
});




router.post('/userinfo', function(req, res, next) {
    uname = req.session.user;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = 'SELECT user_id,give_name,last_name,gender,phone_numbe,email,username,flat_no,street_name,city,state from User INNER JOIN Login ON Login.login_id=User.login INNER JOIN Address ON Address.address_id=User.address WHERE Login.login_id=?;';
        connection.query(query, [req.session.user], function(err, rows, fields) {
            connection.release();
            if (err) {
                var er = {
                    "action": "user info get query",
                    "error": err
                };
                fs.writeFile("log.json", JSON.stringify(er), err => {
                    if (err) throw err;
                    console.log("Error Occured And logged into file");
                    res.sendStatus(500);
                    return;
                });
            }
            req.session.uid = rows[0]['user_id'];
            res.json(rows);
        });
    });
});


/* update with functions*/
function updater(req, res, update) {
    if (update.passs == update.oldpass || update.passs == 'password') {
        update.passs = update.oldpass;
    }
    crypto.randomBytes(32, function(err, salt) {
        if (err) throw err;

        argon2i.hash(update.passs, salt).then(hashed => {

            req.pool.getConnection(function(err, connection) {
                if (err) {
                    res.sendStatus(500);
                    return;
                }

                var query = 'UPDATE Login SET username = ? , password = ? , email = ? WHERE login_id = ? ;';
                connection.query(query, [update.uname, hashed, update.email, req.session.user], function(err, rows, fields) {
                    connection.release();
                    if (err) {
                        if (err['errno'] == 1062) {
                            res.status(401);
                            res.send("Username or email already taken");
                        }
                        else {
                            var er = {
                                "user": req.session.uid,
                                "action": "user info update query",
                                "error": err
                            };
                            fs.writeFile("log.json", JSON.stringify(er), err => {
                                if (err) throw err;
                                console.log("Error Occured And logged into file");
                                res.sendStatus(500);
                                return;
                            });
                        }
                        return;
                    }
                    req.pool.getConnection(function(err, connection) {
                        if (err) {
                            res.sendStatus(500);
                            return;
                        }

                        var query = 'UPDATE User INNER JOIN Address ON User.address=Address.address_id SET give_name = ? , last_name = ? , phone_numbe = ?, flat_no=?, street_name=?, city=?, state=? WHERE login = ? ;';
                        connection.query(query, [update.gname, update.lname, update.phno, update.flat_no, update.street, update.city, update.state, req.session.user], function(err, rows, fields) {
                            connection.release();
                            if (err) {
                                if (err['errno'] == 1062) {
                                    res.status(401);
                                    res.send("Phone number already taken");
                                }
                                else {
                                    var er = {
                                        "user": req.session.uid,
                                        "action": "user info update query",
                                        "error": err
                                    };
                                    fs.writeFile("log.json", JSON.stringify(er), err => {
                                        if (err) throw err;
                                        console.log("Error Occured And logged into file");
                                        res.sendStatus(500);
                                        return;
                                    });
                                }

                                return;
                            }
                            res.sendStatus(200);
                        });
                    });

                });
            });
        });

    });
}

function deny(req, res) {
    res.status(403);
    res.send('Not valid password');
}

router.post('/update', function(req, res, next) {
    var update = {
        gname: req.body.gname,
        lname: req.body.lname,
        uname: req.body.uname,
        email: req.body.email,
        flat_no: req.body.flat_no,
        street: req.body.street,
        city: req.body.city,
        state: req.body.state,
        phno: req.body.phno,
        passs: req.body.password,
        oldpass: req.body.oldpass
    };
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = 'SELECT password FROM Login WHERE login_id=?;';
        connection.query(query, [req.session.user], function(err, rows, fields) {
            connection.release();
            if (err) {
                res.sendStatus(500);
                return;
            }
            if (rows.length != 0) {

                var password = new Buffer.from(update.oldpass);

                argon2i.verify(rows[0]['password'], password).then(correct => correct ? updater(req, res, update) : deny(req, res));
            }
            else {
                res.status(403);
                res.send('Not valid password');
            }
        });
    });
});

router.post('/checkInVenue', function(req, res, next) {

    var ccode = req.body.code;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = 'SELECT * FROM Venues WHERE venue_id = ? ;';
        connection.query(query, [ccode], function(err, rows, fields) {
            connection.release();
            if (err) {

                res.sendStatus(500);
                return;
            }

            if (rows.length != 0) {
                req.pool.getConnection(function(err, connection) {
                    if (err) {
                        res.sendStatus(500);
                        return;
                    }
                    var query = 'SELECT * from Checkin WHERE User = ? AND venue = ? ;';
                    connection.query(query, [req.session.uid, ccode], function(err, rows, fields) {
                        connection.release();
                        if (err) {

                            res.sendStatus(500);
                            return;
                        }
                        if (rows.length == 0) {
                            req.pool.getConnection(function(err, connection) {
                                if (err) {

                                    res.sendStatus(500);
                                    return;
                                }
                                var query = 'INSERT INTO Checkin (User,venue,checkin_time) VALUES (?,?,NOW());';
                                connection.query(query, [req.session.uid, ccode], function(err, rows, fields) {
                                    connection.release();
                                    if (err) {
                                        var er = {
                                            "user": req.session.uid,
                                            "action": "user checkin query",
                                            "error": err
                                        };
                                        fs.writeFile("log.json", JSON.stringify(er), err => {
                                            if (err) throw err;
                                            console.log("Error Occured And logged into file");
                                            res.sendStatus(500);
                                            return;
                                        });
                                    }

                                    res.send('Successfully Checked In');
                                });

                            });
                        }
                        else {
                            res.send('Already checked in to Venue');
                        }
                    });
                });

            }
            else {
                res.send('Wrong input code');
            }
        });

    });
});

router.get('/checkInVenue/:venue_id', function(req, res, next) {
    var ccode = req.params.venue_id;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = 'SELECT * FROM Venues WHERE venue_id=?';
        connection.query(query, [ccode], function(err, rows, fields) {
            connection.release();
            if (err) {
                res.sendStatus(500);
                return;
            }

            if (rows.length != 0) {
                req.pool.getConnection(function(err, connection) {
                    if (err) {
                        res.sendStatus(500);
                        return;
                    }
                    var query = 'SELECT * from Checkin WHERE User=? AND venue=?;';
                    connection.query(query, [req.session.uid, ccode], function(err, rows, fields) {
                        connection.release();
                        if (err) {

                            res.sendStatus(500);
                            return;
                        }
                        if (rows.length == 0) {
                            req.pool.getConnection(function(err, connection) {
                                if (err) {

                                    res.sendStatus(500);
                                    return;
                                }
                                var query = 'INSERT INTO Checkin (User,venue,checkin_time) VALUES (?,?,NOW());';
                                connection.query(query, [req.session.uid, ccode], function(err, rows, fields) {
                                    connection.release();
                                    if (err) {
                                        var er = {
                                            "user": req.session.uid,
                                            "action": "user qr code checkin",
                                            "error": err
                                        };
                                        fs.writeFile("log.json", JSON.stringify(er), err => {
                                            if (err) throw err;
                                            console.log("Error Occured And logged into file");
                                            res.sendStatus(500);
                                            return;
                                        });
                                    }

                                    res.send('Checked in to Venue');
                                });

                            });
                        }
                        else {
                            res.send('Checked in to Venue');
                        }
                    });
                });

            }
            else {
                res.send('Invalid QR Code');
            }
        });

    });
});
router.post('/checkInVenuelocation', function(req, res, next) {

    var lat = parseFloat(req.body.lati);
    var lon = parseFloat(req.body.longi);
    var latmax = lat + 0.001;
    var latmin = lat - 0.001;
    var longmax = lon + 0.001;
    var longmin = lon - 0.001;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = 'SELECT venue_id,venue_type,venue_date,CONCAT(flat_no,", ",street_name,", ",city,", ",state) AS Address, venue_latitude,venue_longitude,give_name,last_name FROM Venues INNER JOIN Address ON Address.address_id=Venues.address INNER JOIN VenueOwner AS vw ON vw.owner_id=Venues.venue_owner INNER JOIN User ON vw.user_id=User.user_id WHERE (venue_latitude BETWEEN ? AND ?) AND (venue_longitude BETWEEN ? AND ?);';
        connection.query(query, [latmin, latmax, longmin, longmax], function(err, rows, fields) {
            connection.release();
            if (err) {
                var er = {
                    "user": req.session.uid,
                    "action": "user browser location checkin",
                    "error": err
                };
                fs.writeFile("log.json", JSON.stringify(er), err => {
                    if (err) throw err;
                    console.log("Error Occured And logged into file");
                    res.sendStatus(500);
                    return;
                });
            }
            if (rows.length != 0) {
                res.json(rows);
            }
            else {
                res.json({ "status": "no nearby checkins" });

            }

        });
    });
});


router.post('/checkInHistory', function(req, res, next) {
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = 'SELECT * FROM Checkin AS c WHERE c.User = ? ;';
        connection.query(query, [req.session.uid], function(err, rows, fields) {
            connection.release();
            if (err) {

                res.sendStatus(500);
                return;
            }
            if (rows.length == 0) {
                res.send('No checkins');
            }
            else {
                req.pool.getConnection(function(err, connection) {
                    if (err) {
                        res.sendStatus(500);
                        return;
                    }
                    var query = 'SELECT @sno:=@sno + 1 AS S_No,venue_type,DATE(c.checkin_time) AS checkin_time,flat_no,street_name,city,state,venue_longitude,venue_latitude FROM (SELECT @sno:=0) AS sno,Checkin AS c INNER JOIN Venues ON c.venue=Venues.venue_id INNER JOIN Address ON Venues.address=Address.address_id WHERE c.User=? ORDER BY c.checkin_time DESC LIMIT 20;';
                    connection.query(query, [req.session.uid], function(err, rows, fields) {
                        connection.release();
                        if (err) {
                            var er = {
                                "user": req.session.uid,
                                "action": "user checkin history",
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
            }

        });

    });
});


router.get('/hotspotmap/myvisit', function(req, res, next) {
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = 'SELECT checkin_id FROM Checkin INNER JOIN Hotspots AS h ON h.venue=Checkin.venue WHERE Checkin.User=?;';
        connection.query(query, [req.session.uid], function(err, rows, fields) {
            connection.release();
            if (err) {
                res.sendStatus(500);
                return;
            }

            if (rows.length != 0) {
                req.pool.getConnection(function(err, connection) {
                    if (err) {
                        res.sendStatus(500);
                        return;
                    }
                    var query = 'SELECT venue_latitude, venue_longitude, venue_type FROM Checkin INNER JOIN Hotspots AS h ON h.venue = Checkin.venue INNER JOIN Venues ON h.venue = Venues.venue_id WHERE Checkin.User = ? ;';
                    connection.query(query, [req.session.uid], function(err, rows, fields) {
                        connection.release();
                        if (err) {
                            var er = {
                                "user": req.session.uid,
                                "action": "user Hotspot visit check",
                                "error": err
                            };
                            fs.writeFile("log.json", JSON.stringify(er), err => {
                                if (err) throw err;
                                console.log("Error Occured And logged into file");
                                res.sendStatus(500);
                                return;
                            });
                        }

                        var data = [];
                        for (var j in rows) {
                            var d = [];
                            d.push(rows[j]['venue_longitude']);
                            d.push(rows[j]['venue_latitude']);
                            d.push(rows[j]['venue_type']);
                            data.push(d);
                        }
                        res.json(data);
                    });
                });
            }
            else {
                res.send("No Hotspot Visits");
            }
        });

    });
});

module.exports = router;
