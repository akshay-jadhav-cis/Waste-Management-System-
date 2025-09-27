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

  
  isUserOrAdminLoggedIn: function (req, res, next) {
    if (!req.session.user && !req.session.admin) {
      req.session.returnTo = req.originalUrl; 
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
