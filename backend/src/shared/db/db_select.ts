export const getFilteredEmployee = (filterValue: string) => `
                            SELECT employee.employee_id AS id,
                                   employee.employee_name AS name,
                                   employee.employee_email AS email
                            FROM employee
                            WHERE employee.employee_name LIKE  '${filterValue}%'
                                   order by employee.employee_name desc`;

export const getEmployeeByEmail = (email: string) => `
                            SELECT employee.employee_id AS id,
                                   employee.employee_name AS name,
                                   department.unit_name AS unitName,
                                   position_list.position_name AS positionName
                            FROM employee
                                   INNER JOIN department on(employee.unit_id = department.unit_id)
                                   INNER JOIN position_list on(employee.position_id = position_list.position_id)
                            WHERE employee.employee_email = '${email}'
                                   order by employee.employee_name desc
                            LIMIT 1`;
