module.exports = function isLoggedIn(req, res, next) {
  if (!req.session.user) {
    req.flash("error", "You must be logged in to perform this action.");
    return res.redirect("/users/login");
  }
  next();
};
