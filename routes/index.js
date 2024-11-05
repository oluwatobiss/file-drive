const { Router } = require("express");
const controller = require("../controllers/index");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const router = Router();

router.get("/", controller.showHomepage);
router.get("/folder", controller.showFolderView);
router.get("/sign-up", controller.showSignUpView);
router.get("/log-in", controller.showLoginView);
router.post(
  "/save-file",
  upload.single("user-file"),
  controller.saveUploadedFile
);
router.post("/create-folder", controller.createFolder);

module.exports = router;
