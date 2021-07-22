var express = require('express');
var router = express.Router();
var argon2i = require('argon2-ffi').argon2i;
var crypto = require('crypto');
const CLIENT_ID = '990564276476-jtov9kn26975kavfa7311l1pu2a2vm89.apps.googleusercontent.com';

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

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

router.post('/adminlogin', function(req, res, next) {

    var uname = req.body.user;
    var pass = req.body.password;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = 'SELECT * FROM Login WHERE (username=? OR email=?);';
        connection.query(query, [uname, uname, pass], function(err, rows, fields) {
            connection.release();
            if (err) {
                res.sendStatus(500);
                return;
            }
            if (rows.length == 0) {
                res.status(401);
                res.send('Username or password not valid');
                return;
            }
            else {
                if (rows[0]['user_type'] == 'Admin') {

                    var password = new Buffer.from(pass);

                    argon2i.verify(rows[0]['password'], password).then(correct => correct ? setuser(req, res, rows) : denyuser(req, res));
                }
                else {
                    res.status(401);
                    res.send('Username or password not valid');
                }

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
                    res.send("Username Or Password Invalid");

                }
                else {
                    if (rows[0]['user_type'] != 'Admin') {
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

router.use('/', function(req, res, next) {
    if (req.session.stat == 'loggedin' && req.session.type == 'Admin') {
        next();
    }
    else {
        res.status(403);
        res.redirect('/');
    }
});

router.post('/admininfo', function(req, res, next) {
    uname = req.session.user;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = 'SELECT Admin.user_id AS user_id,give_name,last_name,gender,phone_numbe,email,username,flat_no,street_name,city,state FROM Admin INNER JOIN User ON User.user_id=Admin.user_id INNER JOIN Login ON Login.login_id=User.login INNER JOIN Address ON Address.address_id=User.address WHERE Login.login_id=?;';
        connection.query(query, [req.session.user], function(err, rows, fields) {
            connection.release();
            if (err) {

                var er = {
                    "user": req.session.uid,
                    "action": "admin info query",
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
                                "action": "admin update query",
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
                                        "action": "admin update query",
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

router.post('/createadmin', function(req, res, next) {
    var deta = {
        gname: req.body.give_name,
        lname: req.body.last_name,
        uname: req.body.username,
        email: req.body.email,
        flat_no: req.body.flat_no,
        street: req.body.street_name,
        city: req.body.city,
        state: req.body.state,
        phno: req.body.phone_numbe,
        passs: req.body.password,
        gender: req.body.gender
    };

    var lid, uid, addr_id;
    crypto.randomBytes(32, function(err, salt) {
        if (err) throw err;

        argon2i.hash(deta.passs, salt).then(hashed => {

            req.pool.getConnection(function(err, connection) {
                if (err) {
                    res.sendStatus(500);
                    return;
                }

                var query = 'INSERT INTO Login (email,username,password,user_type) VALUES (?,?,?,?);';
                connection.query(query, [deta.email, deta.uname, hashed, 'Admin'], function(err, rows, fields) {
                    connection.release();
                    if (err) {

                        if (err['errno'] == 1062) {
                            res.send("Username Or Email already taken");
                        }
                        else {
                            var er = {
                                "user": req.session.uid,
                                "action": "admin New admin creation",
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

                        query = 'SELECT login_id FROM Login WHERE username = ?;';
                        connection.query(query, [deta.uname], function(err, rows, fields) {
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
                                connection.query(query, [deta.flat_no, deta.street, deta.city, deta.state], function(err, rows, fields) {
                                    connection.release();
                                    if (err) {
                                        var er = {
                                            "user": req.session.uid,
                                            "action": "admin update query",
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
                                        connection.query(query, [deta.flat_no, deta.street, deta.city, deta.state], function(err, rows, fields) {
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
                                                connection.query(query, [deta.gname, deta.lname, deta.gender, deta.phno, addr_id, lid], function(err, rows, fields) {
                                                    connection.release();
                                                    if (err) {
                                                        var er = {
                                                            "user": req.session.uid,
                                                            "action": "admin New Admin Creation",
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


                                                    /* get user id for Admin*/
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
                                                                query = 'INSERT INTO Admin (user_id) VALUES (?);';
                                                                connection.query(query, [uid], function(err, rows, fields) {
                                                                    connection.release();
                                                                    if (err) {
                                                                        var er = {
                                                                            "user": req.session.uid,
                                                                            "action": "admin update query",
                                                                            "error": err
                                                                        };
                                                                        fs.writeFile("log.json", JSON.stringify(er), err => {
                                                                            if (err) throw err;
                                                                            console.log("Error Occured And logged into file");
                                                                            res.sendStatus(500);
                                                                            return;
                                                                        });
                                                                    }
                                                                    res.send('Successfully Signed Up As Admin');
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
            });
        });
    });
});

router.get('/ulist', function(req, res, next) {
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `SELECT user_id, give_name,last_name,gender,phone_numbe,
            CONCAT(flat_no,', ',street_name,', ',city,', ',state) AS Address
                    From User INNER JOIN Address
                    ON User.address = Address.address_id INNER JOIN Login ON Login.login_id = User.login where Login.user_type="user" ORDER BY creation_date DESC LIMIT 10;`;
        connection.query(query, function(err, rows, fields) {
            connection.release();
            if (err) {
                var er = {
                    "user": req.session.uid,
                    "action": "admin users list",
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

router.get('/volist', function(req, res, next) {
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `SELECT VenueOwner.owner_id AS Owner,give_name,last_name,gender,phone_numbe,
            CONCAT(flat_no,', ',street_name,', ',city,', ',state) AS Address
                    From User INNER JOIN VenueOwner
                    ON User.user_id=VenueOwner.user_id
                    INNER JOIN Address
                    ON User.address = Address.address_id ORDER BY creation_date DESC LIMIT 10;`;
        connection.query(query, function(err, rows, fields) {
            connection.release();
            if (err) {
                var er = {
                    "user": req.session.uid,
                    "action": "admin venueowner list",
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

router.get('/vlist', function(req, res, next) {
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `SELECT venue_id, venue_type, venue_owner, venue_date, venue_latitude,venue_longitude,
            CONCAT(flat_no,', ',street_name,', ',city,', ',state) AS Address
                    From Venues INNER JOIN VenueOwner
                    ON VenueOwner.owner_id=Venues.venue_owner
                    INNER JOIN Address
                    ON Venues.address = Address.address_id ORDER BY created_at DESC LIMIT 10;`;
        connection.query(query, function(err, rows, fields) {
            connection.release();
            if (err) {
                var er = {
                    "user": req.session.uid,
                    "action": "admin venue list",
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

router.post('/udelete', function(req, res, next) {
    var user = req.body.user;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `SELECT login,address FROM User WHERE user_id=?;`;
        connection.query(query, [user], function(err, rows, fields) {
            connection.release();
            if (err) {
                res.sendStatus(500);
                return;
            }
            var log = rows[0]['login'];
            var addr = rows[0]['address'];
            req.pool.getConnection(function(err, connection) {
                if (err) {
                    res.sendStatus(500);
                    return;
                }
                var query = `DELETE FROM Login WHERE login_id=?;`;
                connection.query(query, [log], function(err, rows, fields) {
                    connection.release();
                    if (err) {
                        var er = {
                            "user": req.session.uid,
                            "action": "admin user deletion",
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
                        var query = `DELETE FROM Address WHERE address_id=?;`;
                        connection.query(query, [addr], function(err, rows, fields) {
                            connection.release();
                            if (err) {
                                var er = {
                                    "user": req.session.uid,
                                    "action": "admin user deletion",
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

router.post('/vodelete', function(req, res, next) {
    var user = req.body.user;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `SELECT login,address FROM VenueOwner INNER JOIN User ON User.user_id=VenueOwner.user_id WHERE owner_id=?;`;
        connection.query(query, [user], function(err, rows, fields) {
            connection.release();
            if (err) {
                res.sendStatus(500);
                return;
            }
            var log = rows[0]['login'];
            var addr = rows[0]['address'];
            req.pool.getConnection(function(err, connection) {
                if (err) {
                    res.sendStatus(500);
                    return;
                }
                var query = `DELETE FROM Login WHERE login_id=?;`;
                connection.query(query, [log], function(err, rows, fields) {
                    connection.release();
                    if (err) {
                        var er = {
                            "user": req.session.uid,
                            "action": "admin venue owner deletion",
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
                        var query = `DELETE FROM Address WHERE address_id=?;`;
                        connection.query(query, [addr], function(err, rows, fields) {
                            connection.release();
                            if (err) {
                                var er = {
                                    "user": req.session.uid,
                                    "action": "admin venue owner deletion",
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

router.post('/vendelete', function(req, res, next) {
    var venue = req.body.venue;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `SELECT address FROM Venues WHERE venue_id=?;`;
        connection.query(query, [venue], function(err, rows, fields) {
            connection.release();
            if (err) {
                res.sendStatus(500);
                return;
            }
            var addr = rows[0]['address'];

            req.pool.getConnection(function(err, connection) {
                if (err) {
                    res.sendStatus(500);
                    return;
                }
                var query = `DELETE FROM Address WHERE address_id=?;`;
                connection.query(query, [addr], function(err, rows, fields) {
                    connection.release();
                    if (err) {
                        var er = {
                            "user": req.session.uid,
                            "action": "admin venue deletion",
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

router.get('/viewuCheckins', function(req, res, next) {
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `SELECT Checkin.User, Checkin.venue, Checkin.checkin_time,
            CONCAT(Address.flat_no, ', ', Address.street_name, ', ', Address.city, ', ', Address.state) AS Address
        From Checkin
        INNER JOIN Venues
        On Checkin.venue = Venues.venue_id
        INNER JOIN User
        On Checkin.User = User.user_id
        INNER JOIN Address
        ON User.address = Address.address_id ORDER BY checkin_time DESC LIMIT 10
            ;`;
        connection.query(query, function(err, rows, fields) {
            connection.release();
            if (err) {
                res.sendStatus(500);
                return;
            }


            res.json(rows);

        });

    });


});

router.get('/viewvCheckins', function(req, res, next) {
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `SELECT Checkin.User, Checkin.venue,Checkin.checkin_time,
            CONCAT(Address.flat_no,', ',Address.street_name,', ',Address.city,', ',Address.state) AS Address
            From Checkin
            INNER JOIN User
            On Checkin.User = User.user_id
            INNER JOIN Venues
            On Checkin.venue = Venues.venue_id
            INNER JOIN Address
            ON Venues.address = Address.address_id ORDER BY checkin_time DESC LIMIT 10
            ;`;
        connection.query(query, function(err, rows, fields) {
            connection.release();
            if (err) {
                res.sendStatus(500);
                return;
            }


            res.json(rows);

        });

    });


});

router.get('/venuelist', function(req, res, next) {
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }

        var query = `SELECT venue_id, venue_type,venue_date, CONCAT(venue_latitude,' , ', venue_longitude), CONCAT(Address.flat_no,', ',Address.street_name,', ',Address.city,', ',Address.state) AS Address
            FROM Venues
            INNER JOIN Address
            ON Venues.address = Address.address_id ORDER BY created_at DESC LIMIT 10
            ;`;
        connection.query(query, function(err, rows, fields) {
            connection.release();
            if (err) {

                res.sendStatus(500);
                return;
            }
            res.json(rows);

        });

    });

});

router.get('/hplist', function(req, res, next) {
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }

        var query = `SELECT hotspot_id,venue_id,date_start,date_stop,CONCAT(Address.flat_no,', ',Address.street_name,', ',Address.city,', ',Address.state) AS Address
            FROM Hotspots
            INNER JOIN Venues ON Venues.venue_id=Hotspots.venue
            INNER JOIN Address
            ON Venues.address = Address.address_id ORDER BY date_stop DESC LIMIT 10
            ;`;
        connection.query(query, function(err, rows, fields) {
            connection.release();
            if (err) {
                var er = {
                    "user": req.session.uid,
                    "action": "admin hotspot list fetch",
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
router.post('/addnewhotspot', function(req, res, next) {

    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `INSERT into Hotspots (venue,date_start, date_stop)  Values(?,?,?);`;
        connection.query(query, [req.body.venue_id, req.body.hs_date_start, req.body.hs_date_end], function(err, rows, fields) {
            connection.release();
            if (err) {
                var er = {
                    "user": req.session.uid,
                    "action": "admin new hotspot creation",
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

router.post('/updateTimeframe', function(req, res, next) {
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `UPDATE Hotspots
                    SET date_start = ?, date_stop=?
                    WHERE hotspot_id= ?;`;
        connection.query(query, [req.body.hs_date_start2, req.body.hs_date_end2, req.body.hotspot_id], function(err, rows, fields) {
            connection.release();
            if (err) {
                var er = {
                    "user": req.session.uid,
                    "action": "admin hotspot updation",
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


router.post('/viewuCh', function(req, res, next) {
    var det = req.body.inputs;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `SELECT User,CONCAT(flat_no,',',street_name,',',city,',',state) AS Address,venue ,checkin_time FROM Checkin INNER JOIN User ON User.user_id=Checkin.User INNER JOIN Address ON Address.address_id=User.address WHERE User.user_id=? OR User.give_name=? OR User.last_name=? OR phone_numbe=? ORDER BY checkin_time DESC LIMIT 10;`;
        connection.query(query, [det, det, det, det], function(err, rows, fields) {
            connection.release();
            if (err) {
                res.sendStatus(500);
                return;
            }
            res.json(rows);
        });
    });
});

router.post('/viewvCh', function(req, res, next) {
    var det = req.body.inputs;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `SELECT User,venue ,checkin_time FROM Checkin INNER JOIN Venues ON Venues.venue_id=Checkin.venue WHERE venue_id=? OR venue_type=? ORDER BY checkin_time DESC LIMIT 10;`;
        connection.query(query, [det, det], function(err, rows, fields) {
            connection.release();
            if (err) {
                res.sendStatus(500);
                return;
            }

            res.json(rows);
        });
    });
});

router.post('/venulists', function(req, res, next) {
    var det = req.body.inputs;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `SELECT venue_id,venue_type,venue_date,CONCAT(venue_latitude,' , ',venue_longitude) AS location,CONCAT(flat_no,',',street_name,',',city,',',state) AS Address FROM Venues INNER JOIN Address ON Address.address_id=Venues.address WHERE venue_id=? OR venue_type=? ORDER BY created_at DESC LIMIT 10;`;
        connection.query(query, [det, det], function(err, rows, fields) {
            connection.release();
            if (err) {

                res.sendStatus(500);
                return;
            }

            res.json(rows);
        });
    });
});

router.post('/hotslists', function(req, res, next) {
    var det = req.body.inputs;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `SELECT hotspot_id, venue_id, date_start, date_stop, CONCAT(flat_no, ',', street_name, ',', city, ',', state) AS Address FROM Hotspots INNER JOIN Venues ON Venues.venue_id = Hotspots.venue INNER JOIN Address ON Address.address_id = Venues.address WHERE hotspot_id = ? OR venue_id = ? OR venue_type = ? ORDER BY date_stop DESC LIMIT 10;`;
        connection.query(query, [det, det, det], function(err, rows, fields) {
            connection.release();
            if (err) {

                res.sendStatus(500);
                return;
            }

            res.json(rows);
        });
    });
});

router.post('/usplist', function(req, res, next) {
    var det = req.body.inputs;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `SELECT user_id,give_name,last_name,gender,phone_numbe,CONCAT(flat_no,',',street_name,',',city,',',state) AS Address FROM User INNER JOIN Address ON Address.address_id=User.address WHERE user_id=? OR give_name=? OR last_name=? OR phone_numbe=? ORDER BY creation_date DESC LIMIT 20;`;
        connection.query(query, [det, det, det, det], function(err, rows, fields) {
            connection.release();
            if (err) {

                res.sendStatus(500);
                return;
            }

            res.json(rows);
        });
    });
});

router.post('/vosplist', function(req, res, next) {
    var det = req.body.inputs;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `SELECT owner_id,give_name,last_name,gender,phone_numbe,CONCAT(flat_no,',',street_name,',',city,',',state) AS Address FROM VenueOwner INNER JOIN User ON User.user_id=VenueOwner.user_id INNER JOIN Address ON Address.address_id=User.address WHERE VenueOwner.user_id=? OR owner_id=? OR give_name=? OR last_name=? OR phone_numbe=? ORDER BY creation_date DESC LIMIT 20;`;
        connection.query(query, [det, det, det, det, det], function(err, rows, fields) {
            connection.release();
            if (err) {

                res.sendStatus(500);
                return;
            }

            res.json(rows);
        });
    });
});

router.post('/vsplist', function(req, res, next) {
    var det = req.body.inputs;
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `SELECT venue_id,venue_type,venue_owner,venue_date,venue_latitude,venue_longitude,CONCAT(flat_no,',',street_name,',',city,',',state) AS Address FROM Venues INNER JOIN Address ON Address.address_id=Venues.address WHERE venue_id=? OR venue_owner=? OR venue_type=? ORDER BY created_at DESC LIMIT 20;`;
        connection.query(query, [det, det, det], function(err, rows, fields) {
            connection.release();
            if (err) {

                res.sendStatus(500);
                return;
            }

            res.json(rows);
        });
    });
});

router.post('/htdelete', function(req, res, next) {
    req.pool.getConnection(function(err, connection) {
        if (err) {
            res.sendStatus(500);
            return;
        }
        var query = `DELETE FROM Hotspots WHERE hotspot_id=?;`;
        connection.query(query, [req.body.hotsp], function(err, rows, fields) {
            connection.release();
            if (err) {
                res.sendStatus(500);
                return;
            }

            res.send('deleted');
        });
    });
});
module.exports = router;
