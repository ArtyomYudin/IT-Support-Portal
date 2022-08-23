DROP TABLE IF EXISTS employee;
CREATE TABLE IF NOT EXISTS employee (
  id INT NOT NULL AUTO_INCREMENT,
  display_name VARCHAR(100) NOT NULL,
  user_principal_name VARCHAR(40) NOT NULL,
  department_id INT NOT NULL,
  position_id INT NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;