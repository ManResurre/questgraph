import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Expose} from "class-transformer";
import {Param} from "./Param";

@Entity()
export class ParamValue extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn()
    id: number;

    @Expose()
    @Column()
    min: string;

    @Expose()
    @Column()
    max: number;

    @Expose()
    @Column()
    str: string;

    @ManyToOne(() => Param, (param) => param.values)
    param: typeof Param;
}
