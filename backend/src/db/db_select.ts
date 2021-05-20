export const getAllEmployee = `SELECT staff.employee_id AS id,
                                  staff.employee_name AS name,
                                  staff.employee_email AS email
                           FROM staff
                                  order by staff.employee_name desc`;
