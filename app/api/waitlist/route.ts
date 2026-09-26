import { NextResponse } from "next/server";

export const runtime = "nodejs";

const minimumNameLength = 2;
const maximumNameLength = 80;
const maximumContactLength = 32;
const allowedContactPattern = /^\+?[\d\s().-]+$/;

function normalizeSpacing(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function isValidContactNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return (
    value.length <= maximumContactLength &&
    allowedContactPattern.test(value) &&
    digits.length >= 7 &&
    digits.length <= 15
  );
}

function normalizeContactNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return `${value.startsWith("+") ? "+" : ""}${digits}`;
}

function errorResponse(status = 503) {
  return NextResponse.json(
    {
      ok: false,
      status: "error",
      message: "Waitlist is temporarily unavailable.",
    },
    { status },
  );
}

type AppsScriptResponse = {
  success?: unknown;
  duplicate?: unknown;
  error?: unknown;
};

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    console.error("Waitlist request body was not valid JSON:", error);
    return errorResponse(400);
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

  if (name.length < minimumNameLength || name.length > maximumNameLength) {
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
  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  const secret = process.env.WAITLIST_SECRET?.trim();

  if (!webhookUrl || !secret) {
    console.error("Waitlist webhook configuration is missing.");
    return errorResponse();
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        contactNumber: normalizedContactNumber,
        secret,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error("Waitlist webhook returned a non-success status:", response.status);
      return errorResponse();
    }

    let result: AppsScriptResponse;

    try {
      result = (await response.json()) as AppsScriptResponse;
    } catch (error) {
      console.error("Waitlist webhook returned invalid JSON:", error);
      return errorResponse();
    }

    if (
      typeof result !== "object" ||
      result === null ||
      result.success !== true ||
      typeof result.duplicate !== "boolean"
    ) {
      const upstreamMessage =
        typeof result?.error === "string" ? result.error.slice(0, 200) : "Unknown error";
      console.error("Waitlist webhook rejected the submission:", upstreamMessage);
      return errorResponse();
    }

    if (result.duplicate) {
      return NextResponse.json({ ok: true, status: "duplicate" });
    }

    return NextResponse.json({ ok: true, status: "success" }, { status: 201 });
  } catch (error) {
    console.error("Waitlist webhook request failed:", error);
    return errorResponse();
  }
}
