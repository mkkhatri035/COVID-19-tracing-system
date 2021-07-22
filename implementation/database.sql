-- MySQL dump 10.13  Distrib 8.0.25, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: covidtracker
-- ------------------------------------------------------
-- Server version	8.0.19-0ubuntu5

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `covidtracker`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `covidtracker` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `covidtracker`;

--
-- Table structure for table `Address`
--

DROP TABLE IF EXISTS `Address`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Address` (
  `address_id` int NOT NULL AUTO_INCREMENT,
  `flat_no` varchar(10) DEFAULT NULL,
  `street_name` varchar(30) NOT NULL,
  `city` varchar(30) NOT NULL,
  `state` varchar(40) NOT NULL,
  PRIMARY KEY (`address_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10000038 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Address`
--

LOCK TABLES `Address` WRITE;
/*!40000 ALTER TABLE `Address` DISABLE KEYS */;
INSERT INTO `Address` VALUES (10000031,'123','central street','greater Adelaide','South Australia'),(10000032,'23','sang street','greater Adelaide','South Australia'),(10000033,'123','street x','greater Adelaide','South Australia'),(10000034,'12','street y','adelaide','South Australia'),(10000035,'23','street x','Adelaide','South Australia'),(10000036,'36','street n','Melbourne','Victoria'),(10000037,'56','street z','Melbourne','Victoria');
/*!40000 ALTER TABLE `Address` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Admin`
--

DROP TABLE IF EXISTS `Admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Admin` (
  `admin_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  PRIMARY KEY (`admin_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Admin_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10000007 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Admin`
--

LOCK TABLES `Admin` WRITE;
/*!40000 ALTER TABLE `Admin` DISABLE KEYS */;
INSERT INTO `Admin` VALUES (10000005,10000016),(10000006,10000017);
/*!40000 ALTER TABLE `Admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Checkin`
--

DROP TABLE IF EXISTS `Checkin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Checkin` (
  `checkin_id` int NOT NULL AUTO_INCREMENT,
  `User` int NOT NULL,
  `venue` int NOT NULL,
  `checkin_time` datetime NOT NULL,
  PRIMARY KEY (`checkin_id`),
  KEY `User` (`User`),
  KEY `venue` (`venue`),
  CONSTRAINT `Checkin_ibfk_1` FOREIGN KEY (`User`) REFERENCES `User` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `Checkin_ibfk_2` FOREIGN KEY (`venue`) REFERENCES `Venues` (`venue_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10000009 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Checkin`
--

LOCK TABLES `Checkin` WRITE;
/*!40000 ALTER TABLE `Checkin` DISABLE KEYS */;
INSERT INTO `Checkin` VALUES (10000006,10000014,10000007,'2021-06-13 08:35:29'),(10000007,10000019,10000007,'2021-06-13 09:05:19'),(10000008,10000018,10000007,'2021-06-13 09:06:20');
/*!40000 ALTER TABLE `Checkin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Hotspots`
--

DROP TABLE IF EXISTS `Hotspots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Hotspots` (
  `hotspot_id` int NOT NULL AUTO_INCREMENT,
  `venue` int NOT NULL,
  `date_start` datetime NOT NULL,
  `date_stop` datetime NOT NULL,
  PRIMARY KEY (`hotspot_id`),
  KEY `venue` (`venue`),
  CONSTRAINT `Hotspots_ibfk_1` FOREIGN KEY (`venue`) REFERENCES `Venues` (`venue_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10000003 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Hotspots`
--

LOCK TABLES `Hotspots` WRITE;
/*!40000 ALTER TABLE `Hotspots` DISABLE KEYS */;
INSERT INTO `Hotspots` VALUES (10000002,10000007,'2021-06-10 14:27:00','2021-06-12 14:27:00');
/*!40000 ALTER TABLE `Hotspots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Login`
--

DROP TABLE IF EXISTS `Login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Login` (
  `login_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `username` varchar(30) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `user_type` varchar(11) NOT NULL,
  PRIMARY KEY (`login_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=10000044 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Login`
--

LOCK TABLES `Login` WRITE;
/*!40000 ALTER TABLE `Login` DISABLE KEYS */;
INSERT INTO `Login` VALUES (10000037,'mkkhatri035@gmail.com','manish035','$argon2i$v=19$m=4096,t=3,p=1$dGy9vi9HHN7tZcTgAEIqQj6lwCN8T/KOV3QkAVZzK8s$hc7CFvt8vze6KFpDI7vevuPdOVNS2l7DUS33SMqYNM4','user'),(10000038,'tianyi1212@gmail.com','tianyi11','$argon2i$v=19$m=4096,t=3,p=1$YLydI0bKFZo4OGc2PiLOdNX7kyx+j8kQtK52DgpoYkU$zhlOyfBXTIHrEMM80IRVIxhZqK/RfWS2kP1dOjkqrGU','VenueOwner'),(10000040,'justin44@gmail.com','justin11','$argon2i$v=19$m=4096,t=3,p=1$5szbXCgz7SLfBikOAJg61utR/X4aj3AKHJ47piq6uhQ$5cXDEpUdxPlrrc3AFSaYlqAIrc0jINzctSCvVelulgY','Admin'),(10000041,'manishkk@gmail.com','manish54','$argon2i$v=19$m=4096,t=3,p=1$JnBalqvowNU9keMPrpe2D0EGni0Wyt2A6gKDT/BswzY$d/Ujp22MtGloGnYgPR3bxp6holFOfbrLXiW0MjXhD4A','Admin'),(10000042,'zoe55@gmail.com','zoe55','$argon2i$v=19$m=4096,t=3,p=1$G14S8RuclYJS4vjjhBiv2cxgJkm8aif5QAvXWQv9pI0$JSAiWaBcMMpkBax0EyYwdIetjc9JmuqZCvic7R0mznI','user'),(10000043,'tianyi034@gmail.com','tianyi34','$argon2i$v=19$m=4096,t=3,p=1$liI99W43/57950Gf38U+jAhrJSLNlGhTBM33vMi38uM$xqmtrQ0u+XfVBpg3wuEkhVKcMQp8R7Holl5Xs0GptBc','user');
/*!40000 ALTER TABLE `Login` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Recovery`
--

DROP TABLE IF EXISTS `Recovery`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Recovery` (
  `email` varchar(255) NOT NULL,
  `code` int NOT NULL,
  `count` int NOT NULL DEFAULT (3),
  `date_create` datetime NOT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Recovery`
--

LOCK TABLES `Recovery` WRITE;
/*!40000 ALTER TABLE `Recovery` DISABLE KEYS */;
/*!40000 ALTER TABLE `Recovery` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `give_name` varchar(40) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `gender` varchar(10) NOT NULL,
  `phone_numbe` decimal(13,0) NOT NULL,
  `Government_id` varchar(20) DEFAULT NULL,
  `address` int DEFAULT NULL,
  `login` int NOT NULL,
  `creation_date` datetime NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `phone_numbe` (`phone_numbe`),
  KEY `address` (`address`),
  KEY `login` (`login`),
  CONSTRAINT `User_ibfk_1` FOREIGN KEY (`address`) REFERENCES `Address` (`address_id`) ON DELETE SET NULL,
  CONSTRAINT `User_ibfk_2` FOREIGN KEY (`login`) REFERENCES `Login` (`login_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10000020 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES (10000014,'manish','khatri','Male',83685463767,NULL,10000031,10000037,'2021-06-13 08:29:00'),(10000015,'Tianyi','t','Female',38493849383,NULL,10000032,10000038,'2021-06-13 08:31:01'),(10000016,'justin','wo','Male',8978678798,NULL,10000034,10000040,'2021-06-13 08:49:10'),(10000017,'Manish ','Khatri','Male',785787785434,NULL,10000035,10000041,'2021-06-13 08:59:09'),(10000018,'Zoe','e','Female',78578983948,NULL,10000036,10000042,'2021-06-13 09:01:23'),(10000019,'Tianyi','w','Female',7685787685,NULL,10000037,10000043,'2021-06-13 09:04:01');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `VenueOwner`
--

DROP TABLE IF EXISTS `VenueOwner`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `VenueOwner` (
  `owner_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  PRIMARY KEY (`owner_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `VenueOwner_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10000005 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `VenueOwner`
--

LOCK TABLES `VenueOwner` WRITE;
/*!40000 ALTER TABLE `VenueOwner` DISABLE KEYS */;
INSERT INTO `VenueOwner` VALUES (10000004,10000015);
/*!40000 ALTER TABLE `VenueOwner` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Venues`
--

DROP TABLE IF EXISTS `Venues`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Venues` (
  `venue_id` int NOT NULL AUTO_INCREMENT,
  `venue_type` varchar(30) NOT NULL,
  `address` int NOT NULL,
  `venue_owner` int NOT NULL,
  `venue_date` datetime NOT NULL,
  `venue_latitude` decimal(10,7) NOT NULL,
  `venue_longitude` decimal(10,7) NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`venue_id`),
  KEY `address` (`address`),
  KEY `venue_owner` (`venue_owner`),
  CONSTRAINT `Venues_ibfk_1` FOREIGN KEY (`address`) REFERENCES `Address` (`address_id`) ON DELETE CASCADE,
  CONSTRAINT `Venues_ibfk_2` FOREIGN KEY (`venue_owner`) REFERENCES `VenueOwner` (`owner_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10000008 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Venues`
--

LOCK TABLES `Venues` WRITE;
/*!40000 ALTER TABLE `Venues` DISABLE KEYS */;
INSERT INTO `Venues` VALUES (10000007,'concert',10000033,10000004,'2021-06-18 14:03:00',-34.5110000,138.5995000,'2021-06-13 08:34:24');
/*!40000 ALTER TABLE `Venues` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-06-13 11:38:28
