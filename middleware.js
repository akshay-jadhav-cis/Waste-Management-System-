module.exports = {
  // Middleware: check if a normal user is logged in
  isLoggedIn: function (req, res, next) {
    if (!req.session.user) {
      req.flash("error", "You must be logged in to perform this action.");
      return res.redirect("/users/login");
    }
    next();
  },

  // Middleware: check if an admin is logged in
  isAdminLoggedIn: function (req, res, next) {
    if (!req.session.admin) {
      req.flash("error", "You must be logged in as admin to access this page.");
      return res.redirect("/admin/login");
    }
    next();
  },

  // Middleware: check if either user OR admin is logged in
  isUserOrAdminLoggedIn: function (req, res, next) {
    if (!req.session.user && !req.session.admin) {
      req.session.returnTo = req.originalUrl; // optional redirect after login
      req.flash("error", "You must be logged in to view this page.");

      // Redirect to login page based on route type
      if (req.originalUrl.startsWith("/admin")) {
        return res.redirect("/admin/login");
      } else {
        return res.redirect("/users/login");
      }
    }
    next();
  },

  // Middleware: check if an employee is logged in
  isEmployeeLoggedIn: function (req, res, next) {
    if (!req.session.employee) {
      req.flash("error", "You must be logged in to access this page.");
      return res.redirect("/workers/employee/login");
    }
    next();
  },

  // Middleware: validate request body with Joi schema
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
