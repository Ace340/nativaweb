/**
 * Error handling utilities
 * Provides consistent error handling across API routes and services
 */

import type { InstagramApiError } from "@/types/instagram";
import { createLogger } from "./logger";

const logger = createLogger("error-handler");

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Instagram API error response format
 */
export interface InstagramErrorResponse {
  success: false;
  error: string;
  type?: string;
  code?: number;
}

/**
 * Handle Instagram API errors consistently
 */
export function handleInstagramError(
  error: unknown,
  context: string
): InstagramErrorResponse {
  logger.error(`${context} failed`, error);

  if (isInstagramApiError(error)) {
    return {
      success: false,
      error: error.error.message,
      type: error.error.type,
      code: error.error.code,
    };
  }

  return {
    success: false,
    error: error instanceof Error ? error.message : "Unknown error occurred",
  };
}

/**
 * Handle generic API errors consistently
 */
export function handleApiError(
  error: unknown,
  context: string,
  customMessage?: string
): ApiErrorResponse {
  logger.error(`${context} failed`, error);

  return {
    success: false,
    error: customMessage || (error instanceof Error ? error.message : "An error occurred"),
  };
}

/**
 * Type guard for Instagram API errors
 */
function isInstagramApiError(error: unknown): error is InstagramApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof (error as InstagramApiError).error === "object"
  );
}

/**
 * Validate API response with error handling
 */
export async function validateApiResponse<T>(
  response: Response,
  context: string
): Promise<T> {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(
        `API error (${response.status}): ${JSON.stringify(errorData)}`
      );
    } catch {
      throw new Error(`API error (${response.status}): ${response.statusText}`);
    }
  }

  return response.json();
}