import {BaseEntity, Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Expose} from "class-transformer";
import {Param} from "./Param";

export enum ParamType {
    REGULAR = "regular",
    FAILED = "failed",
    SUCCESSFUL = "successful",
    FATAL = "fatal"
}

@Entity()
export class ParamOptions extends BaseEntity {
    @Expose()
    @PrimaryGeneratedColumn()
    id: number;

    @Expose()
    @Column()
    type: ParamType;

    @Expose()
    @Column()
    show: boolean;

    @Expose()
    @Column()
    borderMax: boolean;

    @Expose()
    @Column()
    startValue: string;

    @Expose()
    @Column()
    description: string;

    @OneToOne(() => Param, (param) => param.options)
    param: typeof Param;
}
