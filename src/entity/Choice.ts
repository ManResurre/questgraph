import {BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId} from "typeorm";
import {Scene} from "./Scene";

@Entity()
export class Choice extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    label: string;

    @Column({nullable: false})
    text: string;

    @ManyToOne(() => Scene)
    nextScene: typeof Scene;

    @RelationId((choice: Choice) => choice.nextScene)
    nextSceneId: number;

    @ManyToOne(() => Scene, (scene) => scene.choices)
    scene: typeof Scene;
}
