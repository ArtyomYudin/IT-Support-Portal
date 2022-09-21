export const updateUserRequestStatus = (statusId: number, requestNumber: string) =>
  `UPDATE user_request SET user_request.status_id='${statusId}' WHERE user_request.number = '${requestNumber}'`;

export const updateUserRequestExecutor = (executorId: number, requestNumber: string) =>
  `UPDATE user_request SET user_request.executor_id='${executorId}' WHERE user_request.number = '${requestNumber}'`;
