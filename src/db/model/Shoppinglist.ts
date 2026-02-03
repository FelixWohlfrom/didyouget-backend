import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from "typeorm";

import { ListItem } from "./ListItem";
import { User } from "./User";

/**
 * Describes a shopping list
 */
@Entity()
export class ShoppingList {
    @PrimaryGeneratedColumn()
    declare id: number;

    @Column()
    declare name: string;

    // Add column to return owner id as described in
    // https://typeorm.io/docs/relations/relations-faq/#how-to-use-relation-id-without-joining-relation
    @Column({ nullable: true })
    declare ownerId: number;

    @ManyToOne(() => User, (user) => user.shoppingLists, {
        onDelete: "CASCADE"
    })
    declare owner: User;

    @OneToMany(() => ListItem, (listItem) => listItem.list)
    declare listItems: ListItem[];
}
