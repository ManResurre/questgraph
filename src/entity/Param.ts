import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToMany, ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {Expose, Type} from "class-transformer";
import {Quest} from "./Quest";
import {Scene} from "./Scene";
import {ParamValue} from "./ParamValue";
import {ParamOptions} from "./ParamOptions";

@Entity()
export class Param extends BaseEntity {
    @Expose({groups: ['update']})
    @PrimaryGeneratedColumn()
    id: number;

    @Expose()
    @Index({unique: true})
    @Column()
    key: string;

    @Expose()
    @Column()
    label: string;

    @Type(() => ParamValue)
    @OneToMany(() => ParamValue, (value) => value.param, {
        cascade: true,
        eager: true
    })
    values: typeof ParamValue[];

    @Type(() => ParamOptions)
    @OneToOne(() => ParamOptions, {
        cascade: true,
        eager: true
    })
    @JoinColumn()
    options: typeof ParamOptions;

    @ManyToMany(() => Scene, (scene) => scene.params)
    scenes: typeof Scene[];

    @Expose({groups: ['create', 'update']})
    @Type(() => Quest)
    @ManyToOne(() => Quest, (quest) => quest.scenes)
    quest: typeof Quest;
}
