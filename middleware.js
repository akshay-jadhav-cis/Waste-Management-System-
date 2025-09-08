module.exports = function isLoggedIn(req, res, next) {
  if (!req.session.user) {
    req.flash("error", "You must be logged in to perform this action.");
    return res.redirect("/users/login");
  }
  next();
};
module.exports.validateSchema = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const msg = error.details.map((el) => el.message).join(", ");
            return res.status(400).send(msg); // you can render an error page instead
        }
        next();
    };
};
