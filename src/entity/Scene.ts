import {
    BaseEntity,
    Column,
    Entity,
    Index,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    RelationId
} from "typeorm";
import {Expose, Type} from "class-transformer";
import {Quest} from "./Quest";
import {Param} from "./Param";
import {Choice} from "./Choice";

@Entity()
export class Scene extends BaseEntity {
    @Expose({groups: ['update']})
    @PrimaryGeneratedColumn()
    id: number;

    @Expose({groups: ['create', 'update']})
    @Index({unique: true})
    @Column({nullable: false})
    name: string;

    @Expose({groups: ['create', 'update']})
    @Column({nullable: false})
    text: string;

    @Expose({groups: ['create', 'update']})
    @Type(() => Choice)
    @OneToMany(() => Choice, (choice) => choice.scene, {
        cascade: true,
        eager: true
    })
    choices: typeof Choice[];

    @Expose({groups: ['create', 'update']})
    @Type(() => Quest)
    @ManyToOne(() => Quest, (quest) => quest.scenes, {lazy: true})
    quest: typeof Quest;

    @RelationId((scene: Scene) => scene.quest)
    questId: number;

    @ManyToMany(() => Param, (param) => param.scenes)
    params?: typeof Param[]
}
