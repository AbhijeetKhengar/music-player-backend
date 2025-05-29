import { STATUS_CODES, VALIDATION_TYPE } from "../constants/api.js";
import { apiResponse } from "../utils/responseHandler.js";

export const validate = (schema, type =  VALIDATION_TYPE.BODY) => (req, res, next) => {
  const { error } = schema.validate(req[type]);
  if (error) return apiResponse(res, false, 'Validation failed : ' + error?.details?.[0]?.message, null, STATUS_CODES.BAD_REQUEST);
  next();
};
