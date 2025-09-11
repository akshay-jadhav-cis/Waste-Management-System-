module.exports = {
  isLoggedIn: function (req, res, next) {
    if (!req.session.user) {
      req.flash("error", "You must be logged in to perform this action.");
      return res.redirect("/users/login");
    }
    next();
  },

  isAdminLoggedIn: function (req, res, next) {
    if (!req.session.admin) {
      req.flash("error", "You must be logged in as admin to access this page.");
      return res.redirect("/admin/login");
    }
    next();
  },
  isUserOrAdminLoggedIn:function (req, res, next) {
  if (!req.session.user && !req.session.admin) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be logged in to view this page.");
    return res.redirect("/users/login"); // or a common login page
  }
  next();
}
  ,
  validateSchema: (schema) => {
    return (req, res, next) => {
      const { error } = schema.validate(req.body, { abortEarly: false });
      if (error) {
        const msg = error.details.map((el) => el.message).join(", ");
        return res.status(400).send(msg);
      }
      next();
    };
  },
};
