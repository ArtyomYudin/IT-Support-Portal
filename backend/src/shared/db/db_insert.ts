export const insertPurchaseRequest = (
  prDate: string,
  prTarget: string,
  prRespPersonId: number,
  prExpenseItem: string,
  prReason: string,
  prAuthorId: number,
  prStatus: number,
) => `
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
VALUES (
  '${prDate}','${prTarget}','${prRespPersonId}','${prExpenseItem}','${prReason}',null,'${prAuthorId}',null,null,null,null,'${prStatus}')`;

export const insertUserRequest = (
  dateCreation: string,
  dateChange: string,
  requestNumber: string,
  initiatorId: number,
  departmentId: number,
  executorId: number,
  serviceId: number,
  topic: string,
  description: string,
  statusId: number,
  priorityId: number,
  deadline: string,
) => `
  INSERT INTO user_request (
          creation_date,
          change_date,
          number,
          initiator_id,
          department_id,
          executor_id,
          service_id,
          topic,
          description,
          status_id,
          priority_id,
          deadline)
  VALUES (
    '${dateCreation}','${dateChange}','${requestNumber}','${initiatorId}','${departmentId}',
    '${executorId}','${serviceId}','${topic}','${description}','${statusId}','${priorityId}','${deadline}')`;
