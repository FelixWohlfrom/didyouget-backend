import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ShoppingList } from "./Shoppinglist";

/**
 * Describes an item of a shopping list
 */
@Entity()
export class ListItem {
    @PrimaryGeneratedColumn()
    declare id: number;

    @Column()
    declare value: string;

    @Column({ nullable: false, default: false })
    declare bought: boolean;

    // Add column to return list id as described in
    // https://typeorm.io/docs/relations/relations-faq/#how-to-use-relation-id-without-joining-relation
    @Column({ nullable: true })
    declare listId: number;

    @ManyToOne(() => ShoppingList, (shoppingList) => shoppingList.listItems, {
        onDelete: "CASCADE"
    })
    declare list: ShoppingList;
}
