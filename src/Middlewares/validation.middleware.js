export const validateRequest = (schema) => {
  return (req, res, next) => {
    const keys = ["body", "query", "headers", "params"];
    let allErrors = [];
    for (const key of keys) {
      if (schema[key]) {
        const { error } = schema[key].validate(req[key], { abortEarly: false });
        if (error) {
          allErrors = allErrors.concat(error.details.map((d) => `${key}: ${d.message}`));
        }
      }
    }
    if (allErrors.length > 0) {
      return res.status(400).json({ message: allErrors });
    }

    next();
  };
};
