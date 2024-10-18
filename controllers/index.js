function showHomepage(req, res) {
  res.render("index");
}

function showSignUpView(req, res) {
  res.render("sign-up");
}

function showLoginView(req, res) {
  res.render("log-in");
}

module.exports = { showHomepage, showSignUpView, showLoginView };
