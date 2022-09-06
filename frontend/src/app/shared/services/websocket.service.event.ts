export enum Event {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',

  EV_FILTERED_EMPLOYEE = 'event_filtered_employee',
  EV_EMPLOYEE_BY_UPN = 'event_employee_by_upn',
  EV_EMPLOYEE_BY_PARENT_DEPARTMENT = 'event_employee_by_parent_department',
  EV_PURCASE_REQUEST_ALL = 'event_purchase_request_all',
  EV_PURCHASE_REQUEST_INIT_INFO = 'event_purchase_request_init_info',
  EV_PURCHASE_REQUEST_APPROVERS_BY_UPN = 'event_purchase_request_approvers_by_upn',
  EV_USER_REQUEST_ALL = 'event_user_request_all',
  EV_USER_REQUEST_SERVICE = 'event_user_request_service',
  EV_USER_REQUEST_STATUS = 'event_user_request_status',
  EV_USER_REQUEST_PRIORITY = 'event_user_request_priority',
  EV_USER_REQUEST_ATTACHMENT = 'event_user_request_attachment',
  EV_DEPARTMENT = 'event_department',
}
