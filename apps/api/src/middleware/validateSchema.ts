import Joi from "joi";
import createError from "http-errors";
import { RequestHandler } from "express";

export interface ValidateSchemaOptions {
  body?: Joi.Schema;
  params?: Joi.Schema;
  query?: Joi.Schema;
}

export default function validateSchemaFactory(options: ValidateSchemaOptions) {
  const validateSchema: RequestHandler = (req, res, next) => {
    for (let p in options) {
      if (!(req as any)[p]) {
        return next(
          createError(
            400,
            `Request is missing '${p}': must be present for validation`
          )
        );
      }

      let result = (options as any)[p].validate((req as any)[p]);
      if (result.error) {
        const detail = result.error.details[0];
        console.log("SCHEMA VALIDATION ERROR", { body: req.body });
        return next(
          createError(400, `${detail.path.join(".")}: ${detail.message}`)
        );
      }
      (req as any)[p] = result.value;
    }
    return next();
  };
  return validateSchema;
}
