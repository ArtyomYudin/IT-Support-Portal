export const getFilteredEmployee = (filterValue: string) => `
                            SELECT employee.id AS id,
                                   employee.display_name AS displayName,
                                   employee.user_principal_name AS userPrincipalName
                            FROM employee
                            WHERE employee.display_name LIKE  '${filterValue}%'
                                   order by employee.display_name desc`;

export const getEmployeeByEmail = (email: string) => `
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
                                   employee_full_info.display_name AS author_display_name,
                                   employee_full_info.department_name AS author_department_name,
                                   employee.display_name AS responsible_displey_name,
                                   purchase_request.target AS purchase_target,
                                   purchase_request.status_id AS status_id
                            FROM purchase_request
                                   INNER JOIN employee_full_info on(purchase_request.author_id = employee_full_info.id)
                                   INNER JOIN employee on(purchase_request.responsible_person_id = employee.id)
                            ORDER by purchase_request.date`;
