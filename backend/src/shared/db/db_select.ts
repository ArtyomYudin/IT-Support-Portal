/* eslint-disable no-template-curly-in-string */
export const userRequestList = `
              SELECT user_request.id AS id,
                     user_request.creation_date AS creationDate,
                     user_request.change_date AS changeDate,
                     user_request.number AS requestNumber,
                     employee.display_name AS initiator,
                     employee.department AS department,
                     user_request.executor_upn AS executorUpn,
                     executor.display_name AS executorName,
                     ur_service.name AS service,
                     user_request.topic AS topic,
                     user_request.description AS description,
                     user_request.deadline AS deadline,
                     user_request.status_id AS statusId,
                     ur_status.name AS statusName,
                     ur_status.icon AS statusIcon,
                     user_request.priority_id AS priorityId,	
                     ur_priority.name AS priorityName,
                     ur_priority.color AS priorityColor
              FROM user_request
                     LEFT JOIN (
                            select employee.user_principal_name as userPrincipalName,
                                   employee.display_name as display_name,
                                   department.name as department
                            FROM employee
                            LEFT JOIN department on (employee.department_id = department.id)
                     ) employee on(user_request.initiator_upn = employee.userPrincipalName)
                     LEFT JOIN ur_service on(user_request.service_id = ur_service.id)
                     LEFT JOIN ur_status on(user_request.status_id = ur_status.id)
                     LEFT JOIN ur_priority on(user_request.priority_id = ur_priority.id)
                     LEFT JOIN (
                            select employee.user_principal_name as userPrincipalName,
                                   employee.display_name as display_name
                            FROM employee
                     ) executor on executor.userPrincipalName = user_request.executor_upn
              ORDER by user_request.creation_date desc`;

export const userRequestbyNumber = (requestNumber?: string) => `
              SELECT user_request.id AS id,
                     user_request.creation_date AS creationDate,
                     user_request.change_date AS changeDate,
                     user_request.number AS requestNumber,
                     employee.display_name AS initiator,
                     employee.department AS department,
                     user_request.executor_upn AS executorUpn,
                     executor.display_name AS executorName,
                     ur_service.name AS service,
                     user_request.topic AS topic,
                     user_request.description AS description,
                     user_request.deadline AS deadline,
                     user_request.status_id AS statusId,
                     ur_status.name AS statusName,
                     ur_status.icon AS statusIcon,
                     user_request.priority_id AS priorityId,	
                     ur_priority.name AS priorityName,
                     ur_priority.color AS priorityColor
              FROM user_request
                     LEFT JOIN (
                            select employee.user_principal_name as userPrincipalName,
                                   employee.display_name as display_name,
                                   department.name as department
                            FROM employee
                            LEFT JOIN department on (employee.department_id = department.id)
                     ) employee on(user_request.initiator_upn = employee.userPrincipalName)
                     LEFT JOIN ur_service on(user_request.service_id = ur_service.id)
                     LEFT JOIN ur_status on(user_request.status_id = ur_status.id)
                     LEFT JOIN ur_priority on(user_request.priority_id = ur_priority.id)
                     LEFT JOIN (
                            select employee.user_principal_name as userPrincipalName,
                                   employee.display_name as display_name
                            FROM employee
                     ) executor on executor.userPrincipalName = user_request.executor_upn
              WHERE user_request.number ='${requestNumber}'
              LIMIT 1`;

export const getUserRequestService = (serviceId?: number) => `
                            SELECT ur_service.id AS id,
                                   ur_service.name AS name
                            FROM ur_service
                            ${serviceId ? ` WHERE ur_service.id  =${serviceId}` : ''}
                            order by ur_service.name`;

export const getUserRequestStatus = (statusId?: number) => `
                            SELECT ur_status.id AS id,
                                   ur_status.name AS name
                            FROM ur_status
                            ${statusId ? ` WHERE ur_status.id  =${statusId}` : ''}
                            order by ur_status.id`;

export const getUserRequestPriority = (priorityId?: number) => `
                            SELECT ur_priority.id AS id,
                                   ur_priority.name AS name
                            FROM ur_priority
                            ${priorityId ? ` WHERE ur_priority.id  =${priorityId}` : ''}
                            order by ur_priority.id`;

export const getUserRequestAttachment = (requestNumber?: number) => `
                            SELECT ur_attachment.id AS id,
                                   ur_attachment.file_name AS fileName,
                                   ur_attachment.file_size AS fileSize,
                                   ur_attachment.file_type AS fileType,
                                   ur_attachment.file_path AS filePath
                            FROM ur_attachment
                            ${requestNumber ? ` WHERE ur_attachment.request_number  =${requestNumber}` : ''}
                            order by ur_attachment.id`;

export const getUserRequestLifeCycle = (requestNumber: string) => `
                            SELECT ur_life_cycle.id AS id,
                                   employee.display_name AS employee,
                                   ur_life_cycle.event_date AS eventDate,
                                   ur_life_cycle.event_type AS eventType,
                                   ur_life_cycle.event_value AS eventValue
                            FROM ur_life_cycle
                                   LEFT JOIN employee on(ur_life_cycle.user_principal_name = employee.user_principal_name)
                            WHERE ur_life_cycle.request_number  ='${requestNumber}'
                            order by ur_life_cycle.event_date`;

export const getDepartment = (departmentId?: any) => `
                            SELECT department.id AS id,
                                   department.name AS name,
                                   dep.id as parentDepartmentId,
                                   dep.name as parentDepartmentName
                            FROM department
                            LEFT JOIN (
                                   select id,
                                   name
                            FROM department
                            ) dep on dep.id = department.parent_id
                            ${!departmentId.isNaN ? ` WHERE department.id  =${departmentId}` : ''}
                            order by department.name`;

export const getUserRequestNewNumber = `SELECT user_request_new_number() AS newNumber`;

export const getEmployee = `
                            SELECT employee.user_principal_name AS userPrincipalName,
                                   employee.display_name AS displayName,
                                   department.name AS departmentName,
                                   department.id AS departmentId,
                                   position.name AS positionName,
                                   employee_photo.thumbnail_photo AS thumbnailPhoto
                            FROM employee
                                   INNER JOIN department on(employee.department_id = department.id)
                                   INNER JOIN position on(employee.position_id = position.id)
                                   LEFT OUTER JOIN employee_photo on(employee_photo.user_principal_name = employee.user_principal_name)
                            order by employee.display_name`;

export const getFilteredEmployee = (filterValue: string) => `
                            SELECT employee.user_principal_name AS userPrincipalName,
                                   employee.display_name AS displayName,
                                   employee.department_id AS departmentId
                            FROM employee
                            WHERE employee.display_name LIKE  '${filterValue}%'
                                   order by employee.display_name desc`;

export const getEmployeeByUPN = (userPrincipalName: string) => `
                            SELECT employee.user_principal_name AS userPrincipalName,
                                   employee.display_name AS displayName,
                                   department.name AS departmentName,
                                   department.id AS departmentId,
                                   position.name AS positionName
                            FROM employee
                                   INNER JOIN department on(employee.department_id = department.id)
                                   INNER JOIN position on(employee.position_id = position.id)
                            WHERE employee.user_principal_name = '${userPrincipalName}'
                            LIMIT 1`;

export const getEmployeeByMail = (mail: string) => `
                     SELECT employee_mail.user_principal_name AS userPrincipalName,
		              employee_mail.mail AS mail,
                            employee.display_name AS displayName
                     FROM employee_mail
                     INNER JOIN employee on(employee_mail.user_principal_name = employee.user_principal_name)
                     WHERE employee_mail.mail = '${mail}'
                     LIMIT 1`;

export const getEmployeeById = (id: number) => `
                            SELECT employee.id AS id,
                                   employee.display_name AS displayName,
                                   department.name AS departmentName,
                                   department.id AS departmentId,
                                   position.name AS positionName
                            FROM employee
                                   INNER JOIN department on(employee.department_id = department.id)
                                   INNER JOIN position on(employee.position_id = position.id)
                            WHERE employee.id = '${id}'
                            LIMIT 1`;

export const getEmployeeByParentDepartment = (parentDepartmentId: number) => `
                            SELECT employee.user_principal_name AS userPrincipalName,
                                   employee.display_name AS displayName
                            FROM employee
                                   INNER JOIN department on(employee.department_id = department.id)
                            WHERE department.parent_id = ${parentDepartmentId} or department.id = ${parentDepartmentId}
                                   order by employee.display_name`;
/*                            
export const getPurchaseRequestInitInfoByUPN = (email: string) => `
                            SELECT employee.id AS id,
                                   employee.display_name AS displayName,
                                   department.name AS departmentName,
                                   position.name AS positionName
                            FROM employee
                                   INNER JOIN department on(employee.department_id = department.id)
                                   INNER JOIN position on(employee.position_id = position.id)
                            WHERE employee.user_principal_name = '${email}'
                                   order by employee.display_name desc
                            LIMIT 1`;
*/
export const getPurchaseRequestInitInfoByUPN = (email: string) => `
                            SELECT 
                                   employee_full_info.id as id,
                                   employee_full_info.display_name as displayName,
                                   employee_full_info.position_name as positionName,
                                   employee_full_info.department_name as departmentName,
                                   dep.id as departmentManagerId,
                                   dep.display_name as departmentManagerName,
                                   direction.id as directionManagerId,
                                   direction.display_name as directionManagerName
                            FROM employee_full_info
                                   LEFT JOIN (
                                          select id,
                                          display_name
                                   FROM employee
                                   ) direction on direction.id = employee_full_info.direction_manager_id
                                   LEFT JOIN (
                                          select id,
                                          display_name
                                   FROM employee
                                   ) dep on dep.id = employee_full_info.department_manager_id
                            WHERE employee_full_info.user_principal_name = '${email}'
                                   order by employee_full_info.display_name desc
                            LIMIT 1`;

export const getPurchaseRequestApproversByUPN = (email: string) => `
                            SELECT employee.id AS id,
                                   employee.display_name AS displayName,
                                   department.name AS departmentName,
                                   position.name AS positionName
                            FROM employee
                                   INNER JOIN department on(employee.department_id = department.id)
                                   INNER JOIN position on(employee.position_id = position.id)
                            WHERE employee.user_principal_name = '${email}'
                                   order by employee.display_name desc
                            LIMIT 1`;

export const purchaseRequestList = `
                            SELECT purchase_request.id AS id,
                                   purchase_request.date AS date,
                                   employee_full_info.display_name AS authorDisplayName,
                                   employee_full_info.department_name AS authorDepartmentName,
                                   employee.display_name AS responsibleDisplayName,
                                   purchase_request.target AS purchaseTarget,
                                   purchase_request.reason AS purchaseReason,
                                   purchase_request.status_id AS statusId
                            FROM purchase_request
                            LEFT OUTER JOIN employee_full_info on(purchase_request.author_id = employee_full_info.id)
                            LEFT OUTER JOIN employee on(purchase_request.responsible_person_id = employee.id)
                            ORDER by purchase_request.date desc`;

export const avayaCDRList = (filter: number) => `
              SELECT avaya_cdr.id AS id,
                     avaya_cdr.date AS callStart,
                     avaya_cdr.duration AS callDuration,
                     avaya_cdr.calling_number AS callingNumber,
                     calling.display_name AS callingName,
                     avaya_cdr.called_number AS calledNumber,
                     called.display_name AS calledName,
                     avaya_cdr.call_code AS callCode
              FROM avaya_cdr
              LEFT OUTER JOIN (
                     select 
                            employee.call_number as call_number,
                            employee.display_name as display_name
                     FROM employee
              ) calling on(calling.call_number = avaya_cdr.calling_number)
              LEFT OUTER JOIN (
                     select 
                            employee.call_number as call_number,
                            employee.display_name as display_name
                     FROM employee
              ) called on(called.call_number = avaya_cdr.called_number)
              WHERE avaya_cdr.date >= NOW() - INTERVAL ${filter} HOUR
              order by avaya_cdr.date DESC`;

export const vpnCompletedSession = (period: number, employeeUpn: string | null) => `
       SELECT DISTINCT
              connect.date AS sessionEnd,
              connect.host AS vpnNode,
              SUBSTRING_INDEX(SUBSTRING_INDEX(connect.event,',', 2), ' ',-1) AS user,
              SUBSTRING_INDEX(SUBSTRING_INDEX(connect.event,',', 3), ' ',-1) AS ip,
              SUBSTRING_INDEX(SUBSTRING_INDEX(connect.event,',', 4), ' ',-1) AS type,
              SUBSTRING_INDEX(SUBSTRING_INDEX(connect.event,',', 5), ' ',-1) AS duration,
              SUBSTRING_INDEX(SUBSTRING_INDEX(connect.event,',', 6), ' ',-1) AS byteXmt,
              SUBSTRING_INDEX(SUBSTRING_INDEX(connect.event,',', 7), ' ',-1) AS byteRcv,
              SUBSTRING_INDEX(SUBSTRING_INDEX(connect.event,',', 8), ' ',-1) AS reason,
              employee.display_name AS displayName
       FROM cisco_vpn_event connect
       LEFT OUTER JOIN employee on(
              employee.user_principal_name = (
                     case when SUBSTRING_INDEX(SUBSTRING_INDEX(connect.event,',', 2), ' ',-1) not LIKE '%@%' 
                     then CONCAT(SUBSTRING_INDEX(SUBSTRING_INDEX(connect.event,',', 2), ' ',-1),'@center-inform.ru')
                     else SUBSTRING_INDEX(SUBSTRING_INDEX(connect.event,',', 2), ' ',-1)
                     end)
              )
       WHERE (connect.date >= NOW() - INTERVAL ${period} HOUR) AND LOCATE('%ASA-4-113019',connect.event) 
       ${employeeUpn ? ` AND employee.user_principal_name = '${employeeUpn}'` : ''}
       order by connect.date DESC`;

export const vpnActiveSession = `
              SELECT DISTINCT
                     connect.date AS sessionStart,
                     connect.host AS vpnNode,
                     SUBSTR(REGEXP_SUBSTR(connect.event,'(?<=LOCAL).*(?= S)'),2) AS user,
                     employee.display_name AS displayName,
                     SUBSTRING_INDEX(SUBSTRING_INDEX(connect.event,' ', -7), ' - ',1) AS mappedIP,
                     policy.policy as policyName,
                     policy.ip as clientIP
              FROM cisco_vpn_event connect
                     LEFT OUTER JOIN employee on(
                            employee.user_principal_name = (
                                   case when SUBSTR(REGEXP_SUBSTR(connect.event,'(?<=LOCAL).*(?= S)'),2) not LIKE '%@%' 
                                   then CONCAT(SUBSTR(REGEXP_SUBSTR(connect.event,'(?<=LOCAL).*(?= S)'),2),'@center-inform.ru')
                                   else SUBSTR(REGEXP_SUBSTR(connect.event,'(?<=LOCAL).*(?= S)'),2)
                                   end)
                     )
                     LEFT OUTER JOIN (
                            SELECT
                                   cisco_vpn_event.date as sessionStart,
                                   SUBSTRING_INDEX(SUBSTRING_INDEX(cisco_vpn_event.event,' ', 4), ' ',-1) AS policy,
                                   SUBSTRING_INDEX(SUBSTRING_INDEX(cisco_vpn_event.event,' ', 8), ' ',-1) AS ip
                            FROM cisco_vpn_event
                            WHERE LOCATE('%ASA-4-722051',cisco_vpn_event.event)
                     ) policy on(policy.sessionStart = connect.date)
                     LEFT OUTER JOIN (
                            SELECT
                                   cisco_vpn_event.date AS sessionEnd,
                                   SUBSTRING_INDEX(SUBSTRING_INDEX(cisco_vpn_event.event,' ', -8), ' - ',1) AS ip
                            FROM cisco_vpn_event
                            WHERE LOCATE('%ASA-7-746013',cisco_vpn_event.event)
                     ) disconnect on(
                            disconnect.ip = SUBSTRING_INDEX(SUBSTRING_INDEX(connect.event,' ', -7), ' - ',1) and 
                            disconnect.sessionEnd >= connect.date)
              WHERE LOCATE('%ASA-7-746012',connect.event) and disconnect.sessionEnd is Null
              order by connect.date DESC`;

export const vpnActiveSessionCount = `
              SELECT 
                     connect.host AS vpnNode,
                     COUNT(*) as count
              FROM cisco_vpn_event connect
              LEFT OUTER JOIN (
                     SELECT
                            cisco_vpn_event.date AS sessionEnd,
                            SUBSTRING_INDEX(SUBSTRING_INDEX(cisco_vpn_event.event,' ', -8), ' - ',1) AS ip
                     FROM cisco_vpn_event
                     WHERE LOCATE('%ASA-7-746013',cisco_vpn_event.event)
              ) disconnect on(
                     disconnect.ip = SUBSTRING_INDEX(SUBSTRING_INDEX(connect.event,' ', -7), ' - ',1) and 
                     disconnect.sessionEnd >= connect.date)
              WHERE LOCATE('%ASA-7-746012',connect.event) and disconnect.sessionEnd is Null
              group by connect.host`;
