export const getFilteredEmployee = (filterValue: string) => `
                            SELECT employee.id AS id,
                                   employee.display_name AS displayName,
                                   employee.user_principal_name AS userPrincipalName
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
