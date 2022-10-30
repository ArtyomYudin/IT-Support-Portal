export const updateUserRequestStatus = (statusId: number, requestNumber: string) =>
  `UPDATE user_request SET user_request.status_id='${statusId}' WHERE user_request.number = '${requestNumber}'`;

export const updateUserRequestExecutor = (executorUpn: string, requestNumber: string) =>
  `UPDATE user_request SET user_request.executor_upn='${executorUpn}' WHERE user_request.number = '${requestNumber}'`;
