import { ListItem } from "../../../../db/model/ListItem";
import { ShoppingList } from "../../../../db/model/Shoppinglist";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const shoppingLists = async (
    _parent: object,
    _args: object,
    context: { auth: DidYouGetLoginData }
) => {
    const result = await ShoppingList.findAll({
        where: { owner: context.auth.userid },
        include: ListItem
    });
    return result;
};
