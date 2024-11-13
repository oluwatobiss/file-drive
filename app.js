const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");
const express = require("express");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
const passport = require("passport");
const path = require("node:path");
const cloudinary = require("cloudinary").v2;
const indexRouter = require("./routes/index");

dotenvExpand.expand(dotenv.config());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
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
