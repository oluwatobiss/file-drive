const { Router } = require("express");
const controller = require("../controllers/index");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const router = Router();

router.get("/", controller.showHomepage);
router.get("/folder/:folderName", controller.showFolderView);
router.get("/sign-up", controller.showSignUpView);
router.get("/log-in", controller.showLoginView);
router.post(
  "/save-file/:folderName",
  upload.single("user-file"),
  controller.saveUploadedFile
);
router.post("/create-folder", controller.createFolder);
router.post("/rename-folder/:folderName", controller.renameFolder);

module.exports = router;
