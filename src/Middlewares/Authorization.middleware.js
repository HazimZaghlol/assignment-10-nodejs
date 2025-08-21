export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({ message: "Role not found in token" });
    }

    if (roles.length && !roles.includes(req.userRole)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }

    next();
  };
};
