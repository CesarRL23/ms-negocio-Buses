import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCinemaSchema1777302237034 implements MigrationInterface {
    name = 'InitCinemaSchema1777302237034'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`record\` (\`id\` int NOT NULL AUTO_INCREMENT, \`timestamp\` datetime NOT NULL, \`type\` varchar(255) NOT NULL, \`ticketId\` int NULL, \`nodoId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`record\` ADD CONSTRAINT \`FK_254d6e2f938ed663fd9dad75e70\` FOREIGN KEY (\`ticketId\`) REFERENCES \`ticket\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`record\` ADD CONSTRAINT \`FK_81f71ddeace7d7b47166fa4374c\` FOREIGN KEY (\`nodoId\`) REFERENCES \`nodo\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`record\` DROP FOREIGN KEY \`FK_81f71ddeace7d7b47166fa4374c\``);
        await queryRunner.query(`ALTER TABLE \`record\` DROP FOREIGN KEY \`FK_254d6e2f938ed663fd9dad75e70\``);
        await queryRunner.query(`DROP TABLE \`record\``);
    }

}
