/**
 * Shopify Storefront API GraphQL documents (API version 2026-10)
 *
 * Exported as plain strings for inspection and reuse; composed from shared
 * fragments so product and cart field selections stay consistent.
 * Field choices follow the verified facts in
 * .tmp/context/catalog-feature/bundle.md — notably `price` (priceV2 is
 * deprecated) and userErrors on every cart mutation payload.
 *
 * The cart ID is opaque (`gid://shopify/Cart/<id>?key=<secret>`); nothing
 * here parses or exposes it — see the cart cookie handling in later phases.
 */

const VARIANT_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment VariantFields on ProductVariant {
    id
    title
    availableForSale
    quantityAvailable
    price {
      amount
      currencyCode
    }
    compareAtPrice {
      amount
      currencyCode
    }
    selectedOptions {
      name
      value
    }
    image {
      url
      alt
    }
  }
`;

const PRODUCT_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    title
    handle
    availableForSale
    media(first: 10) {
      edges {
        node {
          ... on MediaImage {
            image {
              url
              alt
            }
          }
        }
      }
    }
    variants(first: 50) {
      edges {
        node {
          ...VariantFields
        }
      }
    }
  }
`;

const CART_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 100) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
            amountPerQuantity {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              price {
                amount
                currencyCode
              }
              quantityAvailable
              selectedOptions {
                name
                value
              }
              image {
                url
                alt
              }
              product {
                title
                handle
              }
            }
          }
        }
      }
    }
  }
`;

/** Full fragment set every product document needs (ProductFields uses VariantFields). */
const PRODUCT_FRAGMENTS = `${VARIANT_FIELDS_FRAGMENT}\n${PRODUCT_FIELDS_FRAGMENT}`;

/** Catalog list view. Deliberately omits descriptionHtml (detail-only field). */
export const PRODUCTS_LIST_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENTS}

  query ProductsList($first: Int!) {
    products(first: $first) {
      edges {
        node {
          ...ProductFields
        }
      }
    }
  }
`;

/** Product detail view: same shape as the list plus descriptionHtml. */
export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENTS}

  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
      descriptionHtml
    }
  }
`;

/** Fetch an existing Cart by its opaque ID. */
export const CART_GET_QUERY = /* GraphQL */ `
  ${CART_FIELDS_FRAGMENT}

  query CartGet($id: ID!) {
    cart(id: $id) {
      ...CartFields
    }
  }
`;

export const CART_CREATE_MUTATION = /* GraphQL */ `
  ${CART_FIELDS_FRAGMENT}

  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = /* GraphQL */ `
  ${CART_FIELDS_FRAGMENT}

  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = /* GraphQL */ `
  ${CART_FIELDS_FRAGMENT}

  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = /* GraphQL */ `
  ${CART_FIELDS_FRAGMENT}

  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;
