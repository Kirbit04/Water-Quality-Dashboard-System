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
-- Table structure for table `model_results`
--

DROP TABLE IF EXISTS `model_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `model_results` (
  `result_id` int NOT NULL AUTO_INCREMENT,
  `test_id` int DEFAULT NULL,
  `wqi_score` float DEFAULT NULL,
  `health_score` float DEFAULT NULL,
  `risk_level` varchar(30) DEFAULT NULL,
  `ml_confidence` float DEFAULT NULL,
  `analysis_date` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`result_id`),
  UNIQUE KEY `test_id` (`test_id`),
  CONSTRAINT `model_results_ibfk_1` FOREIGN KEY (`test_id`) REFERENCES `lab_tests` (`test_id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `model_results`
--

LOCK TABLES `model_results` WRITE;
/*!40000 ALTER TABLE `model_results` DISABLE KEYS */;
INSERT INTO `model_results` VALUES (2,13,68.31,38,'High Risk',96.5,'2026-03-17 11:37:49'),(3,11,62.32,45.2,'High Risk',50.3,'2026-03-17 11:43:22'),(4,9,64.03,43.2,'High Risk',47.8,'2026-03-17 12:23:13'),(5,7,59.78,48.3,'High Risk',51.3,'2026-03-17 12:31:22'),(7,14,76.01,29.2,'Critical Risk',93.7,'2026-03-17 12:35:12'),(9,15,76.21,29,'Critical Risk',98,'2026-03-17 13:23:16'),(10,16,56.83,51.8,'High Risk',57.1,'2026-03-17 13:32:54'),(12,17,62.88,44.5,'High Risk',51.4,'2026-03-18 13:52:11'),(14,18,61.53,46.2,'High Risk',50.8,'2026-03-23 14:45:47'),(16,19,67.7,38.8,'High Risk',49.3,'2026-03-23 15:07:55'),(17,20,47.51,63,'Moderate Risk',49.7,'2026-03-27 08:32:24'),(19,21,75.28,29.8,'Critical Risk',48.8,'2026-03-27 08:49:36'),(21,22,75.84,29.3,'Critical Risk',51.2,'2026-03-27 14:43:09'),(23,23,64.17,43,'High Risk',79.5,'2026-04-03 17:27:32'),(25,24,61.28,46.5,'High Risk',49.6,'2026-05-07 09:08:59'),(27,25,80.2,25.8,'Critical Risk',55.9,'2026-05-12 19:29:43'),(30,26,45.94,64.9,'Moderate Risk',59.1,'2026-05-18 08:42:52'),(31,27,53.2,56.2,'High Risk',54,'2026-05-18 09:01:58'),(33,28,70.7,35.2,'High Risk',58.2,'2026-05-20 09:21:53'),(34,29,79.31,26.6,'Critical Risk',58.1,'2026-05-20 14:59:12'),(36,30,68.19,38.2,'High Risk',53.8,'2026-05-21 15:28:05'),(38,31,79.36,26.5,'Critical Risk',58.2,'2026-06-01 17:37:21'),(39,32,70.21,35.7,'High Risk',83.4,'2026-06-11 05:38:32'),(41,33,79.62,26.3,'Critical Risk',80.8,'2026-06-11 06:42:38'),(43,8,71.63,34,'High Risk',79.5,'2026-06-11 18:31:44'),(44,34,46.04,64.8,'Moderate Risk',81.9,'2026-06-11 18:38:56'),(46,35,46.51,64.2,'Moderate Risk',79.5,'2026-06-12 10:40:34'),(48,36,72.22,33.3,'High Risk',81.6,'2026-06-12 11:01:08'),(49,37,83.08,23.5,'Critical Risk',80.3,'2026-06-14 15:31:39'),(50,38,72.8,32.6,'High Risk',80.2,'2026-06-15 05:03:03'),(51,39,74.61,30.5,'High Risk',80.3,'2026-06-15 05:19:29'),(54,40,68.76,37.5,'High Risk',86.5,'2026-06-15 06:26:13'),(55,41,78.5,27.2,'Critical Risk',73.4,'2026-06-16 05:55:22'),(56,42,69.94,36.1,'High Risk',85.2,'2026-06-16 07:48:32');
/*!40000 ALTER TABLE `model_results` ENABLE KEYS */;
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
