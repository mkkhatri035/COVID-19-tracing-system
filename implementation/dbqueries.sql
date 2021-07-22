-- to backup the date
mysqldump --host=127.0.0.1 --databases covidtracker > database.sql

-- to get database from saved file
mysql --host=127.0.0.1 < database.sql

-- TABLE CREATIONS

-- Recovery Table
 CREATE TABLE Recovery(
 email varchar(255) NOT NULL,
 code int(6) NOT NULL,
 count int NOT NULL DEFAULT(3),
 date_create datetime NOT NULL,
 PRIMARY KEY(email));

-- LOGIN TABLE
CREATE TABLE Login (
    login_id int(9) NOT NULL AUTO_INCREMENT,
    email varchar(255) NOT NULL UNIQUE,
    username varchar(30) NOT NULL UNIQUE,
    password varchar(255),
    user_type varchar(11) NOT NULL,
    PRIMARY KEY(login_id));
ALTER TABLE Login AUTO_INCREMENT=10000001;

-- ADDRESS TABLE
CREATE TABLE Address (
    address_id int(9) NOT NULL AUTO_INCREMENT,
    flat_no varchar(10),
    street_name varchar(30) NOT NULL,
    city varchar(30) NOT NULL,
    state varchar(40) NOT NULL,
    PRIMARY KEY(address_id)
    );

ALTER TABLE Address AUTO_INCREMENT=10000001;

-- User table
CREATE TABLE User(
    user_id int(9) NOT NULL AUTO_INCREMENT,
    give_name varchar(40) NOT NULL,
    last_name varchar(50) NOT NULL,
    gender varchar(10) NOT NULL,
    phone_numbe decimal(13) NOT NULL UNIQUE,
    Government_id varchar(20),
    address int,
    login int NOT NULL,
    creation_date datetime NOT NULL,
    PRIMARY KEY(user_id),
    FOREIGN KEY(address) REFERENCES Address(address_id)
    ON DELETE SET NULL,
    FOREIGN KEY(login) REFERENCES Login(login_id)
    ON DELETE CASCADE);
ALTER TABLE User AUTO_INCREMENT=10000001;

-- Venue Owner Table
CREATE TABLE VenueOwner(
    owner_id int(9) NOT NULL AUTO_INCREMENT,
    user_id int(9) NOT NULL,
    PRIMARY KEY(owner_id),
    FOREIGN KEY(user_id) REFERENCES User(user_id)
    ON DELETE CASCADE
    );
ALTER TABLE VenueOwner AUTO_INCREMENT=10000001;

-- Admin table
CREATE TABLE Admin(
    admin_id int(9) NOT NULL AUTO_INCREMENT,
    user_id int(9) NOT NULL,
    PRIMARY KEY(admin_id),
    FOREIGN KEY(user_id) REFERENCES User(user_id)
    ON DELETE CASCADE
    );
ALTER TABLE Admin AUTO_INCREMENT=10000001;

-- Venues tables

CREATE TABLE Venues(
venue_id int(9) NOT NULL AUTO_INCREMENT,
venue_type varchar(30) NOT NULL,
address int(9) NOT NULL,
venue_owner int(9) NOT NULL,
venue_date datetime NOT NULL CONSTRAINT "INVALID_DATE" CHECK(venue_date>NOW()),
venue_latitude decimal(10,7) NOT NULL,
venue_longitude decimal(10,7) NOT NULL,
created_at datetime NOT NULL,
PRIMARY KEY(venue_id),
FOREIGN KEY(address) REFERENCES Address(address_id)
ON DELETE CASCADE,
FOREIGN KEY(venue_owner) REFERENCES VenueOwner(owner_id)
ON DELETE CASCADE
);
ALTER TABLE Venues AUTO_INCREMENT=10000001;

-- Hotspots
CREATE TABLE Hotspots(
hotspot_id int(9) NOT NULL AUTO_INCREMENT,
venue int(9) NOT NULL,
date_start datetime NOT NULL,
date_stop datetime NOT NULL,
PRIMARY KEY(hotspot_id),
FOREIGN KEY(venue) REFERENCES Venues(venue_id)
ON DELETE CASCADE);
ALTER TABLE Hotspots AUTO_INCREMENT=10000001;


-- Checkin table
CREATE TABLE Checkin(
checkin_id int(9) NOT NULL AUTO_INCREMENT,
User int(9) NOT NULL,
venue int(9) NOT NULL,
checkin_time datetime NOT NULL,
PRIMARY KEY(checkin_id),
FOREIGN KEY(User) REFERENCES User(user_id)
ON DELETE CASCADE,
FOREIGN KEY(venue) REFERENCES Venues(venue_id)
ON DELETE CASCADE
);
ALTER TABLE Checkin AUTO_INCREMENT=10000001;



/* to insert data into tables*/


INSERT INTO Login (email,username,password,user_type) VALUES (?,?,?,?);  /* for inserting into login table*/

INSERT INTO User (give_name,last_name,gender,phone_numbe,Government_id, address , creation_date, login) VALUES (?,?,?,?,?,?,NOW(),?); /* for inserting into user table*/
/* for address and login we need to provide key of details stored in address and login tables*/

INSERT INTO Address (flat_no,street_name,city,state) VALUES (?,?,?,?);  /* for inserting into address table;*/

INSERT INTO Venues (venue_type,address,venue_owner,venue_date,venue_latitude,venue_logitude,created_at) VALUES (?,?,?,?,?,?,NOW()); /*insert into venues table*/

INSERT INTO Admin (user_id) VALUES (?);

INSERT INTO VenueOwner (user_id) VALUES (?);

INSERT INTO Checkin (User,venue,checkin_time) VALUES (?,?,NOW()); /* need to provide key values of users and venue table*/

INSERT INTO Hotspots (venue,data_start,date_stop) VALUES (?,?,?); /* venue id to be provided*/







/* to get data*/

SELECT give_name,last_name,gender,phone_numbe,email,username,flat_no,street_name,city,state from User INNER JOIN Login
    ON Login.login_id=User.login INNER JOIN Address ON
    Address.address_id=User.address WHERE Login.username=?;
/* to get complete info of user by username*/

SELECT give_name,last_name,gender,phone_numbe,email,username,flat_no,street_name,city,state from VenueOwner INNER JOIN User
    ON User.user_id=VenueOwner.user_id INNER JOIN Login
    ON Login.login_id=User.login INNER JOIN Address ON
    Address.address_id=User.address WHERE Login.username=?;
/* to get complete info of Venue Owner by username*/

SELECT give_name,last_name,gender,phone_numbe,email,username,flat_no,street_name,city,state from Admin INNER JOIN User
    ON User.user_id=Admin.user_id INNER JOIN Login
    ON Login.login_id=User.login INNER JOIN Address ON
    Address.address_id=User.address WHERE Login.username=?;
/* to get complete info of Admin by username*/

SELECT venue_id as Checkin_code,venue_type,venue_owner,venue_date,venue_latitude,venue_logitude,flat_no,street_name,city,state,created_at FROM Venues INNER JOIN Address
    ON Address.address_id=Venue.address;      /* for taking all the venues from the system from all venue owners;*/


SELECT venue_id as Checkin_code,venue_type,venue_owner,venue_date,venue_latitude,venue_logitude,flat_no,street_name,city,state,created_at FROM Venues INNER JOIN Address
    ON Address.address_id=Venue.address INNER JOIN VenueOwner on Venues.venue_owner=VenueOwner.owener_id INNER JOIN User
    ON VenueOwner.user_id=User.user_id INNER JOIN Login ON Login.login_id=User.login WHERE Login.username=? ;

    /* for taking all the venues of a particular venue owner by username;*/

SELECT venue_id as Checkin_code,venue_latitude,venue_longitude FROM Hotspots INNER JOIN Venues
ON Venues.venue_id=Hotspots.venue;
/* to get all the hotspots available in the system*/

SELECT give_name,last_name,venue_id as Checkin_code,venue_type FROM Checkin INNER JOIN User ON User.user_id=Checkin.User
    INNER JOIN Venues ON Venues.venue_id=Checkin.venue;
    /* to get all the checkins in the system only basic info about the checkin*/

SELECT give_name,last_name,venue_id as Checkin_code,venue_type FROM Checkin INNER JOIN User ON User.user_id=Checkin.User
    INNER JOIN Venues ON Venues.venue_id=Checkin.venue
    INNER JOIN Login ON User.login=Login.login_id WHERE Login.username=?;
    /* get all checkin by a specific user*/

SELECT give_name,last_name,venue_id as Checkin_code,venue_type FROM Checkin INNER JOIN User ON User.user_id=Checkin.User
    INNER JOIN Venues ON Venues.venue_id=Checkin.venue
    Where Venues.venue=?;
    /*get all checkins to a specific venue by venue checkin code
*/
SELECT @sno:=@sno+1 as S_No,venue_type,c.checkin_time,flat_no,street_name,city,state,venue_longitude,venue_latitude
FROM (SELECT @sno:=0) AS sno,Checkin as c
INNER JOIN Venues ON c.venue=Venues.venue_id
INNER JOIN Address ONVenues.address=Address.address_id
WHERE c.User=1;
--get checkin history of the user


/* Customized queries for various operations*/
SELECT venue_longitude,venue_latitude,venue_id AS Checkin_code
FROM Hotspots
INNER JOIN Venues ON Venues.venue_id = Hotspots.venue;

SELECT login_id FROM Login WHERE username = ?;

SELECT address_id FROM Address WHERE flat_no=? AND street_name=? AND city=? AND state=?;

DELETE FROM Login WHERE username=?;

DELETE FROM Address WHERE flat_no=? AND street_name=? AND city=? AND state=?;

DELETE FROM User WHERE user_id=?;

SELECT venue_id AS "Check-in code",venue_type AS Type,venue_date AS "Venue Timing",CONCAT(flat_no,", ",street_name,", ",city,", ",state) AS Address,CONCAT(give_name," ",last_name) AS Owner
FROM Venues AS v
INNER JOIN Address AS a ON a.address_id = v.address
INNER JOIN VenueOwner AS vo ON vo.owner_id=v.venue_owner
INNER JOIN User ON User.user_id=vo.user_id
ORDER BY v.created_at DESC LIMIT ?;


SELECT email from Login WHERE email=? OR username=?;

SELECT * FROM Recovery WHERE email=?;

INSERT INTO Recovery (email,code,date_create) VALUES (?,?,NOW()); -- to insert into recovery table

SELECT * FROM Recovery WHERE email=? AND code=? AND date_create < DATE_ADD(date_create, INTERVAL 10 MINUTE);

UPDATE Login SET password=? WHERE email=?;

SELECT * FROM Login WHERE (username=? OR email=?);

SELECT * FROM Login WHERE email=?;

SELECT user_id,give_name,last_name,gender,phone_numbe,email,username,flat_no,street_name,city,state
FROM User
INNER JOIN Login ON Login.login_id=User.login
INNER JOIN Address ON Address.address_id=User.address WHERE Login.login_id=?;

UPDATE Login SET username=?, password=?, email=? WHERE login_id=?;

UPDATE User INNER JOIN Address ON User.address=Address.address_id SET give_name = ? , last_name = ? , phone_numbe = ?, flat_no=?, street_name=?, city=?, state=? WHERE login = ? ;

SELECT * FROM Venues WHERE venue_id=?;

SELECT * from Checkin WHERE User=? AND venue=?;

SELECT venue_id,venue_type,venue_date,CONCAT(flat_no,", ",street_name,", ",city,", ",state) AS Address, venue_latitude,venue_longitude,give_name,last_name
FROM Venues
INNER JOIN Address ON Address.address_id=Venues.address
INNER JOIN VenueOwner AS vw ON vw.owner_id=Venues.venue_owner
INNER JOIN User ON vw.user_id=User.user_id
WHERE (venue_latitude BETWEEN ? AND ?) AND (venue_longitude BETWEEN ? AND ?);

SELECT * FROM Checkin AS c WHERE c.User=?;

SELECT checkin_id
FROM Checkin
INNER JOIN Hotspots AS h ON h.venue=Checkin.venue
WHERE Checkin.User=?;

SELECT venue_latitude,venue_longitude,venue_type
FROM Checkin
INNER JOIN Hotspots AS h ON h.venue=Checkin.venue
INNER JOIN Venues ON h.venue=Venues.venue_id
WHERE Checkin.User=?;

SELECT VenueOwner.user_id AS user_id,give_name,last_name,gender,phone_numbe,email,username,flat_no,street_name,city,state
FROM VenueOwner
INNER JOIN User ON User.user_id=VenueOwner.user_id
INNER JOIN Login ON Login.login_id=User.login
INNER JOIN Address ON Address.address_id=User.address
WHERE Login.login_id=?;

UPDATE Venues
INNER JOIN Address ON Address.address_id=Venues.address
SET venue_type=?, venue_date=?, flat_no=?, street_name=?, city=?, state=?,venue_latitude=?, venue_longitude=?
WHERE venue_id=?;

DELETE FROM Venues WHERE venue_id=?;

SELECT @sno:=@sno+1 AS S_No,username,DATE(checkin_time) AS checkin_date,phone_numbe,email
FROM (SELECT @sno:=0) AS sno,Checkin AS c
INNER JOIN User AS u ON u.user_id=c.User
INNER JOIN Login ON Login.login_id=u.login
WHERE c.venue=?;

SELECT user_id, give_name,last_name,gender,phone_numbe,
CONCAT(flat_no,', ',street_name,', ',city,', ',state) AS Address
From User
INNER JOIN Address
ON User.address = Address.address_id
INNER JOIN Login ON Login.login_id = User.login
where Login.user_type="user"
ORDER BY creation_date DESC LIMIT 10;

SELECT VenueOwner.owner_id AS Owner,give_name,last_name,gender,phone_numbe,
CONCAT(flat_no,', ',street_name,', ',city,', ',state) AS Address
From User
INNER JOIN VenueOwner
ON User.user_id=VenueOwner.user_id
INNER JOIN Address
ON User.address = Address.address_id
ORDER BY creation_date DESC
LIMIT 10;

SELECT venue_id, venue_type, venue_owner, venue_date, venue_latitude,venue_longitude,
CONCAT(flat_no,', ',street_name,', ',city,', ',state) AS Address
From Venues
INNER JOIN VenueOwner
ON VenueOwner.owner_id=Venues.venue_owner
INNER JOIN Address
ON Venues.address = Address.address_id
ORDER BY created_at DESC LIMIT 10;

SELECT Checkin.User, Checkin.venue,Checkin.checkin_time,
CONCAT(Address.flat_no,', ',Address.street_name,', ',Address.city,', ',Address.state) AS Address
From Checkin
INNER JOIN Venues
On Checkin.venue = Venues.venue_id
INNER JOIN User
On Checkin.User = User.user_id
INNER JOIN Address
ON User.address = Address.address_id
ORDER BY checkin_time DESC
LIMIT 10;

SELECT Checkin.User, Checkin.venue,Checkin.checkin_time,
CONCAT(Address.flat_no,', ',Address.street_name,', ',Address.city,', ',Address.state) AS Address
From Checkin
INNER JOIN User
On Checkin.User = User.user_id
INNER JOIN Venues
On Checkin.venue = Venues.venue_id
INNER JOIN Address
ON Venues.address = Address.address_id
ORDER BY checkin_time DESC
LIMIT 10;

SELECT venue_id, venue_type,venue_date, CONCAT(venue_latitude,' , ', venue_longitude), CONCAT(Address.flat_no,', ',Address.street_name,', ',Address.city,', ',Address.state) AS Address
FROM Venues
INNER JOIN Address
ON Venues.address = Address.address_id
ORDER BY created_at DESC
LIMIT 10;

SELECT hotspot_id,venue_id,date_start,date_stop,CONCAT(Address.flat_no,', ',Address.street_name,', ',Address.city,', ',Address.state) AS Address
FROM Hotspots
INNER JOIN Venues ON Venues.venue_id=Hotspots.venue
INNER JOIN Address
ON Venues.address = Address.address_id
ORDER BY date_stop DESC
LIMIT 10;

UPDATE Hotspots
SET date_start = ?, date_stop=?
WHERE hotspot_id= ?;

SELECT User,CONCAT(flat_no,',',street_name,',',city,',',state) AS Address,venue ,checkin_time
FROM Checkin
INNER JOIN User ON User.user_id=Checkin.User
INNER JOIN Address ON Address.address_id=User.address
WHERE User.user_id=? OR User.give_name=? OR User.last_name=? OR phone_numbe=?
ORDER BY checkin_time DESC LIMIT 10;

SELECT User,venue ,checkin_time
FROM Checkin
INNER JOIN Venues ON Venues.venue_id=Checkin.venue
WHERE venue_id=? OR venue_type=?
ORDER BY checkin_time DESC LIMIT 10;

SELECT venue_id,venue_type,venue_date,CONCAT(venue_latitude,' , ',venue_longitude) AS location,CONCAT(flat_no,',',street_name,',',city,',',state) AS Address
FROM Venues
INNER JOIN Address ON Address.address_id=Venues.address
WHERE venue_id=? OR venue_type=?
ORDER BY created_at DESC LIMIT 10;

SELECT hotspot_id,venue_id,date_start,date_stop,CONCAT(flat_no,',',street_name,',',city,',',state) AS Address
FROM Hotspots
INNER JOIN Venues ON Venues.venue_id=Hotspots.venue
INNER JOIN Address ON Address.address_id=Venues.address
WHERE hotspot_id=? OR venue_id=? OR venue_type=?
ORDER BY date_stop DESC LIMIT 10;

DELETE FROM Hotspots WHERE hotspot_id=?;

/*
sql procedure for reducing count when Recovery record accessed
*/
DELIMITER $$

CREATE PROCEDURE reducecount(
    IN ema varchar(255),
    OUT co int)
BEGIN
    SELECT count
    INTO co
    FROM Recovery
    WHERE email = ema;

    IF co <1 THEN
        DELETE FROM Recovery WHERE email=ema;
    ELSE
        UPDATE Recovery SET count=count-1;
    END IF;

END$$

DELIMITER ;


/*sql procedure to delete recovery record when count reduced to 0
*/
DELIMITER $$

CREATE PROCEDURE deleterecov(
    IN ema varchar(255))
BEGIN
    DELETE FROM Recovery WHERE email=ema;
END$$

DELIMITER ;

/*mysql trigger for recovery table input checking*/
DELIMITER $$
CREATE PROCEDURE checkentries_recovery()
BEGIN
   DELETE FROM Recovery WHERE date_create > DATE_ADD(date_create, INTERVAL 10 MINUTE);
END$$
DELIMITER ;
