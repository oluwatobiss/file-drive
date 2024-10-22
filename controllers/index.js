function showHomepage(req, res) {
  res.render("index");
}

function showSignUpView(req, res) {
  res.render("sign-up");
}

function showLoginView(req, res) {
  res.render("log-in");
}

function saveUploadedFile(req, res) {
  console.log("===================");
  console.log("File Saved!");
  return res.redirect("/");
}

module.exports = {
  showHomepage,
  showSignUpView,
  showLoginView,
  saveUploadedFile,
};
