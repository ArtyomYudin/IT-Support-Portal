export const insertUserRequest = (cards: any) => `
    DELETE user_request, ur_attachment, ur_life_cycle
    FROM user_request 
    LEFT OUTER JOIN ur_attachment ON ur_attachment.request_number=user_request.number
    LEFT OUTER ur_life_cycle ON ur_life_cycle.request_number=user_request.number
    WHERE user_request.number in ('${cards}')`;
