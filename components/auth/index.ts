import express, { Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";

const AuthRouter = express.Router();

// Auth0 Authentication + Authorization Flow part 1 – '/authorize' endpoint
// Redirect to Auth0 login page to authenticate the user in the browser
AuthRouter.get("/login", async (req: Request, res: Response) => {
  const { AUTH0_CLIENT_ID, AUTH0_ISSUER_BASE_URL, AUTH0_AUDIENCE, SERVER_URL } = process.env;
  // Construct the URL with all the URL encoded auth parameters
  const urlencoded = new URLSearchParams();
  urlencoded.append("response_type", "code");
  urlencoded.append("scope", "openid profile email read:admin");
  urlencoded.append("client_id", `${AUTH0_CLIENT_ID}`);
  urlencoded.append("redirect_uri", `${SERVER_URL}/auth/callback`);
  urlencoded.append("audience", `${AUTH0_AUDIENCE}`);
  const url = `${AUTH0_ISSUER_BASE_URL}/authorize?${urlencoded.toString()}`;
  // Redirect the user to the Auth0 login page, where they can log in and authorize the app
  // to access their profile and other information, then they will be redirected back to the
  // callback URL with an authorization code (below).
  res.redirect(url);
});

// Auth0 Authentication + Authorization Flow part 2 – '/oauth/token' endpoint
// Fetch access token using authentication code from call above and display token page
AuthRouter.get("/callback", async (req: Request, res: Response) => {
  const { code } = req.query;
  const { AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_ISSUER_BASE_URL, SERVER_URL } = process.env;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append("client_id", `${AUTH0_CLIENT_ID}`);
  urlencoded.append("client_secret", `${AUTH0_CLIENT_SECRET}`);
  urlencoded.append("code", `${code}`);
  urlencoded.append("grant_type", "authorization_code");
  urlencoded.append("redirect_uri", `${SERVER_URL}/callback`);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow" as RequestRedirect
  };
  const response = await fetch(`${AUTH0_ISSUER_BASE_URL}/oauth/token`, requestOptions);
  const data = await response.json();

  // decode the JWT token to get the user's email address
  const tokenParts = data.id_token.split(".");
  const buff = Buffer.from(tokenParts[1], "base64");
  const text = buff.toString("utf-8");
  const tokenData = JSON.parse(text);
  data.email = tokenData.email;

  // Render a simple page with the user's access token
  res.render("token", { token: data.access_token, email: data.email });
});

export const unauthorizedErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // if the response is unauthorized, send a message to the client
  if ([401, 403].includes(err.statusCode)) {
    if (err.code) {
      switch (err.code) {
        case "credentials_required":
          res.status(401).send({
            status: "error",
            message: "Unauthorized error: credentials required."
          });
          break;
        case "invalid_token":
          res.status(401).send({
            status: "error",
            message: "Unauthorized: invalid token."
          });
          break;
        case "insufficient_scope":
          res.status(403).send({
            status: "error",
            message: "Forbidden: insufficient scope – you must be an admin to access this resource."
          });
          break;
        default:
          res.status(401).send({
            status: "error",
            message: `Generic ${err.code}`
          });
          break;
      }
      return next();
    }
    // Generic unauthorized error message
    res.status(401).send({
      status: "error",
      message: "Unauthorized: please provide a valid token to access this resource."
    });
  }
  return next();
};

export default AuthRouter;
