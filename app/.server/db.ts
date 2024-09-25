import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Client } = pkg;
import * as schema from "~/.server/schema";

const client = new Client({
  connectionString: "postgres://postgres:postgres@127.0.0.1:5432/postgres",
});

await client.connect();
export const db = drizzle(client, { schema, logger: true });

export async function getAuthenticatorById(id: string) {
  if (!id) return null;
  return await db.query.authenticators.findFirst({
    where: (authenticatorsTable, { eq }) =>
      eq(authenticatorsTable.credentialId, id),
  });
}

export async function getAuthenticators(user: schema.User | null) {
  if (!user) return [];
  return await db.query.authenticators.findMany({
    where: (authenticatorsTable, { eq }) =>
      eq(authenticatorsTable.userId, user.id),
  });
}

export async function getUserByUsername(username: string) {
  return await db.query.users.findFirst({
    where: (usersTable, { eq }) => eq(usersTable.username, username),
  });
}

export async function getUserById(id: string) {
  const result = await db.query.users.findFirst({
    where: (usersTable, { eq }) => eq(usersTable.id, id),
  });
  if (!result) return null;
  return result;
}

export async function createAuthenticator(
  authenticator: Omit<schema.NewAuthenticator, "id">
) {
  const [newAuthenticator] = await db
    .insert(schema.authenticators)
    .values(authenticator)
    .returning();
  return newAuthenticator;
}

export async function createUser(username: string): Promise<schema.User> {
  const [user] = await db.insert(schema.users).values({ username }).returning();
  return user;
}
