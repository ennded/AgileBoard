const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require(jsonwebtoken);

const JWT_SECRET = "secret123";

const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exist");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
  });

  await user.save();
  return user;
};

const loginUser = async ({ email, password }) => {
  const user = User.findOne({ email });

  if (!user) {
    throw new Error("User doesnt Exist");
  }

  const isMatched = await bcrypt.compare(password, user.password);

  if (!isMatched) {
    throw new Error("Invalid Password");
  }

  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1d" });

  return { token, user };
};

module.exports = {
  registerUser,
  loginUser,
};
