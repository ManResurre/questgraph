import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1747775217418 implements MigrationInterface {
    name = 'Migration1747775217418'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "param_value" ("id" SERIAL NOT NULL, "min" character varying NOT NULL, "max" integer NOT NULL, "str" character varying NOT NULL, "paramId" integer, CONSTRAINT "PK_f0b8279ca7bfcfe1b90457682e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "param_options" ("id" SERIAL NOT NULL, "type" character varying NOT NULL, "show" boolean NOT NULL, "borderMax" boolean NOT NULL, "startValue" character varying NOT NULL, "description" character varying NOT NULL, CONSTRAINT "PK_e30bb0e766b2283c0601f57a02a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "param" ("id" SERIAL NOT NULL, "key" character varying NOT NULL, "label" character varying NOT NULL, "optionsId" integer, "questId" integer, CONSTRAINT "REL_05e6a0fa6339e7135b31157aa4" UNIQUE ("optionsId"), CONSTRAINT "PK_954cb8cfb3627c778c6798a487a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_20327e981377f347fea942d142" ON "param" ("key") `);
        await queryRunner.query(`CREATE TABLE "choice" ("id" SERIAL NOT NULL, "label" character varying NOT NULL, "text" character varying NOT NULL, "nextSceneId" integer, "sceneId" integer, CONSTRAINT "PK_5bf2e5939332f46711278a87fcd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "scene" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "text" character varying NOT NULL, "questId" integer, CONSTRAINT "PK_680b182e0d3bd68553f944295f4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6f6841327ad2b549090302fd4e" ON "scene" ("name") `);
        await queryRunner.query(`ALTER TABLE "quest" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "param_value" ADD CONSTRAINT "FK_d343980e93a86eaafcf07becefc" FOREIGN KEY ("paramId") REFERENCES "param"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "param" ADD CONSTRAINT "FK_05e6a0fa6339e7135b31157aa41" FOREIGN KEY ("optionsId") REFERENCES "param_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "param" ADD CONSTRAINT "FK_de1835c47a114a2b3b797f3c304" FOREIGN KEY ("questId") REFERENCES "quest"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "choice" ADD CONSTRAINT "FK_1450e3890065ee4eba98ac1caa9" FOREIGN KEY ("nextSceneId") REFERENCES "scene"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "choice" ADD CONSTRAINT "FK_a8317575ffc642eece8e2aca143" FOREIGN KEY ("sceneId") REFERENCES "scene"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "scene" ADD CONSTRAINT "FK_25152f4d2014f30531e9b151ded" FOREIGN KEY ("questId") REFERENCES "quest"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "scene" DROP CONSTRAINT "FK_25152f4d2014f30531e9b151ded"`);
        await queryRunner.query(`ALTER TABLE "choice" DROP CONSTRAINT "FK_a8317575ffc642eece8e2aca143"`);
        await queryRunner.query(`ALTER TABLE "choice" DROP CONSTRAINT "FK_1450e3890065ee4eba98ac1caa9"`);
        await queryRunner.query(`ALTER TABLE "param" DROP CONSTRAINT "FK_de1835c47a114a2b3b797f3c304"`);
        await queryRunner.query(`ALTER TABLE "param" DROP CONSTRAINT "FK_05e6a0fa6339e7135b31157aa41"`);
        await queryRunner.query(`ALTER TABLE "param_value" DROP CONSTRAINT "FK_d343980e93a86eaafcf07becefc"`);
        await queryRunner.query(`ALTER TABLE "quest" DROP COLUMN "name"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6f6841327ad2b549090302fd4e"`);
        await queryRunner.query(`DROP TABLE "scene"`);
        await queryRunner.query(`DROP TABLE "choice"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_20327e981377f347fea942d142"`);
        await queryRunner.query(`DROP TABLE "param"`);
        await queryRunner.query(`DROP TABLE "param_options"`);
        await queryRunner.query(`DROP TABLE "param_value"`);
    }

}
