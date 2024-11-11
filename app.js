const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const path = require("node:path");
const indexRouter = require("./routes/index");

dotenvExpand.expand(dotenv.config());

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.appName = "File Drive";
  next();
});

app.use("/", indexRouter);
app.use((err, req, res, next) => {
  const userData = req.user;
  err &&
    res.status(400).render("error", {
      userStatus: userData?.status,
      error: `${err.message}`,
    });
});

app.listen(port, () => console.log(`Server listening on port ${port}!`));
