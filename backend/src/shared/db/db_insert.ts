export const insertPurchaseRequest = (prDate: string, prTarget: string, prRespPersonId: number, prReason: string, prAuthorId: number) => `
INSERT INTO purchase_request (
        date,
        target,
        responsible_person_id,
        expense_item,
        reason,
        purchase_departmen_id,
        author_id,
        head_init_dep_id,
        head_purchase_dep_id,
        deputy_director_id,
        head_fin_dep_id,
        status_id)
VALUES ('${prDate}','${prTarget}','${prRespPersonId}',null,'${prReason}',null,'${prAuthorId}',null,null,null,null,null)`;
