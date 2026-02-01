import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Device } from "./Device";
import { ShoppingList } from "./Shoppinglist";

/**
 * Describes a user
 */
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    declare id: number;

    @Column({ unique: true })
    declare username: string;

    @Column()
    declare password: string;

    @OneToMany(() => Device, (device) => device.user)
    declare devices: Device[];

    @OneToMany(() => ShoppingList, (shoppingList) => shoppingList.owner)
    declare shoppingLists: ShoppingList[];
}
