import { config } from "../../config/v1/config";
import logger from "../../logger/v1/logger";
const baseURL = config.postgrestUrl;

async function request(
  method: string,
  table: string,
  { params, body }: { params?: Record<string, any>; body?: any } = {}
) {
  try {
    // Build query params
    const query = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : "";
    logger.info(`[pgrest] Requesting ${method} ${baseURL}/${table}${query}`, {
      params,
      body,
    });
    const res = await fetch(`${baseURL}/${table}${query}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Graceful error
      throw {
        success: false,
        status: res.status,
        error: data.message || "Unexpected error",
        code: data.code || "UNKNOWN",
        details: data.details || null,
      };
    }

    return { success: true, data };
  } catch (err: any) {
    // Network or unknown error
    return {
      success: false,
      status: err.status || 500,
      error: err.error || err.message || "Internal Server Error",
      code: err.code || "INTERNAL_ERROR",
      details: err.details || null,
    };
  }
}

// SELECT (GET rows)
export const pgSelect = (table: string, params?: Record<string, any>) =>
  request("GET", table, { params });

// INSERT (POST new row)
export const pgInsert = (table: string, data: any) =>
  request("POST", table, { body: data });

// UPDATE (PATCH existing row)
export const pgUpdate = (
  table: string,
  match: Record<string, any>,
  data: any
) => request("PATCH", table, { params: match, body: data });

// DELETE (remove row)
export const pgDelete = (table: string, match: Record<string, any>) =>
  request("DELETE", table, { params: match });
