// Fetch wrapper for calling the Luxe Screens API from the browser.

// In development Vite proxies /api to the Express server, so the base stays empty.
// In production set VITE_API_URL to the deployed API origin, e.g. https://luxe-api.onrender.com
const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

/** Error thrown for any non-2xx response, carrying the API's { code, message, details }. */
export class ApiClientError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Field errors from a VALIDATION_ERROR response, keyed by field name. */
  get fieldErrors() {
    return this.details?.fieldErrors ?? {};
  }
}

/**
 * Calls `/api/...` and returns the parsed JSON body.
 * Pass `json` to send a JSON request body.
 */
export async function apiFetch(path, init = {}) {
  const { json, headers, ...rest } = init;
  let response;
  try {
    response = await fetch(API_BASE + path, {
      ...rest,
      headers: {
        ...(json === undefined ? {} : { "Content-Type": "application/json" }),
        ...headers,
      },
      body: json === undefined ? rest.body : JSON.stringify(json),
    });
  } catch (error) {
    // A cancelled request (AbortController) should stay an AbortError.
    if (error?.name === "AbortError") throw error;
    throw new ApiClientError(
      0,
      "NETWORK_ERROR",
      "Network error. Check your connection and try again.",
    );
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = body?.error;
    throw new ApiClientError(
      response.status,
      error?.code ?? "INTERNAL_ERROR",
      error?.message ?? "Something went wrong. Please try again.",
      error?.details,
    );
  }
  return body;
}

export function errorMessage(error) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}
