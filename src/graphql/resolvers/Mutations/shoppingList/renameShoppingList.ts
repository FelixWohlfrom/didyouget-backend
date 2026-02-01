import { DataSource } from "typeorm";
import { ShoppingList } from "../../../../db/model/Shoppinglist";
import { DidYouGetLoginData } from "../../../../utils/auth/model";

export const renameShoppingList = async (
    _parent: object,
    args: { input: { id: number; name: string } },
    context: { auth: DidYouGetLoginData; db: DataSource }
) => {
    const { id, name } = args.input;

    const repo = context.db.getRepository(ShoppingList);
    const list = await repo.findOneBy([{ id: id }]);

    if (list?.ownerId !== context.auth.userid) {
        return {
            success: false,
            failureMessage: "Unknown list"
        };
    }

    list.name = name;
    await repo.save(list);

    return {
        success: true
    };
};
