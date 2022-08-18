export const getFilteredEmployee = (filterValue: string) => `SELECT staff.employee_id AS id,
                                  staff.employee_name AS name,
                                  staff.employee_email AS email
                           FROM staff
                           WHERE staff.employee_name LIKE  '${filterValue}%'
                                  order by staff.employee_name desc`;

export const getEmployeeByEmail = (email: string) => `SELECT staff.employee_id AS id,
                                  staff.employee_name AS name,
                                  organization.unit_name AS unitName
                           FROM staff
                           JOIN organization on(staff.unit_id = organization.unit_id)
                           WHERE staff.employee_email = '${email}'
                                  order by staff.employee_name desc
                            LIMIT 1`;
