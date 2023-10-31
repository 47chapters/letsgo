import Joi from "joi";

const Schema = {
  postTenant: {
    body: Joi.object().keys({
      displayName: Joi.string(),
    }),
  },
  postPlan: {
    body: Joi.object().keys({
      planId: Joi.string().required(),
      email: Joi.string().email(),
      name: Joi.string(),
    }),
  },
  getPaymentMethod: {
    query: Joi.object()
      .keys({
        setup_intent: Joi.string().required(),
      })
      .unknown(true),
  },
};

export default Schema;
