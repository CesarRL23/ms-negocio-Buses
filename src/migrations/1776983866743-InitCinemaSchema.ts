import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCinemaSchema1776983866743 implements MigrationInterface {
    name = 'InitCinemaSchema1776983866743'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`route\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`origen\` varchar(255) NOT NULL, \`destino\` varchar(255) NOT NULL, \`distancia\` int NOT NULL, \`duracion_estimada\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`route\``);
    }

}
