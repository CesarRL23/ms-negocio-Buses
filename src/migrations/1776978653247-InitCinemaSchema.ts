import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCinemaSchema1776978653247 implements MigrationInterface {
    name = 'InitCinemaSchema1776978653247'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`shift\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fecha\` datetime NOT NULL, \`hora_inicio\` datetime NOT NULL, \`hora_fin\` datetime NOT NULL, \`estado\` varchar(255) NOT NULL, \`driver_id\` int NULL, \`bus_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD CONSTRAINT \`FK_9faf1c5627aa1df8a600367a85b\` FOREIGN KEY (\`driver_id\`) REFERENCES \`drivers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`shift\` ADD CONSTRAINT \`FK_21e627d03ab6681266ddb5cf252\` FOREIGN KEY (\`bus_id\`) REFERENCES \`buses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`shift\` DROP FOREIGN KEY \`FK_21e627d03ab6681266ddb5cf252\``);
        await queryRunner.query(`ALTER TABLE \`shift\` DROP FOREIGN KEY \`FK_9faf1c5627aa1df8a600367a85b\``);
        await queryRunner.query(`DROP TABLE \`shift\``);
    }

}
