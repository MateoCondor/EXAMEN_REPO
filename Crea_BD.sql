CREATE DATABASE  IF NOT EXISTS `ticketera` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ticketera`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: ticketera
-- ------------------------------------------------------
-- Server version	8.0.45

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
-- Table structure for table `detalle_factura`
--

DROP TABLE IF EXISTS `detalle_factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_factura` (
  `id_detalle` bigint NOT NULL AUTO_INCREMENT,
  `CANTIDAD` int NOT NULL,
  `codigo_localidad` varchar(20) NOT NULL,
  `codigo_partido` varchar(20) NOT NULL,
  `precio_unitario` double NOT NULL,
  `TOTAL` double NOT NULL,
  `id_factura` bigint NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `FK_detalle_factura_id_factura` (`id_factura`),
  CONSTRAINT `FK_detalle_factura_id_factura` FOREIGN KEY (`id_factura`) REFERENCES `factura` (`id_factura`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `factura`
--

DROP TABLE IF EXISTS `factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `factura` (
  `id_factura` bigint NOT NULL AUTO_INCREMENT,
  `cedula` varchar(20) DEFAULT NULL,
  `FECHA` datetime NOT NULL,
  `IVA` double NOT NULL,
  `SUBTOTAL` double NOT NULL,
  `TOTAL` double NOT NULL,
  `forma_pago` varchar(20) DEFAULT 'EFECTIVO',
  `descuento` double DEFAULT 0.0,
  PRIMARY KEY (`id_factura`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `cedula` varchar(20) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `apellido` varchar(80) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `correo` varchar(120) DEFAULT NULL,
  PRIMARY KEY (`cedula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` varchar(20) NOT NULL,
  `cedula` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_usuario_username` (`username`),
  KEY `FK_usuario_cedula` (`cedula`),
  CONSTRAINT `FK_usuario_cedula` FOREIGN KEY (`cedula`) REFERENCES `cliente` (`cedula`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `boleto` (NEW)
--
DROP TABLE IF EXISTS `boleto`;
CREATE TABLE `boleto` (
  `id_boleto` bigint NOT NULL AUTO_INCREMENT,
  `id_factura` bigint NOT NULL,
  `codigo_partido` varchar(20) NOT NULL,
  `codigo_localidad` varchar(20) NOT NULL,
  `seccion` varchar(20) DEFAULT NULL,
  `numero_asiento` varchar(20) NOT NULL,
  `nombre_asistente` varchar(80) NOT NULL,
  `estado` varchar(20) NOT NULL DEFAULT 'COMPRADO',
  PRIMARY KEY (`id_boleto`),
  KEY `FK_boleto_factura` (`id_factura`),
  CONSTRAINT `FK_boleto_factura` FOREIGN KEY (`id_factura`) REFERENCES `factura` (`id_factura`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-19 23:40:48
CREATE DATABASE  IF NOT EXISTS `federacion` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `federacion`;
-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: federacion
-- ------------------------------------------------------
-- Server version	8.0.45

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
-- Table structure for table `estadio`
--

DROP TABLE IF EXISTS `estadio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estadio` (
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `ciudad` varchar(80) NOT NULL,
  `capacidad` int NOT NULL,
  PRIMARY KEY (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `partido_futbol`
--

DROP TABLE IF EXISTS `partido_futbol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `partido_futbol` (
  `CODIGO` varchar(20) NOT NULL,
  `equipo_local` varchar(80) NOT NULL,
  `equipo_visita` varchar(80) NOT NULL,
  `FECHA` datetime DEFAULT NULL,
  `LUGAR` varchar(120) DEFAULT NULL,
  `estadio_codigo` varchar(20) NOT NULL,
  PRIMARY KEY (`CODIGO`),
  KEY `FK_partido_futbol_estadio_codigo` (`estadio_codigo`),
  CONSTRAINT `FK_partido_futbol_estadio_codigo` FOREIGN KEY (`estadio_codigo`) REFERENCES `estadio` (`codigo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `localidad_partido`
--

DROP TABLE IF EXISTS `localidad_partido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `localidad_partido` (
  `ID` bigint NOT NULL AUTO_INCREMENT,
  `codigo_localidad` varchar(20) NOT NULL,
  `capacidad` int NOT NULL,
  `DISPONIBILIDAD` int NOT NULL,
  `PRECIO` double NOT NULL,
  `estadio_codigo` varchar(20) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_localidad_partido_estadio_codigo` (`estadio_codigo`),
  CONSTRAINT `FK_localidad_partido_estadio_codigo` FOREIGN KEY (`estadio_codigo`) REFERENCES `estadio` (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-19 23:40:48

CREATE DATABASE IF NOT EXISTS `corebancario` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `corebancario`;

DROP TABLE IF EXISTS `amortizacion`;
DROP TABLE IF EXISTS `credito`;
DROP TABLE IF EXISTS `movimiento`;
DROP TABLE IF EXISTS `cliente_bancario`;

CREATE TABLE `cliente_bancario` (
  `cedula` varchar(20) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `genero` char(1) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `num_cuenta` varchar(20) NOT NULL,
  `saldo` double NOT NULL,
  PRIMARY KEY (`cedula`),
  UNIQUE KEY `UK_cliente_cuenta` (`num_cuenta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `movimiento` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `num_cuenta` varchar(20) NOT NULL,
  `tipo` varchar(20) NOT NULL,
  `valor` double NOT NULL,
  `fecha` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_movimiento_cuenta` (`num_cuenta`),
  CONSTRAINT `FK_movimiento_cuenta` FOREIGN KEY (`num_cuenta`) REFERENCES `cliente_bancario` (`num_cuenta`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `credito` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cedula` varchar(20) NOT NULL,
  `monto` double NOT NULL,
  `plazo` int NOT NULL,
  `tasa` double NOT NULL,
  `estado` varchar(20) NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_credito_cliente` (`cedula`),
  CONSTRAINT `FK_credito_cliente` FOREIGN KEY (`cedula`) REFERENCES `cliente_bancario` (`cedula`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `amortizacion` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `credito_id` bigint NOT NULL,
  `numero_cuota` int NOT NULL,
  `valor_cuota` double NOT NULL,
  `interes` double NOT NULL,
  `capital` double NOT NULL,
  `saldo` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_amortizacion_credito` (`credito_id`),
  CONSTRAINT `FK_amortizacion_credito` FOREIGN KEY (`credito_id`) REFERENCES `credito` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
