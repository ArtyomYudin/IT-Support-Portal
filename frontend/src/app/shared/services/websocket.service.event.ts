export enum Event {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',

  EV_EMPLOYEE = 'event_employee',
  EV_DEPARTMENT = 'event_department',

  EV_FILTERED_EMPLOYEE = 'event_filtered_employee',
  EV_EMPLOYEE_BY_UPN = 'event_employee_by_upn',
  EV_EMPLOYEE_BY_PARENT_DEPARTMENT = 'event_employee_by_parent_department',

  EV_PURCASE_REQUEST_ALL = 'event_purchase_request_all',
  EV_PURCHASE_REQUEST_INIT_INFO = 'event_purchase_request_init_info',
  EV_PURCHASE_REQUEST_APPROVERS_BY_UPN = 'event_purchase_request_approvers_by_upn',

  EV_USER_REQUEST_ALL = 'event_user_request_all',
  EV_USER_REQUEST_BY_NUMBER = 'event_user_request_by_number',
  EV_USER_REQUEST_NEW_NUMBER = 'event_user_request_new_number',
  EV_USER_REQUEST_SERVICE = 'event_user_request_service',
  EV_USER_REQUEST_STATUS = 'event_user_request_status',
  EV_USER_REQUEST_PRIORITY = 'event_user_request_priority',
  EV_USER_REQUEST_ATTACHMENT = 'event_user_request_attachment',
  EV_USER_REQUEST_ATTACHMENT_BASE64 = 'event_user_request_attachment_base64',
  EV_USER_REQUEST_LIFE_CYCLE = 'event_user_request_life_cycle',

  EV_NOTIFY = 'event_notify',

  EV_AVAYA_CDR = 'event_avaya_cdr',
  EV_AVAYA_CDR_FILTERED = 'event_avaya_cdr_filtered',

  EV_VPN_COMPLETED_SESSION = 'event_vpn_completed_session',
  EV_VPN_COMPLETED_SESSION_BY_UPN = 'event_vpn_completed_session_by_upn',
  EV_VPN_ACTIVE_SESSION = 'event_vpn_active_session',

  EV_PROVIDER_INFO = 'event_provider_info',
  EV_AVAYA_E1_INFO = 'event_avaya_e1_info',
  EV_HARDWARE_GROUP_ALARM = 'event_hardware_group_alarm',
}
