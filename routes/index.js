const { Router } = require("express");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const controller = require("../controllers/index");
const multer = require("multer");

const router = Router();
const prisma = new PrismaClient();
const upload = multer({ dest: "uploads/" });
const optionsObject = { usernameField: "email", passReqToCallback: true };

passport.use(
  new LocalStrategy(optionsObject, async (req, email, password, done) => {
    // Empty the error messages field before validating
    req.session.messages && (req.session.messages = null);
    try {
      const userData = await prisma.user.findUnique({ where: { email } });
      await prisma.$disconnect();
      if (!userData)
        return done(null, false, { message: "Incorrect username" });
      const match = await bcrypt.compare(password, userData.password);
      if (!match) return done(null, false, { message: "Incorrect password" });
      return done(null, userData);
    } catch (e) {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    }
  })
);
passport.serializeUser((userData, done) => {
  done(null, userData.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const userData = await prisma.user.findUnique({ where: { id } });
    done(null, userData);
  } catch (err) {
    done(err);
  }
});

router.get("/", controller.showHomepage);
router.get("/folder/:folderName", controller.showFolderView);
router.get("/sign-up", controller.showSignUpView);
router.post("/sign-up", controller.signUpUser);
router.get("/log-in", controller.showLoginView);
router.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/log-in",
    failureMessage: true,
  })
);
router.post(
  "/save-file/:folderName",
  upload.single("user-file"),
  controller.saveUploadedFile
);
router.post("/create-folder", controller.upsertFolder);
router.post("/rename/:folderName", controller.upsertFolder);
router.post("/delete-folder/:folderName", controller.deleteFolder);
router.post("/delete-file/:fileId/:folderName", controller.deleteFile);
router.get("/download/:fileId", controller.downloadFile);

module.exports = router;
