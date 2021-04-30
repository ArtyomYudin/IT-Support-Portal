DROP TABLE IF EXISTS organization;
CREATE TABLE IF NOT EXISTS organization (
  unit_id INT NOT NULL AUTO_INCREMENT,
  unit_name VARCHAR(256) NOT NULL,
  parent_unit_id INT,
  unit_manager_id INT,
  PRIMARY KEY (unit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;