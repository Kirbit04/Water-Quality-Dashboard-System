-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: aquaguard
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `lab_tests`
--

DROP TABLE IF EXISTS `lab_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_tests` (
  `test_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `date_of_test` date DEFAULT NULL,
  `ph` float DEFAULT NULL,
  `turbidity` float DEFAULT NULL,
  `dissolved_oxygen` float DEFAULT NULL,
  `nitrates` float DEFAULT NULL,
  `phosphates` float DEFAULT NULL,
  `salinity` float DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `occupation` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`test_id`),
  KEY `user_id` (`user_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `lab_tests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `lab_tests_ibfk_2` FOREIGN KEY (`location_id`) REFERENCES `locations` (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_tests`
--

LOCK TABLES `lab_tests` WRITE;
/*!40000 ALTER TABLE `lab_tests` DISABLE KEYS */;
INSERT INTO `lab_tests` VALUES (1,1,2,'2026-01-14',7.2,0.8,8.5,1.5,0.05,250,'2026-03-08 13:53:51','Water Supplier'),(2,1,3,'2026-03-08',3.2,1.9,2.6,1.9,0.19,138,'2026-03-08 14:01:05','Farmer'),(3,1,3,'2026-01-15',10.8,3.9,4.4,2.8,0.18,191,'2026-03-10 11:52:04','Local'),(4,1,3,'2026-03-11',3.6,4,2.8,6.1,0.71,125,'2026-03-11 05:19:13','Farmer'),(5,1,2,'2026-01-16',4.1,2.9,7,3.4,0.26,375,'2026-03-12 13:22:57','Farmer'),(6,1,1,'2026-01-03',9.6,4.8,4.9,15.6,1.09,371,'2026-03-12 13:29:18','Water Supplier'),(7,20,3,'2026-01-08',8.5,1.9,7.8,17.5,0.19,350,'2026-03-12 14:07:44','Farmer'),(8,2,2,'2026-01-15',8.9,4.5,9,6.8,0.78,337,'2026-03-12 14:50:12','Farmer'),(9,12,1,'2026-01-02',10.9,11.9,7.5,0.9,1.08,241,'2026-03-12 14:55:14','Water Supplier'),(10,12,2,'2026-01-15',12,6.7,7.8,9,1.9,257,'2026-03-16 14:21:26','Farmer'),(11,17,2,'2026-01-15',12,4.5,9,3.4,1.9,257,'2026-03-16 14:22:40','Farmer'),(12,17,2,'2026-01-15',9,7.8,3.5,4.5,1.9,157,'2026-03-16 16:46:19','Farmer'),(13,16,1,'2026-01-10',2.5,1.8,2.4,4.5,1.02,896,'2026-03-17 11:37:48','Local'),(14,12,1,'2026-01-16',3.4,7.8,2.6,5.7,1.08,563,'2026-03-17 12:35:11','Farmer'),(15,13,1,'2026-03-17',4.5,8.8,2,4.7,1.88,483,'2026-03-17 13:23:15','Water Supplier'),(16,13,1,'2026-03-17',6.7,4.5,2.3,7.9,9.08,150,'2026-03-17 13:32:54','Water Supplier'),(17,10,3,'2026-02-19',5.6,4,9,0.8,0.98,678,'2026-03-18 13:52:10','Farmer'),(18,16,2,'2026-03-23',6,9.7,9,14.5,1.8,739,'2026-03-23 14:45:46','Farmer'),(19,15,1,'2026-03-23',3.5,6.3,6,5.9,9.78,181,'2026-03-23 15:07:54','Livestock Farmer'),(20,23,3,'2026-03-27',4.5,0.8,9,4.5,9,145,'2026-03-27 08:32:23','Farmer'),(21,6,1,'2026-03-27',5.8,6.7,7.8,67,8,456,'2026-03-27 08:49:35','Local'),(22,21,2,'2026-03-27',3.4,5.6,4.5,15.9,9.78,567,'2026-03-27 14:43:08','Livestock Farmer'),(23,24,1,'2026-04-03',6.7,305,2.5,18.9,10.92,807,'2026-04-03 17:27:31','Farmer'),(24,12,1,'2026-05-07',5.9,67,9.4,7.8,7.09,886,'2026-05-07 09:08:58','Farmer'),(25,21,1,'2026-05-12',3.6,78,4.5,9.7,9.76,69008,'2026-05-12 19:29:42','Farmer'),(26,25,1,'2026-05-18',6.8,12.5,6.4,3.2,0.45,0.32,'2026-05-18 08:42:51','Water Supplier'),(27,25,1,'2026-05-18',7.1,45.2,5.9,6.8,0.75,1020,'2026-05-18 09:01:57','Water Supplier'),(28,25,1,'2026-05-20',5.7,67,9.6,16.9,4.57,7500,'2026-05-20 09:21:52','Water Supplier'),(29,25,1,'2026-05-20',9.8,78,4.9,9,5.78,14550,'2026-05-20 14:59:11','Water Supplier'),(30,25,1,'2026-05-21',5.6,7.9,5.8,14.9,9.06,17.4,'2026-05-21 15:28:04','Water Supplier'),(31,16,2,'2026-06-01',2.5,47,4.5,6.89,3.04,56,'2026-06-01 17:37:20','Farmer'),(32,20,1,'2026-06-11',4.5,41,8.7,1.46,1.87,29,'2026-06-11 05:38:31','Farmer'),(33,20,1,'2026-06-11',14,20,1,10,10,10,'2026-06-11 06:42:37','Farmer'),(34,2,2,'2026-06-11',6.8,12.5,6.4,3.2,0.45,0.32,'2026-06-11 18:38:55','Farmer'),(35,2,2,'2026-06-12',7.1,45.2,5.9,6.8,0.72,0.31,'2026-06-12 10:40:33','Farmer'),(36,10,3,'2026-06-12',2.4,3.2,3.2,2.1,0.27,17,'2026-06-12 11:01:07','Farmer'),(37,25,1,'2026-06-14',10.5,35,3.4,17.9,4.09,25.6,'2026-06-14 15:31:38','Farmer'),(38,25,1,'2026-06-15',4.5,23,2.7,7.09,1.74,0.89,'2026-06-15 05:03:02','Farmer'),(39,25,1,'2026-06-15',5.6,45,2.4,9.5,1.9,7,'2026-06-15 05:19:28','Farmer'),(40,20,2,'2026-06-15',3.4,12,4.5,3.89,1.03,0.89,'2026-06-15 06:26:12','Farmer'),(41,26,2,'2026-06-16',2.5,18.7,1.1,3.6,8.71,12.9,'2026-06-16 05:55:21','Water Supplier'),(42,20,1,'2026-06-16',2.6,13.6,4.5,6.7,7.04,1.9,'2026-06-16 07:48:30','Farmer');
/*!40000 ALTER TABLE `lab_tests` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-23 20:09:18
