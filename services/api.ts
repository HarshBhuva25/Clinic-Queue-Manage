import { API_BASE_URL } from "@/utils/constants";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: HeadersInit;
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string>= {
    Accept: "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response =await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    body,
    cache: "no-store",
  });

  const rawTxt= await response.text();
  let resData: unknown =null;

  if (rawTxt) {
    try {
      resData = JSON.parse(rawTxt);
    } catch {
      resData = rawTxt;
    }
  }

  if (!response.ok) {
    let message= `Request failed with status ${response.status}`;

    if (
      resData &&
      typeof resData === "object" &&
      "message" in resData &&
      Array.isArray((resData as Record<string, unknown>).message)
   ) {
      // NestJS class-validator returns message as string[]
      message = ((resData as Record<string, unknown>).message as string[]).join(", ");
    } else if (
      resData &&
      typeof resData === "object" &&
      "message" in resData &&
      typeof (resData as Record<string, unknown>).message === "string"
    ) {
     message = (resData as Record<string, unknown>).message as string;
    } else if (
      resData &&
      typeof resData === "object" &&
      "error" in resData &&
      typeof (resData as Record<string, unknown>).error === "string"
    ) {
      message = (resData as Record<string, unknown>).error as string;
    } else if (typeof resData === "string" && resData.trim()) {
     message = resData;
    }

    throw new ApiError(message, response.status);
  }

  return resData as T;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export function isUnauthorizedError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 401;
}
