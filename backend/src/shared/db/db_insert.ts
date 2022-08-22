export const insertPurchaseRequest = (prDate: string, prInitiator: number) => `
INSERT INTO purchase_request (pr_date ,
        pr_number,
        pr_initiator,
        pr_target,
        pr_responsible_person,
        pr_expense_item,
        pr_reason,
        pr_purchase_departmen,
        pr_author_position,
        pr_author_name,
        pr_head_init_dep,
        pr_head_purchase_dep,
        pr_deputy_director,
        pr_head_fin_dep,
        pr_status)
VALUES ('${prDate}',null,'${prInitiator}',null,null,null,null,null,null,null,null,null,null,null,null)`;
