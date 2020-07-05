const { User } = require("../models/user.model");

const registerController = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (user) {
    return res.status(422).json({
      error: "Username is already taken.",
    });
  } else {
    const user = new User({
      username,
      password,
    });
    const success = user.save();
    if (success) {
      return res
        .status(200)
        .json({ success: true, message: "Account successfully created." });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Something wrong with database." });
    }
  }
};

const loginController = async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.json({
      loginSuccess: false,
      message: "User does not exist.",
    });
  }
  if (user) {
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) {
        return res
          .status(400)
          .json({ loginSuccess: false, message: "Wrong password" });
      }
      user.generateToken((err, user) => {
        if (err) {
          return res.status(400).send(err);
        }
        if (user) {
          res.cookie("w_authExp", user.tokenExp);
          res.cookie("w_auth", user.token).status(200).json({
            loginSuccess: true,
            userId: user._id,
          });
        }
      });
    });
  } else {
    return res
      .status(500)
      .json({ loginSuccess: false, message: "Something wrong with database." });
  }
};

module.exports = { registerController, loginController };
