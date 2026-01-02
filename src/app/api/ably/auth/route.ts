import { NextResponse } from "next/server";
import Ably from "ably";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { env } from "@/env";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = new Ably.Rest({
      key: env.ABLY_API_KEY,
    });

    const tokenRequest = await client.auth.createTokenRequest({
      clientId: session.user.id,
      capability: {
        "conversation:*": ["subscribe", "presence"],
      },
    });

    return NextResponse.json(tokenRequest);
  } catch (error) {
    console.error("Error generating Ably token:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
