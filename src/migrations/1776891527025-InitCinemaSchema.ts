import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCinemaSchema1776891527025 implements MigrationInterface {
    name = 'InitCinemaSchema1776891527025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`person\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_d2d717efd90709ebd3cb26b936\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`drivers\` (\`id\` int NOT NULL AUTO_INCREMENT, \`personId\` int NULL, UNIQUE INDEX \`REL_bffacbd6aa6409e21c2e63e993\` (\`personId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`company\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`nit\` varchar(255) NOT NULL, \`activo\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`buses\` (\`id\` int NOT NULL AUTO_INCREMENT, \`placa\` varchar(255) NOT NULL, \`modelo\` varchar(255) NOT NULL, \`capacidad\` int NOT NULL, \`marca\` varchar(255) NOT NULL, \`estado\` varchar(255) NOT NULL, \`company_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`gps\` (\`id\` int NOT NULL AUTO_INCREMENT, \`codigo\` varchar(255) NOT NULL, \`latitud\` int NOT NULL, \`longitud\` int NOT NULL, \`busId\` int NULL, UNIQUE INDEX \`REL_3ee73b40fa14ab3a700b131318\` (\`busId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`citizen\` (\`id\` int NOT NULL AUTO_INCREMENT, \`personId\` int NULL, UNIQUE INDEX \`REL_fe5e7aaefa9ff2e43496520e9b\` (\`personId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`company_driver\` (\`company_id\` int NOT NULL, \`driver_id\` int NOT NULL, INDEX \`IDX_a55ce89f8b586e189b0b3719ae\` (\`company_id\`), INDEX \`IDX_7afe88f92cb53ccbb5a73d3aac\` (\`driver_id\`), PRIMARY KEY (\`company_id\`, \`driver_id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`drivers\` ADD CONSTRAINT \`FK_bffacbd6aa6409e21c2e63e9930\` FOREIGN KEY (\`personId\`) REFERENCES \`person\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`buses\` ADD CONSTRAINT \`FK_a9cd6731c6743aa554ad0e3912b\` FOREIGN KEY (\`company_id\`) REFERENCES \`company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`gps\` ADD CONSTRAINT \`FK_3ee73b40fa14ab3a700b1313189\` FOREIGN KEY (\`busId\`) REFERENCES \`buses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`citizen\` ADD CONSTRAINT \`FK_fe5e7aaefa9ff2e43496520e9b4\` FOREIGN KEY (\`personId\`) REFERENCES \`person\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`company_driver\` ADD CONSTRAINT \`FK_a55ce89f8b586e189b0b3719ae1\` FOREIGN KEY (\`company_id\`) REFERENCES \`company\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`company_driver\` ADD CONSTRAINT \`FK_7afe88f92cb53ccbb5a73d3aaca\` FOREIGN KEY (\`driver_id\`) REFERENCES \`drivers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`company_driver\` DROP FOREIGN KEY \`FK_7afe88f92cb53ccbb5a73d3aaca\``);
        await queryRunner.query(`ALTER TABLE \`company_driver\` DROP FOREIGN KEY \`FK_a55ce89f8b586e189b0b3719ae1\``);
        await queryRunner.query(`ALTER TABLE \`citizen\` DROP FOREIGN KEY \`FK_fe5e7aaefa9ff2e43496520e9b4\``);
        await queryRunner.query(`ALTER TABLE \`gps\` DROP FOREIGN KEY \`FK_3ee73b40fa14ab3a700b1313189\``);
        await queryRunner.query(`ALTER TABLE \`buses\` DROP FOREIGN KEY \`FK_a9cd6731c6743aa554ad0e3912b\``);
        await queryRunner.query(`ALTER TABLE \`drivers\` DROP FOREIGN KEY \`FK_bffacbd6aa6409e21c2e63e9930\``);
        await queryRunner.query(`DROP INDEX \`IDX_7afe88f92cb53ccbb5a73d3aac\` ON \`company_driver\``);
        await queryRunner.query(`DROP INDEX \`IDX_a55ce89f8b586e189b0b3719ae\` ON \`company_driver\``);
        await queryRunner.query(`DROP TABLE \`company_driver\``);
        await queryRunner.query(`DROP INDEX \`REL_fe5e7aaefa9ff2e43496520e9b\` ON \`citizen\``);
        await queryRunner.query(`DROP TABLE \`citizen\``);
        await queryRunner.query(`DROP INDEX \`REL_3ee73b40fa14ab3a700b131318\` ON \`gps\``);
        await queryRunner.query(`DROP TABLE \`gps\``);
        await queryRunner.query(`DROP TABLE \`buses\``);
        await queryRunner.query(`DROP TABLE \`company\``);
        await queryRunner.query(`DROP INDEX \`REL_bffacbd6aa6409e21c2e63e993\` ON \`drivers\``);
        await queryRunner.query(`DROP TABLE \`drivers\``);
        await queryRunner.query(`DROP INDEX \`IDX_d2d717efd90709ebd3cb26b936\` ON \`person\``);
        await queryRunner.query(`DROP TABLE \`person\``);
    }

}
