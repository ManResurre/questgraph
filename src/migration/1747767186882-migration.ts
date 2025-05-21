import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1747767186882 implements MigrationInterface {
    name = 'Migration1747767186882'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "age" integer NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "quest" ("id" SERIAL NOT NULL, CONSTRAINT "PK_0d6873502a58302d2ae0b82631c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "quest"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
