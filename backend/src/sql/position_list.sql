DROP TABLE IF EXISTS position_list;
CREATE TABLE IF NOT EXISTS position_list (
  position_id INT NOT NULL AUTO_INCREMENT,
  position_name VARCHAR(256) NOT NULL,
  PRIMARY KEY (position_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;