import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCinemaSchema1777394674331 implements MigrationInterface {
    name = 'InitCinemaSchema1777394674331'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`gps\` (\`id\` int NOT NULL AUTO_INCREMENT, \`codigo\` varchar(255) NOT NULL, \`latitud\` int NOT NULL, \`longitud\` int NOT NULL, \`busId\` int NULL, UNIQUE INDEX \`REL_3ee73b40fa14ab3a700b131318\` (\`busId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`person\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`userId\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`shift\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fecha\` datetime NOT NULL, \`hora_inicio\` datetime NOT NULL, \`hora_fin\` datetime NOT NULL, \`estado\` varchar(255) NOT NULL, \`driver_id\` int NULL, \`bus_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`drivers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`personId\` int NULL, UNIQUE INDEX \`REL_bffacbd6aa6409e21c2e63e993\` (\`personId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`company_driver\` (\`id\` int NOT NULL AUTO_INCREMENT, \`company_id\` int NULL, \`driver_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`company\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`nit\` varchar(255) NOT NULL, \`activo\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`buses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`placa\` varchar(255) NOT NULL, \`modelo\` varchar(255) NOT NULL, \`capacidad\` int NOT NULL, \`marca\` varchar(255) NOT NULL, \`estado\` varchar(255) NOT NULL, \`company_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`programming\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fechaInicio\` datetime NOT NULL, \`fechaFin\` datetime NOT NULL, \`horaSalida\` varchar(255) NOT NULL, \`horaLlegada\` varchar(255) NOT NULL, \`activo\` tinyint NOT NULL DEFAULT 1, \`routeId\` int NULL, \`busId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`route\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`origen\` varchar(255) NOT NULL, \`destino\` varchar(255) NOT NULL, \`distancia\` int NOT NULL, \`duracion_estimada\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`whereabouts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`latitud\` decimal(10,7) NOT NULL, \`longitud\` decimal(10,7) NOT NULL, \`direccion\` varchar(255) NOT NULL, \`activo\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`nodo\` (\`id\` int NOT NULL AUTO_INCREMENT, \`orden\` int NOT NULL, \`distanciaDesdeAnterior\` int NOT NULL, \`tiempoEstimadoDesdeAnterior\` int NOT NULL, \`stopId\` int NULL, \`routeId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`record\` (\`id\` int NOT NULL AUTO_INCREMENT, \`timestamp\` datetime NOT NULL, \`type\` varchar(255) NOT NULL, \`ticketId\` int NULL, \`nodoId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`address\` (\`id\` int NOT NULL AUTO_INCREMENT, \`street\` varchar(255) NOT NULL, \`number\` varchar(255) NOT NULL, \`neighborhood\` varchar(255) NOT NULL, \`city\` varchar(255) NOT NULL, \`additionalInfo\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`citizen\` (\`id\` int NOT NULL AUTO_INCREMENT, \`personId\` int NULL, \`addressId\` int NULL, UNIQUE INDEX \`REL_fe5e7aaefa9ff2e43496520e9b\` (\`personId\`), UNIQUE INDEX \`REL_0c69c46d7439a0988bd7aa3d96\` (\`addressId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payment_method\` (\`id\` int NOT NULL AUTO_INCREMENT, \`type\` varchar(255) NOT NULL, \`provider\` varchar(255) NULL, \`accountNumber\` varchar(255) NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`citizen_payment_method\` (\`id\` int NOT NULL AUTO_INCREMENT, \`citizenId\` int NOT NULL, \`paymentMethodId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ticket\` (\`id\` int NOT NULL AUTO_INCREMENT, \`codigo\` varchar(255) NOT NULL, \`precio\` int NOT NULL, \`fechaCompra\` datetime NOT NULL, \`FechaUso\` datetime NOT NULL, \`estado\` varchar(255) NOT NULL, \`metodoPago\` varchar(255) NOT NULL, \`citizenPaymentMethodId\` int NULL, \`programmingId\` int NULL, UNIQUE INDEX \`IDX_11273686d31183dc7e5982be1c\` (\`codigo\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`gps\` ADD CONSTRAINT \`FK_3ee73b40fa14ab3a700b1313189\` FOREIGN KEY (\`busId\`) REFERENCES \`buses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD CONSTRAINT \`FK_9faf1c5627aa1df8a600367a85b\` FOREIGN KEY (\`driver_id\`) REFERENCES \`drivers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD CONSTRAINT \`FK_21e627d03ab6681266ddb5cf252\` FOREIGN KEY (\`bus_id\`) REFERENCES \`buses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`drivers\` ADD CONSTRAINT \`FK_bffacbd6aa6409e21c2e63e9930\` FOREIGN KEY (\`personId\`) REFERENCES \`person\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`company_driver\` ADD CONSTRAINT \`FK_a55ce89f8b586e189b0b3719ae1\` FOREIGN KEY (\`company_id\`) REFERENCES \`company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`company_driver\` ADD CONSTRAINT \`FK_7afe88f92cb53ccbb5a73d3aaca\` FOREIGN KEY (\`driver_id\`) REFERENCES \`drivers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`buses\` ADD CONSTRAINT \`FK_a9cd6731c6743aa554ad0e3912b\` FOREIGN KEY (\`company_id\`) REFERENCES \`company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`programming\` ADD CONSTRAINT \`FK_b5974390cfc52cfc3c3114f5916\` FOREIGN KEY (\`routeId\`) REFERENCES \`route\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`programming\` ADD CONSTRAINT \`FK_e9c918906f9719bce40aef5c76c\` FOREIGN KEY (\`busId\`) REFERENCES \`buses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nodo\` ADD CONSTRAINT \`FK_538f08b9edb8e40b99c6789c336\` FOREIGN KEY (\`stopId\`) REFERENCES \`whereabouts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`nodo\` ADD CONSTRAINT \`FK_8fbc12660db7608fbdad165984a\` FOREIGN KEY (\`routeId\`) REFERENCES \`route\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`record\` ADD CONSTRAINT \`FK_254d6e2f938ed663fd9dad75e70\` FOREIGN KEY (\`ticketId\`) REFERENCES \`ticket\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`record\` ADD CONSTRAINT \`FK_81f71ddeace7d7b47166fa4374c\` FOREIGN KEY (\`nodoId\`) REFERENCES \`nodo\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`citizen\` ADD CONSTRAINT \`FK_fe5e7aaefa9ff2e43496520e9b4\` FOREIGN KEY (\`personId\`) REFERENCES \`person\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`citizen\` ADD CONSTRAINT \`FK_0c69c46d7439a0988bd7aa3d968\` FOREIGN KEY (\`addressId\`) REFERENCES \`address\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`citizen_payment_method\` ADD CONSTRAINT \`FK_e5fd3e621993ed00d11009c8a64\` FOREIGN KEY (\`citizenId\`) REFERENCES \`citizen\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`citizen_payment_method\` ADD CONSTRAINT \`FK_26a118b02f0f22875c4ce99893b\` FOREIGN KEY (\`paymentMethodId\`) REFERENCES \`payment_method\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_d180dc4b0eb0a210fdcd2bbeef0\` FOREIGN KEY (\`programmingId\`) REFERENCES \`programming\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_3d6d0082ae5ccae48c9a2fe1bab\` FOREIGN KEY (\`citizenPaymentMethodId\`) REFERENCES \`citizen_payment_method\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_3d6d0082ae5ccae48c9a2fe1bab\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_d180dc4b0eb0a210fdcd2bbeef0\``);
        await queryRunner.query(`ALTER TABLE \`citizen_payment_method\` DROP FOREIGN KEY \`FK_26a118b02f0f22875c4ce99893b\``);
        await queryRunner.query(`ALTER TABLE \`citizen_payment_method\` DROP FOREIGN KEY \`FK_e5fd3e621993ed00d11009c8a64\``);
        await queryRunner.query(`ALTER TABLE \`citizen\` DROP FOREIGN KEY \`FK_0c69c46d7439a0988bd7aa3d968\``);
        await queryRunner.query(`ALTER TABLE \`citizen\` DROP FOREIGN KEY \`FK_fe5e7aaefa9ff2e43496520e9b4\``);
        await queryRunner.query(`ALTER TABLE \`record\` DROP FOREIGN KEY \`FK_81f71ddeace7d7b47166fa4374c\``);
        await queryRunner.query(`ALTER TABLE \`record\` DROP FOREIGN KEY \`FK_254d6e2f938ed663fd9dad75e70\``);
        await queryRunner.query(`ALTER TABLE \`nodo\` DROP FOREIGN KEY \`FK_8fbc12660db7608fbdad165984a\``);
        await queryRunner.query(`ALTER TABLE \`nodo\` DROP FOREIGN KEY \`FK_538f08b9edb8e40b99c6789c336\``);
        await queryRunner.query(`ALTER TABLE \`programming\` DROP FOREIGN KEY \`FK_e9c918906f9719bce40aef5c76c\``);
        await queryRunner.query(`ALTER TABLE \`programming\` DROP FOREIGN KEY \`FK_b5974390cfc52cfc3c3114f5916\``);
        await queryRunner.query(`ALTER TABLE \`buses\` DROP FOREIGN KEY \`FK_a9cd6731c6743aa554ad0e3912b\``);
        await queryRunner.query(`ALTER TABLE \`company_driver\` DROP FOREIGN KEY \`FK_7afe88f92cb53ccbb5a73d3aaca\``);
        await queryRunner.query(`ALTER TABLE \`company_driver\` DROP FOREIGN KEY \`FK_a55ce89f8b586e189b0b3719ae1\``);
        await queryRunner.query(`ALTER TABLE \`drivers\` DROP FOREIGN KEY \`FK_bffacbd6aa6409e21c2e63e9930\``);
        await queryRunner.query(`ALTER TABLE \`shift\` DROP FOREIGN KEY \`FK_21e627d03ab6681266ddb5cf252\``);
        await queryRunner.query(`ALTER TABLE \`shift\` DROP FOREIGN KEY \`FK_9faf1c5627aa1df8a600367a85b\``);
        await queryRunner.query(`ALTER TABLE \`gps\` DROP FOREIGN KEY \`FK_3ee73b40fa14ab3a700b1313189\``);
        await queryRunner.query(`DROP INDEX \`IDX_11273686d31183dc7e5982be1c\` ON \`ticket\``);
        await queryRunner.query(`DROP TABLE \`ticket\``);
        await queryRunner.query(`DROP TABLE \`citizen_payment_method\``);
        await queryRunner.query(`DROP TABLE \`payment_method\``);
        await queryRunner.query(`DROP INDEX \`REL_0c69c46d7439a0988bd7aa3d96\` ON \`citizen\``);
        await queryRunner.query(`DROP INDEX \`REL_fe5e7aaefa9ff2e43496520e9b\` ON \`citizen\``);
        await queryRunner.query(`DROP TABLE \`citizen\``);
        await queryRunner.query(`DROP TABLE \`address\``);
        await queryRunner.query(`DROP TABLE \`record\``);
        await queryRunner.query(`DROP TABLE \`nodo\``);
        await queryRunner.query(`DROP TABLE \`whereabouts\``);
        await queryRunner.query(`DROP TABLE \`route\``);
        await queryRunner.query(`DROP TABLE \`programming\``);
        await queryRunner.query(`DROP TABLE \`buses\``);
        await queryRunner.query(`DROP TABLE \`company\``);
        await queryRunner.query(`DROP TABLE \`company_driver\``);
        await queryRunner.query(`DROP INDEX \`REL_bffacbd6aa6409e21c2e63e993\` ON \`drivers\``);
        await queryRunner.query(`DROP TABLE \`drivers\``);
        await queryRunner.query(`DROP TABLE \`shift\``);
        await queryRunner.query(`DROP TABLE \`person\``);
        await queryRunner.query(`DROP INDEX \`REL_3ee73b40fa14ab3a700b131318\` ON \`gps\``);
        await queryRunner.query(`DROP TABLE \`gps\``);
    }

}
