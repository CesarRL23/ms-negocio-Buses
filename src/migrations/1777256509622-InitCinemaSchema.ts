import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCinemaSchema1777256509622 implements MigrationInterface {
    name = 'InitCinemaSchema1777256509622'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`programming\` DROP FOREIGN KEY \`FK_0a300f9d9afb9c255c24395ce0e\``);
        await queryRunner.query(`ALTER TABLE \`programming\` DROP FOREIGN KEY \`FK_939b3d173b9a278bce1f6e78957\``);
        await queryRunner.query(`CREATE TABLE \`ticket\` (\`id\` int NOT NULL AUTO_INCREMENT, \`codigo\` varchar(255) NOT NULL, \`precio\` int NOT NULL, \`fechaCompra\` datetime NOT NULL, \`FechaUso\` datetime NOT NULL, \`estado\` varchar(255) NOT NULL, \`metodoPago\` varchar(255) NOT NULL, \`programmingId\` int NULL, UNIQUE INDEX \`IDX_11273686d31183dc7e5982be1c\` (\`codigo\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`programming\` DROP COLUMN \`route_id\``);
        await queryRunner.query(`ALTER TABLE \`programming\` DROP COLUMN \`bus_id\``);
        await queryRunner.query(`ALTER TABLE \`programming\` ADD \`routeId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`programming\` ADD \`busId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`programming\` ADD CONSTRAINT \`FK_b5974390cfc52cfc3c3114f5916\` FOREIGN KEY (\`routeId\`) REFERENCES \`route\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`programming\` ADD CONSTRAINT \`FK_e9c918906f9719bce40aef5c76c\` FOREIGN KEY (\`busId\`) REFERENCES \`buses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_d180dc4b0eb0a210fdcd2bbeef0\` FOREIGN KEY (\`programmingId\`) REFERENCES \`programming\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_d180dc4b0eb0a210fdcd2bbeef0\``);
        await queryRunner.query(`ALTER TABLE \`programming\` DROP FOREIGN KEY \`FK_e9c918906f9719bce40aef5c76c\``);
        await queryRunner.query(`ALTER TABLE \`programming\` DROP FOREIGN KEY \`FK_b5974390cfc52cfc3c3114f5916\``);
        await queryRunner.query(`ALTER TABLE \`programming\` DROP COLUMN \`busId\``);
        await queryRunner.query(`ALTER TABLE \`programming\` DROP COLUMN \`routeId\``);
        await queryRunner.query(`ALTER TABLE \`programming\` ADD \`bus_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`programming\` ADD \`route_id\` int NULL`);
        await queryRunner.query(`DROP INDEX \`IDX_11273686d31183dc7e5982be1c\` ON \`ticket\``);
        await queryRunner.query(`DROP TABLE \`ticket\``);
        await queryRunner.query(`ALTER TABLE \`programming\` ADD CONSTRAINT \`FK_939b3d173b9a278bce1f6e78957\` FOREIGN KEY (\`route_id\`) REFERENCES \`route\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`programming\` ADD CONSTRAINT \`FK_0a300f9d9afb9c255c24395ce0e\` FOREIGN KEY (\`bus_id\`) REFERENCES \`buses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
