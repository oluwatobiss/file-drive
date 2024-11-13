const { body } = require("express-validator");

const alphaErr = "can contain only letters";
const lengthErr = (min, max) => `must be between ${min} and ${max} characters`;

const signUp = [
  body("firstName")
    .trim()
    .isAlpha()
    .withMessage(`First name ${alphaErr}.`)
    .isLength({ min: 2, max: 64 })
    .withMessage(`First name ${lengthErr(2, 64)}.`),
  body("lastName")
    .trim()
    .isAlpha()
    .withMessage(`Last name ${alphaErr}.`)
    .isLength({ min: 2, max: 64 })
    .withMessage(`Last name ${lengthErr(2, 64)}.`),
  body("email").trim().isEmail().withMessage("Enter a valid email."),
  body("password")
    .trim()
    .isLength({ min: 3, max: 70 })
    .withMessage(`Password ${lengthErr(3, 70)}.`),
];

module.exports = { signUp };
