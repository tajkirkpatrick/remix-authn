import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, useActionData, useLoaderData } from "@remix-run/react";
// /app/routes/_auth.login.ts
import { handleFormSubmit } from "remix-auth-webauthn/browser";
import { authenticator, webAuthnStrategy } from "~/.server/auth";
import { sessionStorage } from "~/.server/session";

// /app/routes/_auth.login.ts
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  let session = await sessionStorage.getSession(request.headers.get("Cookie"));

  const options = await webAuthnStrategy.generateOptions(request, user);

  // Set the challenge in a session cookie so it can be accessed later.
  session.set("challenge", options.challenge);

  // Update the cookie
  // response.headers.append("Set-Cookie", await sessionStorage.commitSession(session))
  // response.headers.set("Cache-Control":"no-store")

  // return options;

  return json(options, {
    headers: {
      "Cache-Control": "no-store",
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export default function Login() {
  const options = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  return (
    <Form onSubmit={handleFormSubmit(options)} method="POST">
      <label>
        Username
        <input type="text" name="username" />
      </label>
      <button formMethod="GET">Check Username</button>
      <button
        name="intent"
        value="registration"
        disabled={options.usernameAvailable !== true}
      >
        Register
      </button>
      <button name="intent" value="authentication">
        Authenticate
      </button>
      {actionData?.error ? <div>{actionData.error.message}</div> : null}
    </Form>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    await authenticator.authenticate("webauthn", request, {
      successRedirect: "/",
    });
    return { error: null };
  } catch (error) {
    // This allows us to return errors to the page without triggering the error boundary.
    if (error instanceof Response && error.status >= 400) {
      return { error: (await error.json()) as { message: string } };
    }
    throw error;
  }
}
