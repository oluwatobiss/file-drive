const { Router } = require("express");
const controller = require("../controllers/index");

const router = Router();

router.get("/", controller.showHomepage);
router.get("/sign-up", controller.showSignUpView);
router.get("/log-in", controller.showLoginView);

module.exports = router;
