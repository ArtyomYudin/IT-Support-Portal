export const getFilteredEmployee = (filterValue: string) => `SELECT staff.employee_id AS id,
                                  staff.employee_name AS name,
                                  staff.employee_email AS email
                           FROM staff
                           WHERE staff.employee_name LIKE  '${filterValue}%'
                                  order by staff.employee_name desc`;
