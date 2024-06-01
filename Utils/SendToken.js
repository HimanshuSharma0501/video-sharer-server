// import { User } from "../Models/User";
export const SendToken = (res, user, message, statusCode) => {
  const token = user.getJWTToken();
  const options = {
    exprires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, message, user });
};
