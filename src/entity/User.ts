import "reflect-metadata";
import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm"

@Entity('user')
export class User extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    age: number;

}
