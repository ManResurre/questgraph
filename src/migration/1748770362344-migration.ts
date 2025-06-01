import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1748770362344 implements MigrationInterface {
    name = 'Migration1748770362344'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_6f6841327ad2b549090302fd4e"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6f6841327ad2b549090302fd4e" ON "scene" ("name") `);
    }

}
