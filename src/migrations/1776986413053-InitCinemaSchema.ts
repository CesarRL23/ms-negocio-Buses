import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCinemaSchema1776986413053 implements MigrationInterface {
    name = 'InitCinemaSchema1776986413053'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`whereabouts\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nombre\` varchar(255) NOT NULL, \`latitud\` decimal(10,7) NOT NULL, \`longitud\` decimal(10,7) NOT NULL, \`direccion\` varchar(255) NOT NULL, \`activo\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`whereabouts\``);
    }

}
