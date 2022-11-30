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
  creatorUpn: string,
  initiatorUpn: string,
  executorUpn: string,
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
          creator_upn,
          initiator_upn,
          executor_upn,
          service_id,
          topic,
          description,
          status_id,
          priority_id,
          deadline)
  VALUES (
    '${dateCreation}','${dateChange}','${requestNumber}','${creatorUpn}','${initiatorUpn}',
    '${executorUpn}','${serviceId}','${topic}','${description}','${statusId}','${priorityId}','${deadline}')`;

export const insertUserRequestAttachment = (
  requestNumber: string,
  fileName: string,
  fileSiza: number,
  fileType: string,
  filePath: string,
) => `
  INSERT INTO ur_attachment (
          request_number,
          file_name,
          file_size,
          file_type,
          file_path)
  VALUES (
  '${requestNumber}','${fileName}','${fileSiza}','${fileType}','${filePath}')`;

export const insertUserRequestLifeCycle = (
  requestNumber: string,
  employeeUpn: string,
  eventDate: string,
  eventType: string,
  eventValue: string,
) => `
    INSERT INTO ur_life_cycle (
            request_number,
            user_principal_name,
            event_date,
            event_type,
            event_value)
    VALUES (
    '${requestNumber}','${employeeUpn}','${eventDate}','${eventType}', '${eventValue}')`;

export const inserPacsEvent = (
  date: string,
  accessPoint: number,
  ownerId: number,
  card: number,
  code: number,
) => `INSERT INTO pacs_event (date, access_point, owner_id, card, code)
VALUES (
'${date}',${accessPoint},${ownerId},${card}, ${code})`;
