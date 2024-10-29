import { auth, requiredScopes } from "express-oauth2-jwt-bearer";
import dotenv from "dotenv";
dotenv.config();

export const authOptions = {
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: "RS256"
};
/**
 * Middleware function to check JWT token validity.
 *
 * @param {string} options.audience - The audience for JWT token.
 * @param {string} options.issuerBaseURL - The base URL of the JWT token issuer.
 *
 * @returns {function} middleware - Express middleware function that checks the JWT token.
 * @param config
 */
export const checkJwt = auth(authOptions);

/**
 * Middleware function to check JWT token scopes.
 *
 * @param {string} requiredScopes - The required scopes for the JWT token.
 *
 * @returns {function} middleware - Express middleware function that checks the JWT token scopes.
 */
export const checkScopes = requiredScopes("read:admin");
