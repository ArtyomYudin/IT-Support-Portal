DROP TABLE IF EXISTS purchase_request_status;
CREATE TABLE IF NOT EXISTS purchase_request_status (
  pr_status_id INT(11) NOT NULL AUTO_INCREMENT,
  pr_status_name VARCHAR(40) NOT NULL,
  PRIMARY KEY (pr_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;