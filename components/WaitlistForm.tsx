"use client";

import { FormEvent, useState } from "react";

type FormState =
  | "idle"
  | "loading"
  | "success"
  | "duplicate"
  | "invalid-name"
  | "invalid-phone"
  | "error";

const messages: Partial<Record<FormState, string>> = {
  success: "YOU’RE IN.",
  duplicate: "YOU’RE ALREADY IN.",
  "invalid-name": "ENTER YOUR NAME.",
  "invalid-phone": "ENTER A VALID CONTACT NUMBER.",
  error: "SOMETHING WENT WRONG. TRY AGAIN.",
};

const allowedContactPattern = /^\+?[\d\s().-]+$/;

function isValidContactNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  return (
    value.length <= 32 &&
    allowedContactPattern.test(value) &&
    digits.length >= 7 &&
    digits.length <= 15
  );
}

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [state, setState] = useState<FormState>("idle");

  function clearStatus() {
    if (state !== "idle" && state !== "loading") setState("idle");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim().replace(/\s+/g, " ");
    const normalizedContactNumber = contactNumber.trim().replace(/\s+/g, " ");

    if (!normalizedName || normalizedName.length > 80) {
      setState("invalid-name");
      return;
    }

    if (!isValidContactNumber(normalizedContactNumber)) {
      setState("invalid-phone");
      return;
    }

    setState("loading");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: normalizedName,
          contactNumber: normalizedContactNumber,
        }),
      });
      const data = (await response.json()) as { status?: FormState };

      if (!response.ok) {
        if (data.status === "invalid-name" || data.status === "invalid-phone") {
          setState(data.status);
        } else {
          setState("error");
        }
        return;
      }

      setState(data.status === "duplicate" ? "duplicate" : "success");
      setName("");
      setContactNumber("");
    } catch {
      setState("error");
    }
  }

  const complete = state === "success" || state === "duplicate";
  const hasError =
    state === "error" || state === "invalid-name" || state === "invalid-phone";

  return (
    <form className="waitlist-form" onSubmit={handleSubmit} noValidate>
      <div className="form-row">
        <label className="sr-only" htmlFor="name">
          Name
        </label>
        <input
          className="waitlist-input waitlist-input--name"
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="NAME"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            clearStatus();
          }}
          aria-invalid={state === "invalid-name"}
          aria-describedby="form-status"
          disabled={state === "loading"}
          maxLength={80}
          required
        />

        <label className="sr-only" htmlFor="contact-number">
          Contact number
        </label>
        <input
          className="waitlist-input waitlist-input--contact"
          id="contact-number"
          name="contactNumber"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="CONTACT NUMBER"
          value={contactNumber}
          onChange={(event) => {
            setContactNumber(event.target.value);
            clearStatus();
          }}
          aria-invalid={state === "invalid-phone"}
          aria-describedby="form-status"
          disabled={state === "loading"}
          maxLength={32}
          required
        />

        <button type="submit" disabled={state === "loading"}>
          {state === "loading" ? "SENDING…" : complete ? "DONE" : "SUBMIT"}
        </button>
      </div>
      <p
        className={`form-status${state !== "idle" && state !== "loading" ? " is-visible" : ""}${hasError ? " is-error" : ""}`}
        id="form-status"
        aria-live="polite"
      >
        {messages[state] ?? "\u00A0"}
      </p>
    </form>
  );
}
