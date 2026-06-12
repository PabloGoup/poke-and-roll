import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireApiUser() {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      session: null,
      response: NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 })
    };
  }
  return { session, response: null };
}

export function secretMatches(received: string | null, expected: string | undefined) {
  if (!received || !expected) return false;
  const receivedBuffer = Buffer.from(received);
  const expectedBuffer = Buffer.from(expected);
  return receivedBuffer.length === expectedBuffer.length
    && crypto.timingSafeEqual(receivedBuffer, expectedBuffer);
}
