import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";

import { User } from "./User";

/**
 * Describes a device
 */
@Entity()
export class Device {
    @PrimaryGeneratedColumn()
    declare id: number;

    @Column({ default: "" })
    declare name: string;

    @Column()
    declare token: string;

    @Column()
    declare loggedin: boolean;

    @CreateDateColumn()
    declare firstSeen: Date;

    @UpdateDateColumn()
    declare lastSeen: Date;

    // Add column to return user id as described in
    // https://typeorm.io/docs/relations/relations-faq/#how-to-use-relation-id-without-joining-relation
    @Column({ nullable: true })
    declare userId: number;

    @ManyToOne(() => User, (user) => user.devices, { onDelete: "CASCADE" })
    declare user: User;
}
