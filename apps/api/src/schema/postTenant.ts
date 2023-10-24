import Joi from "joi";

export default Joi.object().keys({
  displayName: Joi.string(),
});
