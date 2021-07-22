var express = require('express');
var router = express.Router();
var argon2i = require('argon2-ffi').argon2i;
var crypto = require('crypto');
var fs = require('fs');
router.use('/', function(req, res, next) {
    if (req.session.stat == 'loggedin' && req.session.type == 'VenueOwner') {
        next();
    }
    else {
        res.status(403);
        res.redirect('/login.html');
    }
});

router.get('/logout', function(req, res, next) {
    req.session.stat = "notlogged";
    req.session.uid = "";
    req.session.utype = "";
    res.status(200);
    res.redirect('/');

});

router.post('/ownerinfo', function(req, res, next) {
    let uname = req.session.user;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = 'SELECT VenueOwner.user_id AS user_id,give_name,last_name,gender,phone_numbe,email,username,flat_no,street_name,city,state FROM VenueOwner INNER JOIN User ON User.user_id=VenueOwner.user_id INNER JOIN Login ON Login.login_id=User.login INNER JOIN Address ON Address.address_id=User.address WHERE Login.login_id=?;';
        connection.query(query, [req.session.user], function(err, rows, fields) {
            connection.release();
            if (err) {
                var er = {
                    "user": req.session.uid,
                    "action": "Venue Owner info update query",
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
                req.session.uid = rows[0]['user_id'];
                res.json(rows);
            }
            else {
                res.send();
            }
        });
    });
});

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

                var query = 'UPDATE Login SET username=?, password=?, email=? WHERE login_id=?;';
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
                                "action": "Venue Owner update query",
                                "error": err
                            };
                            fs.writeFile("log.json", JSON.stringify(er), err => {
                                if (err) throw err;
                                console.log("Error Occured And logged into file");
                                res.sendStatus(500);
                                return;
                            });
                        }
                        res.sendStatus(500);
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
                                        "action": "Venue Owner update query",
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
        connection.query(query, [req.session.user, update.oldpass], function(err, rows, fields) {
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

router.post('/Venueinfo', function(req, res, next) {
    if ('venue' in req.body) {
        req.pool.getConnection(function(err, connection) {
            if (err) {
                res.sendStatus(500);
                return;
            }
            var query = 'SELECT venue_type, venue_date, CONCAT(flat_no,",", street_name,",", city,",",state) as Address, venue_latitude, venue_longitude FROM Venues AS v INNER JOIN Address AS a ON a.address_id = v.address WHERE venue_id = ? ;';
            connection.query(query, [req.body.venue], function(err, rows, fields) {
                connection.release();
                if (err) {
                    var er = {
                        "user": req.session.uid,
                        "action": "Venue Owner Venue info query",
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
    else {
        req.pool.getConnection(function(err, connection) {
            if (err) {
                res.sendStatus(500);
                return;
            }
            var query = 'SELECT venue_id,venue_type, CONCAT(flat_no,",", street_name,",", city,",", state) AS Address, venue_date FROM Venues AS v INNER JOIN Address AS a ON a.address_id = v.address INNER JOIN VenueOwner AS vo ON vo.owner_id = v.venue_owner WHERE vo.user_id = ? ORDER BY v.created_at DESC;';
            connection.query(query, [req.session.uid], function(err, rows, fields) {
                connection.release();
                if (err) {
                    var er = {
                        "user": req.session.uid,
                        "action": "Venue Owner venue info",
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
                    res.send('NO Venues to Show');
                }
            });
        });
    }
});


router.post('/createvenue', function(req, res, next) {
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = 'INSERT INTO Address (flat_no,street_name,city,state) VALUES (?,?,?,?);';
        connection.query(query, [req.body.vflat, req.body.vstreet, req.body.vcity, req.body.vstate], function(err, rows, fields) {
            connection.release();
            if (err) {
                var er = {
                    "user": req.session.uid,
                    "action": "Venue Owner venue creation",
                    "error": err
                };
                fs.writeFile("log.json", JSON.stringify(er), err => {
                    if (err) throw err;
                    console.log("Error Occured And logged into file");
                    res.sendStatus(500);
                    return;
                });
            }
            var addr_id, ow_id;
            req.pool.getConnection(function(err, connection) {
                if (err) {
                    res.sendStatus(500);
                    return;
                }
                query = 'SELECT address_id FROM Address WHERE flat_no=? AND street_name=? AND city=? AND state=?;';
                connection.query(query, [req.body.vflat, req.body.vstreet, req.body.vcity, req.body.vstate], function(err, rows, fields) {
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
                        query = 'SELECT owner_id FROM VenueOwner WHERE user_id=?;';
                        connection.query(query, [req.session.uid], function(err, rows, fields) {
                            connection.release();
                            if (err) {

                                res.sendStatus(500);
                                return;
                            }
                            ow_id = rows[0]['owner_id'];
                            req.pool.getConnection(function(err, connection) {
                                if (err) {
                                    res.sendStatus(500);
                                    return;
                                }
                                query = 'INSERT INTO Venues (venue_type,address,venue_owner,venue_date,venue_latitude,venue_longitude,created_at) VALUES (?,?,?,?,?,?,NOW());';
                                connection.query(query, [req.body.vtype, addr_id, ow_id, req.body.vdate, req.body.vlat, req.body.vlon], function(err, rows, fields) {
                                    connection.release();
                                    if (err) {
                                        var er = {
                                            "user": req.session.uid,
                                            "action": "Venue Owner venue creation",
                                            "error": err
                                        };
                                        fs.writeFile("log.json", JSON.stringify(er), err => {
                                            if (err) throw err;
                                            console.log("Error Occured And logged into file");
                                            res.sendStatus(500);
                                            return;
                                        });
                                    }
                                    res.sendStatus(200);
                                });
                            });
                        });
                    });
                });
            });

        });
    });
});

router.post('/updatevenue', function(req, res, next) {

    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = 'UPDATE Venues INNER JOIN Address ON Address.address_id=Venues.address SET venue_type=?, venue_date=?, flat_no=?, street_name=?, city=?, state=?,venue_latitude=?, venue_longitude=? WHERE venue_id=?;';
        connection.query(query, [req.body.vtype, req.body.vdate, req.body.vflat, req.body.vstreet, req.body.vcity, req.body.vstate, req.body.vlat, req.body.vlon, req.body.venue_id], function(err, rows, fields) {
            connection.release();
            if (err) {
                var er = {
                    "user": req.session.uid,
                    "action": "Venue Owner venue updation",
                    "error": err
                };
                fs.writeFile("log.json", JSON.stringify(er), err => {
                    if (err) throw err;
                    console.log("Error Occured And logged into file");
                    res.sendStatus(500);
                    return;
                });
            }
            res.sendStatus(200);

        });
    });

});

router.post('/deleteven', function(req, res, next) {
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = 'DELETE FROM Venues WHERE venue_id=?;';
        connection.query(query, [req.body.venue], function(err, rows, fields) {
            connection.release();
            if (err) {
                var er = {
                    "user": req.session.uid,
                    "action": "Venue Owner venue deletion",
                    "error": err
                };
                fs.writeFile("log.json", JSON.stringify(er), err => {
                    if (err) throw err;
                    console.log("Error Occured And logged into file");
                    res.sendStatus(500);
                    return;
                });
            }
            res.sendStatus(200);
        });
    });
});

router.post('/checkininfo', function(req, res, next) {
    var vid = req.body.venue;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = 'SELECT @sno:=@sno+1 AS S_No,username,DATE(checkin_time) AS checkin_date,phone_numbe,email FROM (SELECT @sno:=0) AS sno,Checkin AS c INNER JOIN User AS u ON u.user_id=c.User INNER JOIN Login ON Login.login_id=u.login WHERE c.venue=?;';
        connection.query(query, [vid], function(err, rows, fields) {
            connection.release();
            if (err) {
                var er = {
                    "user": req.session.uid,
                    "action": "Venue Owner venue checkin info",
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

module.exports = router;
