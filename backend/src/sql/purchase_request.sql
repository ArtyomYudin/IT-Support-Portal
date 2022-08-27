DROP TABLE IF EXISTS purchase_request;
CREATE TABLE IF NOT EXISTS purchase_request (
  pr_id INT(11) NOT NULL AUTO_INCREMENT,
  pr_date TIMESTAMP NULL,
  pr_number VARCHAR(40) NULL,
  pr_initiator INT(4) NULL,
  pr_target VARCHAR(255) NULL,
  pr_responsible_person INT(4) NULL,
  pr_expense_item INT(4) NULL,
  pr_reason VARCHAR(255) NULL,
  pr_purchase_departmen INT(4) NULL,
  pr_author_position INT(4) NULL,
  pr_author_name INT(4) NULL,
  pr_head_init_dep INT(4) NULL,
  pr_head_purchase_dep INT(4) NULL,
  pr_deputy_director INT(4) NULL,
  pr_head_fin_dep INT(4) NULL,
  pr_status INT(2) NULL,
  PRIMARY KEY (pr_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;