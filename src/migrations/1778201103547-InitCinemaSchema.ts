import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCinemaSchema1778201103547 implements MigrationInterface {
    name = 'InitCinemaSchema1778201103547'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`group\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`person_group\` (\`id\` int NOT NULL AUTO_INCREMENT, \`person_id\` int NULL, \`group_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`recipient_person\` (\`id\` int NOT NULL AUTO_INCREMENT, \`message_id\` int NULL, \`person_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`message\` ADD \`personId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`message\` ADD CONSTRAINT \`FK_faa0362c14fe358d8ca3de3ed47\` FOREIGN KEY (\`personId\`) REFERENCES \`person\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`person_group\` ADD CONSTRAINT \`FK_d2fbd97b2874ee980655de51cc9\` FOREIGN KEY (\`person_id\`) REFERENCES \`person\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`person_group\` ADD CONSTRAINT \`FK_67357eaa352cab6ab127dc6f86f\` FOREIGN KEY (\`group_id\`) REFERENCES \`group\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recipient_person\` ADD CONSTRAINT \`FK_85ac0971ea0d212c4d3a6b517b4\` FOREIGN KEY (\`message_id\`) REFERENCES \`message\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`recipient_person\` ADD CONSTRAINT \`FK_e845b7e2228773ccca6db687842\` FOREIGN KEY (\`person_id\`) REFERENCES \`person\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`recipient_person\` DROP FOREIGN KEY \`FK_e845b7e2228773ccca6db687842\``);
        await queryRunner.query(`ALTER TABLE \`recipient_person\` DROP FOREIGN KEY \`FK_85ac0971ea0d212c4d3a6b517b4\``);
        await queryRunner.query(`ALTER TABLE \`person_group\` DROP FOREIGN KEY \`FK_67357eaa352cab6ab127dc6f86f\``);
        await queryRunner.query(`ALTER TABLE \`person_group\` DROP FOREIGN KEY \`FK_d2fbd97b2874ee980655de51cc9\``);
        await queryRunner.query(`ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_faa0362c14fe358d8ca3de3ed47\``);
        await queryRunner.query(`ALTER TABLE \`message\` DROP COLUMN \`personId\``);
        await queryRunner.query(`DROP TABLE \`recipient_person\``);
        await queryRunner.query(`DROP TABLE \`person_group\``);
        await queryRunner.query(`DROP TABLE \`group\``);
    }

}
