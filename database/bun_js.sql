/*
SQLyog Ultimate v13.1.1 (64 bit)
MySQL - 10.11.13-MariaDB-0ubuntu0.24.04.1 : Database - bun_js
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`bun_js` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `bun_js`;

/*Table structure for table `activity_log` */

DROP TABLE IF EXISTS `activity_log`;

CREATE TABLE `activity_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `app_name` varchar(255) DEFAULT NULL,
  `log_name` varchar(255) DEFAULT NULL,
  `message` longtext DEFAULT NULL,
  `event` varchar(255) DEFAULT NULL,
  `properties` longtext DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=160 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `activity_log` */

insert  into `activity_log`(`id`,`app_name`,`log_name`,`message`,`event`,`properties`,`created_at`,`updated_at`) values 
(157,'SHS','SCDRR','SCDRR has less than 7 columns','Error','[\"s\"]','2025-06-24 11:11:15','2025-06-24 11:11:15'),
(158,'SHS','SCDRR','SCDRR has less than 7 columns','Error','[\"s\"]','2025-06-24 13:20:52','2025-06-24 13:20:52'),
(159,'SHS','SCDRR','SCDRR has less than 7 columns','Error','[\"\\u001a\"]','2025-06-24 13:23:14','2025-06-24 13:23:14');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
