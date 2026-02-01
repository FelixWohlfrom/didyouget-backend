import { DataSource } from "typeorm";
import { ShoppingList } from "../../../../db/model/Shoppinglist";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const addShoppingList = async (
    _parent: object,
    args: { input: { name: string } },
    context: { auth: DidYouGetLoginData; db: DataSource }
) => {
    const { name } = args.input;

    const newList = new ShoppingList();
    newList.name = name;
    newList.ownerId = context.auth.userid;

    const result = await context.db.getRepository(ShoppingList).save(newList);

    // Queries will also return an empty list on no items.
    result.listItems = [];

    return result;
};
