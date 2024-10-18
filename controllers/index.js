function showHomepage(req, res) {
  res.render("index");
}

function showSignUpView(req, res) {
  res.render("sign-up");
}

module.exports = { showHomepage, showSignUpView };
