import { DataSource } from "typeorm";
import { ShoppingList } from "../../../../db/model/Shoppinglist";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const deleteShoppingList = async (
    _parent: object,
    args: { input: { id: number } },
    context: { auth: DidYouGetLoginData; db: DataSource }
) => {
    const { id } = args.input;

    const repo = context.db.getRepository(ShoppingList);
    const list = await repo.findOneBy([{ id: id }]);

    if (list?.ownerId !== context.auth.userid) {
        return {
            success: false,
            failureMessage: "Unknown list"
        };
    }

    await repo.delete(list);
    return {
        success: true
    };
};
