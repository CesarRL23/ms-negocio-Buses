import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCinemaSchema1777254393604 implements MigrationInterface {
    name = 'InitCinemaSchema1777254393604'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`programming\` (\`id\` int NOT NULL AUTO_INCREMENT, \`fechaInicio\` datetime NOT NULL, \`fechaFin\` datetime NOT NULL, \`horaSalida\` varchar(255) NOT NULL, \`horaLlegada\` varchar(255) NOT NULL, \`activo\` tinyint NOT NULL DEFAULT 1, \`route_id\` int NULL, \`bus_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`programming\` ADD CONSTRAINT \`FK_939b3d173b9a278bce1f6e78957\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`programming\` ADD CONSTRAINT \`FK_0a300f9d9afb9c255c24395ce0e\` FOREIGN KEY (\`bus_id\`) REFERENCES \`buses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`programming\` DROP FOREIGN KEY \`FK_0a300f9d9afb9c255c24395ce0e\``);
        await queryRunner.query(`ALTER TABLE \`programming\` DROP FOREIGN KEY \`FK_939b3d173b9a278bce1f6e78957\``);
        await queryRunner.query(`DROP TABLE \`programming\``);
    }

}
