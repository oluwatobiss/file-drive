const express = require("express");
const path = require("node:path");
const indexRouter = require("./routes/index");

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

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
