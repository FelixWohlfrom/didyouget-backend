import { DataSource } from "typeorm";
import { ShoppingList } from "../../../../db/model/Shoppinglist";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const shoppingLists = async (
    _parent: object,
    _args: object,
    context: { auth: DidYouGetLoginData; db: DataSource }
) => {
    return context.db.getRepository(ShoppingList).find({
        where: { ownerId: context.auth.userid },
        relations: {
            listItems: true
        },
        order: { id: "ASC", listItems: { id: "ASC" } }
    });
};
