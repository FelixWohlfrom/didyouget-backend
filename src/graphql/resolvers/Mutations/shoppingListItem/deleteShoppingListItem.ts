import { DataSource } from "typeorm";
import { ListItem } from "../../../../db/model/ListItem";
import { ShoppingList } from "../../../../db/model/Shoppinglist";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const deleteShoppingListItem = async (
    _parent: object,
    args: {
        input: {
            shoppingListItemId: number;
        };
    },
    context: { auth: DidYouGetLoginData; db: DataSource }
) => {
    const { shoppingListItemId } = args.input;

    const listItem = await context.db
        .getRepository(ListItem)
        .findOneBy([{ id: shoppingListItemId }]);
    const list = await context.db
        .getRepository(ShoppingList)
        .findOneBy([{ id: listItem?.listId }]);

    // we know that we only have valid links in our db, so either we have both
    // list item and list, or none
    if (!listItem || list!.ownerId !== context.auth.userid) {
        return {
            success: false,
            failureMessage: "Unknown list item"
        };
    }

    await context.db.getRepository(ListItem).delete(listItem);

    return { success: true };
};
