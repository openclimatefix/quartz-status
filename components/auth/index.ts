import express, { Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";
import { StatusMessageResponse } from "../../types";
import { Tspec } from "tspec";

const AuthRouter = express.Router();

// Auth0 Authentication + Authorization Flow part 1 – '/authorize' endpoint
// Redirect to Auth0 login page to authenticate the user in the browser
export const authLoginHandler = async (req: Request, res: Response<RequestRedirect>) => {
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
};
AuthRouter.get("/login", authLoginHandler);

export const getAccessTokenUsingCode = async (code: string) => {
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
  try {
    const response = await fetch(`${AUTH0_ISSUER_BASE_URL}/oauth/token`, requestOptions);
    return response.json();
  } catch (error) {
    console.error("Error fetching access token", error);
    throw Error(error as string);
  }
};

export const parseUserDataFromIdToken = (token: string) => {
  if (!token || !token.includes(".")) {
    return {};
  }
  const tokenParts = token.split(".");
  const buff = Buffer.from(tokenParts[1], "base64");
  const text = buff.toString("utf-8");
  return JSON.parse(text);
};

// Auth0 Authentication + Authorization Flow part 2 – '/oauth/token' endpoint
// Fetch access token using authentication code from call above and display token page
AuthRouter.get("/callback", async (req: Request, res: Response) => {
  const { code } = req.query;
  if (typeof code !== "string") {
    console.error("No code found in query", code);
    res.status(400).send("Missing or invalid code parameter.");
    return;
  }
  try {
    const data = await getAccessTokenUsingCode(code as string);
    if (!data.access_token) {
      console.error("No access token found in response", data);
      res.status(500).send("Error fetching access token.");
      return;
    }

    // decode the JWT token to get the user's email address
    const parsedTokenObject = parseUserDataFromIdToken(data.id_token);
    if (!parsedTokenObject.email) {
      console.error("No email found in token", parsedTokenObject);
      res.status(500).send("Error parsing email from token.");
      return;
    }
    data.email = parsedTokenObject.email;

    // Render a simple page with the user's access token
    res.render("token", { token: data.access_token, email: data.email });
  } catch (error) {
    console.error("Error getting access token", error);
    res.status(500).send("Error getting access token.");
  }
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
          res.status(err.statusCode).send({
            status: "error",
            message: `${err.code}`
          });
          break;
      }
      return next();
    }
    console.log("err generic", err);
    // Generic unauthorized error message
    res.status(err.statusCode || 401).send({
      status: "error",
      message: "Unauthorized: please provide a valid token to access this resource."
    });
  }
  return next();
};

export type AuthApiSpec = Tspec.DefineApiSpec<{
  tags: ["Auth"];
  paths: {
    "/auth/login": {
      get: {
        summary: "Login";
        description: "Redirect to the Auth0 login page to authenticate the user.";
        responses: {
          302: "follow";
        };
      };
    };
    "/auth/callback": {
      get: {
        summary: "Callback";
        description: "Automatic redirect from /auth/login – fetches the access token using the authentication code from the login page.";
        responses: {
          200: Response;
          400: StatusMessageResponse;
          500: StatusMessageResponse;
        };
      };
    };
  };
}>;

export default AuthRouter;
