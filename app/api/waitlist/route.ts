import { NextResponse } from "next/server";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

const allowedContactPattern = /^\+?[\d\s().-]+$/;

function normalizeSpacing(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function isValidContactNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return (
    value.length <= 32 &&
    allowedContactPattern.test(value) &&
    digits.length >= 7 &&
    digits.length <= 15
  );
}

function normalizeContactNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return `${value.startsWith("+") ? "+" : ""}${digits}`;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, status: "invalid-name", message: "Enter your name." },
      { status: 400 },
    );
  }

  const name =
    typeof body === "object" &&
    body !== null &&
    "name" in body &&
    typeof body.name === "string"
      ? normalizeSpacing(body.name)
      : "";
  const contactNumber =
    typeof body === "object" &&
    body !== null &&
    "contactNumber" in body &&
    typeof body.contactNumber === "string"
      ? normalizeSpacing(body.contactNumber)
      : "";

  if (!name || name.length > 80) {
    return NextResponse.json(
      { ok: false, status: "invalid-name", message: "Enter your name." },
      { status: 400 },
    );
  }

  if (!isValidContactNumber(contactNumber)) {
    return NextResponse.json(
      {
        ok: false,
        status: "invalid-phone",
        message: "Enter a valid contact number.",
      },
      { status: 400 },
    );
  }

  const normalizedContactNumber = normalizeContactNumber(contactNumber);

  try {
    const pool = getPool();
    await pool.query(
      "INSERT INTO waitlist (name, contact_number) VALUES ($1, $2)",
      [name, normalizedContactNumber],
    );

    return NextResponse.json({ ok: true, status: "success" }, { status: 201 });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return NextResponse.json({ ok: true, status: "duplicate" });
    }

    console.error("Waitlist submission failed:", error);
    return NextResponse.json(
      {
        ok: false,
        status: "error",
        message: "Waitlist is temporarily unavailable.",
      },
      { status: 503 },
    );
  }
}
