const { Router } = require("express");
const controller = require("../controllers/index");

const router = Router();

router.get("/", controller.showHomepage);
router.get("/sign-up", controller.showSignUpView);

module.exports = router;
