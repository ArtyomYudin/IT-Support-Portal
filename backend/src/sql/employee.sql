DROP TABLE IF EXISTS employee;
CREATE TABLE IF NOT EXISTS employee (
  employee_id INT NOT NULL AUTO_INCREMENT,
  employee_name VARCHAR(100) NOT NULL,
  employee_email VARCHAR(40) NOT NULL,
  unit_id INT NOT NULL,
  position_id INT NOT NULL,
  PRIMARY KEY (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;