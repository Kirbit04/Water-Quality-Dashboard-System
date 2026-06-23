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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `hashed_password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Test User','test@example.com','Just@wry','user','2026-01-28 10:31:32','+254123456789',1),(2,'Jonathan Doerthy','john.doe@gmail.com','$2b$12$wrwVwUPyd9ngcgTrjUDkE.umYDkxWGMAkJ6waG0GwP2pxWqQaM.Pm','user','2026-02-25 15:03:07','+254115706425',1),(4,'Abigael Kibet','kibetabigael@gmail.com','$2b$12$hWy4LaZbDTPiw6D5myghlOLjYelyn3o9fwKsuV1fJQUBVFQo2pibO','admin','2026-02-26 13:39:53','+254114071084',1),(5,'Mark Njau','mnjau@gmail.com','$2b$12$iza3w8FQzNoPVFxvuXFdR.iUkeDKcL2gZ4Ye00CWuWJK5cFmRTw1O','user','2026-02-27 12:09:48','+254780653421',1),(6,'Katherine Bryant','kate.brye@gmail.com','$2b$12$InrVxcs88mNR8pwdTQiDVee1pvVyloDOCvOuHj6Lw4Ab8VlnghuwK','user','2026-03-06 14:49:37','+254116548790',1),(8,'Carol June','caroljune@gmail.com','$2b$12$AK7ibBugkzt8LYkqom9XMO7jSXxlsXjR0SydqBqq3JIQkYhQ/FG/e','user','2026-03-08 15:52:46','+254710963458',1),(9,'Sasha Pharrel','sashaphar@gmail.com','$2b$12$LPj4GjkClFUaYGd19N.Ve.B.xy2/57DR3xVuzLcP4LgZm6byj/sGC','user','2026-03-09 11:27:19','+254734289012',1),(10,'Joseph Graham','joseph.graham@gmail.com','$2b$12$Ryd9VBfRiXEXp2hHjFRe4.r0v301uQNl2UXTjFoi9bhilbDclecVq','user','2026-03-10 11:53:44','+254765313421',1),(11,'Sandra Mutei','sandymutei@gmail.com','$2b$12$KN5KO1Ea2XcTpkXVXTdlUu.AhLI5IGSdKFpZP9r6xcaKe4DjoYlE6','user','2026-03-11 04:54:19','+254754389065',1),(12,'Isaac Njogu','isaacnk@gmail.com','$2b$12$QbY82WwGzYDh04hhjLMWUOhjXLXlyiE9ozfqKN4o8XccPQ6RShDhq','user','2026-03-11 04:56:08','+254789075634',1),(13,'Justin Doerth','Justin@gmail.com','$2b$12$aZKuyred.PgnFkiuC/N9KeAVBh./SDLprxr8pcmRrsJyhCVYO3TDG','user','2026-03-11 04:57:53','+254789765401',1),(14,'Sophie Marara','sophie.m@gmail.com','$2b$12$T1CKLigMx7.LL5mIHMyHP.VcFiS1lJvXANCKImM8uR3GZpTDMifWm','user','2026-03-11 05:01:13','+254780965734',1),(15,'Lazarus Moira','lazaro90@gmail.com','$2b$12$uM/KfTDn9l8bgn9/Xzs5n.m42xJRA98TMwcKILaSvSkPVK70Vtn8.','user','2026-03-11 05:02:25','+254115367890',1),(16,'Aaron Pratt','aaron.pratt@gmail.com','$2b$12$TFHmM4EUL175PNKv2Yl5Z.VuxAjn9S.o913UcHQC/nrwOrVE4puH2','user','2026-03-11 05:04:02','+254780457843',1),(17,'Alex Kirwa','alex.kirwa@gmail.com','$2b$12$jfPkgjXzF4POJQovBRtciueO/VKs4t1LuJ.y7Ql7UVZrScgMpz/Xy','user','2026-03-11 05:06:49','+254134890543',1),(18,'Leila Kimotho','leila.kimotho@gmail.com','$2b$12$XOZfuwi9KCoyn7dFI1/9remGr2TU.NqmqKLdMqzRBhWrDjEotpHbC','user','2026-03-11 05:08:05','+254118092145',1),(19,'Stevie Kamau','stevie.kamau@gmail.com','$2b$12$5DDbOTgKoGSiverGFBRPfeDjAhekhKULJLgFMIcYt8ebJGm0zjKaa','user','2026-03-11 05:09:36','+254789064512',1),(20,'Harimu Sonar','harimu.sonar@gmail.com','$2b$12$Q5KYsDTy2..rXWsBMLjgMOs.o0C0Lx4Cm2nepYQHwWBAIflYFY0mS','user','2026-03-11 05:11:41','+254113807459',1),(21,'Aster Wanjama','aster.wanjama@gmail.com','$2b$12$GRhJ1QD7XPwzRPcBNqRozOsMt7/ucb093ZGskf4dK1oFuKnPkxUUm','user','2026-03-11 05:13:24','+254722352819',1),(22,'Ronald Ngala','ronald.ngala@gmail.com','$2b$12$ZrIdVaKMKkRV3rvOgbb67e1InNwpsxKWlOJHVEUqOzB4pluEnsvCS','user','2026-03-11 05:14:56','+254709542310',1),(23,'Mercy Njoroge','mnjoroge@gmail.com','$2b$12$8E8Ch9gnIxzZQSQ5VI1Rw.z./u5a2lj3N.FPef05bLV7ue8eO5MVW','user','2026-03-27 08:15:53','+254117097856',1),(24,'Sophie Wanjenga','sophie.wn@gmail.com','$2b$12$Sce1T0otGG0us0umDcPflOZNYyuC7qvGsXrR5B8jXGs62Rje7cbDC','user','2026-04-02 16:59:51','+254789076534',1),(25,'Agatha Kimani','agatha.kimani@gmail.com','$2b$12$VBKTaoLlyVNP2fPsUE31Ne5AwmPYQidRy4ho4COVW8eNru0UNTQji','user','2026-05-18 07:55:42','+254145097524',1),(26,'Eugene Kajembe','eugo05@gmail.com','$2b$12$M46PDgqxSrvRyc1cmhQ1rePtCTEkr7Q1oiFBY2/iQBuV71Np/DTP2','user','2026-06-16 05:49:22','+254709456872',1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
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
