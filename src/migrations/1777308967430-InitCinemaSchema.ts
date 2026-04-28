import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCinemaSchema1777308967430 implements MigrationInterface {
    name = 'InitCinemaSchema1777308967430'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`address\` (\`id\` int NOT NULL AUTO_INCREMENT, \`street\` varchar(255) NOT NULL, \`number\` varchar(255) NOT NULL, \`neighborhood\` varchar(255) NOT NULL, \`city\` varchar(255) NOT NULL, \`additionalInfo\` varchar(255) NULL, \`state\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`citizen\` ADD \`addressId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`citizen\` ADD UNIQUE INDEX \`IDX_0c69c46d7439a0988bd7aa3d96\` (\`addressId\`)`);
        await queryRunner.query(`CREATE UNIQUE INDEX \`REL_0c69c46d7439a0988bd7aa3d96\` ON \`citizen\` (\`addressId\`)`);
        await queryRunner.query(`ALTER TABLE \`citizen\` ADD CONSTRAINT \`FK_0c69c46d7439a0988bd7aa3d968\` FOREIGN KEY (\`addressId\`) REFERENCES \`address\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`citizen\` DROP FOREIGN KEY \`FK_0c69c46d7439a0988bd7aa3d968\``);
        await queryRunner.query(`DROP INDEX \`REL_0c69c46d7439a0988bd7aa3d96\` ON \`citizen\``);
        await queryRunner.query(`ALTER TABLE \`citizen\` DROP INDEX \`IDX_0c69c46d7439a0988bd7aa3d96\``);
        await queryRunner.query(`ALTER TABLE \`citizen\` DROP COLUMN \`addressId\``);
        await queryRunner.query(`DROP TABLE \`address\``);
    }

}
