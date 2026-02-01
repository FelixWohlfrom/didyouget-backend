import { DataSource } from "typeorm";
import { ShoppingList } from "../../../../db/model/Shoppinglist";
import { DidYouGetLoginData } from "../../../../utils/auth/model";
import { ListItem } from "../../../../db/model/ListItem";

export const addShoppingListItem = async (
    _parent: object,
    args: { input: { shoppingListId: number; value: string } },
    context: { auth: DidYouGetLoginData; db: DataSource }
) => {
    const { shoppingListId, value } = args.input;

    const list = await context.db
        .getRepository(ShoppingList)
        .findOneBy([{ id: shoppingListId }]);

    if (list?.ownerId !== context.auth.userid) {
        return null;
    }

    const newListItem = new ListItem();
    newListItem.listId = shoppingListId;
    newListItem.value = value;

    const result = await context.db.getRepository(ListItem).save(newListItem);

    return result;
};
