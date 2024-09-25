import { WebAuthnStrategy } from "remix-auth-webauthn/server";
import {
  getAuthenticators,
  getUserByUsername,
  getAuthenticatorById,
  createUser,
  createAuthenticator,
  getUserById,
} from "./db";
import { Authenticator } from "remix-auth";
import { sessionStorage } from "./session";
import type { User, Authenticator as DbAuthenticator } from "~/.server/schema";

export let authenticator = new Authenticator<User>(sessionStorage);

export const webAuthnStrategy = new WebAuthnStrategy<User>(
  {
    rpName: "Remix Auth WebAuthn",
    rpID: (request) => new URL(request.url).hostname,
    origin: (request) => new URL(request.url).origin,
    getUserAuthenticators: async (user) => {
      const authenticators = await getAuthenticators(user);
      return authenticators.map((authenticator) => ({
        ...authenticator,
        credentialID: authenticator.credentialId,
        transports: authenticator.transports.split(","),
      }));
    },
    getUserDetails: (user) =>
      user ? { id: user.id, username: user.username } : null,
    getUserByUsername: async (username) => {
      const user = await getUserByUsername(username);
      return user || null;
    },
    getAuthenticatorById: async (id) => {
      const authenticator = await getAuthenticatorById(id);
      if (!authenticator) return null;
      return {
        ...authenticator,
        credentialID: authenticator.credentialId,
        transports: authenticator.transports,
      };
    },
  },
  async function verify({ authenticator, type, username }) {
    let user: User | null = null;
    const savedAuthenticator = await getAuthenticatorById(
      authenticator.credentialID
    );
    if (type === "registration") {
      if (savedAuthenticator) {
        throw new Error("Authenticator has already been registered.");
      } else {
        if (!username) throw new Error("Username is required.");
        const existingUser = await getUserByUsername(username);

        if (existingUser) throw new Error("User already exists.");

        user = await createUser(username);
        await createAuthenticator({
          userId: user.id,
          credentialId: authenticator.credentialID,
          credentialPublicKey: authenticator.credentialPublicKey,
          counter: authenticator.counter,
          credentialDeviceType: authenticator.credentialDeviceType,
          credentialBackedUp: authenticator.credentialBackedUp,
          transports: Array.isArray(authenticator.transports)
            ? authenticator.transports.join(",")
            : authenticator.transports,
          aaguid: authenticator.aaguid,
        });
      }
    } else if (type === "authentication") {
      if (!savedAuthenticator) throw new Error("Authenticator not found");
      user = await getUserById(savedAuthenticator.userId);
    }

    if (!user) throw new Error("User not found");
    return user;
  }
);

authenticator.use(webAuthnStrategy);
