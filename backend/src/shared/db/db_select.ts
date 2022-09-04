/* eslint-disable no-template-curly-in-string */
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

export const getDepartment = (departmentId?: number) => `
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
                            ${departmentId ? ` WHERE department.id  =${departmentId}` : ''}
                            order by department.name`;

export const getFilteredEmployee = (filterValue: string) => `
                            SELECT employee.id AS id,
                                   employee.display_name AS displayName,
                                   employee.user_principal_name AS userPrincipalName,
                                   employee.department_id AS departmentId
                            FROM employee
                            WHERE employee.display_name LIKE  '${filterValue}%'
                                   order by employee.display_name desc`;

export const getEmployeeByUPN = (email: string) => `
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

/*
                            SELECT 
*
FROM employee_full_info
LEFT JOIN (
	select id,
	display_name as direction_manager
	from employee

) d on d.id = employee_full_info.direction_manager_id

WHERE employee_full_info.user_principal_name = 'a.yudin@center-inform.ru'
*/
