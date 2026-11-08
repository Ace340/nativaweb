/**
 * Shopify Storefront API client (boundary module)
 *
 * The ONLY place that talks to Shopify over HTTP. Returns typed result
 * objects — { success, data } | { success: false, error } — so no raw error
 * ever leaks into the render tree (repo code standards: validate at
 * boundaries, never throw into the UI).
 *
 * Verified API facts (see .tmp/context/catalog-feature/bundle.md):
 * - Endpoint: POST https://{domain}/api/2026-10/graphql.json
 * - Auth header: X-Shopify-Storefront-Access-Token
 * - GraphQL errors can arrive with HTTP 200 — body.errors is always checked
 * - Plain fetch only; RSC-safe; no SDK dependency
 *
 * Unconfigured state (env vars missing) is valid, not exceptional: callers
 * check isShopifyConfigured() and shopifyFetch fails softly if called anyway.
 */

/** Storefront API version pinned per the verified 2026-10 facts. */
export const SHOPIFY_API_VERSION = "2026-10";

const STOREFRONT_ACCESS_HEADER = "X-Shopify-Storefront-Access-Token";

export interface ShopifyConfig {
  readonly domain: string;
  readonly accessToken: string;
}

export interface ShopifyError {
  readonly message: string;
  readonly status?: number;
  readonly graphQLErrors?: readonly string[];
}

export type ShopifyFetchResult<TData> =
  | { readonly success: true; readonly data: TData }
  | { readonly success: false; readonly error: ShopifyError };

export interface ShopifyFetchOptions {
  /** GraphQL variables sent alongside the query document. */
  readonly variables?: Record<string, unknown>;
  /**
   * Next.js data-cache revalidation window in seconds. Omit for uncached
   * requests (cart mutations). Catalog reads pass 900 (list) / 60 (detail).
   */
  readonly revalidate?: number;
}

type GraphQLResponseBody<TData> = {
  data?: TData | null;
  errors?: readonly { message?: string }[];
};

/**
 * Strip protocol and trailing slashes so `https://store.myshopify.com/`
 * and `store.myshopify.com` behave identically.
 */
function normalizeDomain(rawDomain: string): string {
  return rawDomain.trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "");
}

/**
 * Read Storefront API credentials from the environment.
 * Returns null (never throws) when either variable is missing — the
 * "unconfigured" state the whole site must tolerate.
 */
export function getShopifyConfig(): ShopifyConfig | null {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!domain || !accessToken) {
    return null;
  }

  const normalizedDomain = normalizeDomain(domain);
  if (!normalizedDomain) {
    return null;
  }

  return Object.freeze({ domain: normalizedDomain, accessToken });
}

/**
 * Predicate: is the Shopify integration ready to make requests?
 */
export function isShopifyConfigured(): boolean {
  return getShopifyConfig() !== null;
}

function storefrontEndpoint(domain: string): string {
  return `https://${domain}/api/${SHOPIFY_API_VERSION}/graphql.json`;
}

function unconfiguredResult<TData>(): ShopifyFetchResult<TData> {
  return {
    success: false,
    error: {
      message:
        "Shopify Storefront API is not configured: set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN",
    },
  };
}

function networkFailure<TData>(error: unknown): ShopifyFetchResult<TData> {
  const reason = error instanceof Error ? error.message : "unknown network error";
  return { success: false, error: { message: `Shopify request failed: ${reason}` } };
}

function extractGraphQLErrorMessages(
  errors: GraphQLResponseBody<unknown>["errors"],
): readonly string[] {
  return (errors ?? []).map((graphQLError) => graphQLError.message ?? "Unknown GraphQL error");
}

/** HTTP-level and body-level validation; GraphQL errors on HTTP 200 land here. */
async function parseResponse<TData>(response: Response): Promise<ShopifyFetchResult<TData>> {
  if (!response.ok) {
    return {
      success: false,
      error: { message: `Shopify returned HTTP ${response.status}`, status: response.status },
    };
  }

  let body: GraphQLResponseBody<TData>;
  try {
    body = (await response.json()) as GraphQLResponseBody<TData>;
  } catch {
    return {
      success: false,
      error: { message: "Shopify returned an invalid JSON body", status: response.status },
    };
  }

  const graphQLErrors = extractGraphQLErrorMessages(body.errors);
  if (graphQLErrors.length > 0) {
    return {
      success: false,
      error: {
        message: `Shopify GraphQL error: ${graphQLErrors[0]}`,
        status: response.status,
        graphQLErrors,
      },
    };
  }

  if (!body.data) {
    return {
      success: false,
      error: { message: "Shopify returned no data", status: response.status },
    };
  }

  return { success: true, data: body.data };
}

/**
 * Execute a GraphQL query or mutation against the Storefront API.
 * Never throws — always resolves to a ShopifyFetchResult.
 */
export async function shopifyFetch<TData>(
  query: string,
  options: ShopifyFetchOptions = {},
): Promise<ShopifyFetchResult<TData>> {
  const config = getShopifyConfig();
  if (!config) {
    return unconfiguredResult<TData>();
  }

  const { variables, revalidate } = options;
  // Only add Next.js cache directives when a revalidate window is given;
  // mutations stay uncached (fetch is not cached by default in Next 16).
  const cacheOptions = revalidate === undefined ? {} : { next: { revalidate } };

  try {
    const response = await fetch(storefrontEndpoint(config.domain), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        [STOREFRONT_ACCESS_HEADER]: config.accessToken,
      },
      body: JSON.stringify({ query, variables }),
      ...cacheOptions,
    });
    return await parseResponse<TData>(response);
  } catch (error) {
    return networkFailure<TData>(error);
  }
}
