import {BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm"
import {Expose, Type} from "class-transformer";
import {Scene} from "./Scene";
import {Param} from "./Param";

@Entity()
export class Quest extends BaseEntity{
    @PrimaryGeneratedColumn()
    id: number;

    @Expose()
    @Column()
    name: string;

    @Expose()
    @Type(() => Scene)
    @OneToMany(() => Scene, (scene) => scene.quest, {
        cascade: true,
        eager: true
    })
    scenes: typeof Scene[];

    @Expose()
    @Type(() => Param)
    @OneToMany(() => Param, (param) => param.quest, {
        cascade: true,
        eager: true
    })
    params: typeof Param[];
}
