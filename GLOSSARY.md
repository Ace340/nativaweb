# NTV Storefront

The domain language of NTV's direct-selling business: catalog, variants, sales channels, and the transition away from Amazon.

## Language

### Catalog

**Product**:
A sellable handbag design in the catalog, e.g. "Ambar". Customers never buy a Product directly; they buy one of its Variants.
_Avoid_: item, bag

**Variant**:
The buyable form of a Product: a specific color/size combination with its own price and Stock Level.
_Avoid_: option, SKU

**Catalog**:
The full set of Products offered on the Direct Channel.
_Avoid_: product list, store

**Stock Level**:
The tracked quantity of a Variant remaining for sale. Decrements with each sale; a Variant cannot be oversold.
_Avoid_: inventory count, units left

### Selling

**Cart**:
A customer's in-progress selection of Variants awaiting payment.
_Avoid_: basket, bag

**Checkout**:
The step where a customer pays and a Cart becomes an Order.
_Avoid_: payment page, payment flow

**Order**:
A completed purchase of one or more Variants.
_Avoid_: purchase, transaction, sale

### Channels

**Direct Channel**:
Selling on the NTV website itself. Launches in CAD for the Canadian market; fulfillment ships from Canada.
_Avoid_: online store, website sales

**Amazon Channel**:
The legacy amazon.com (US) listings. Coexists with the Direct Channel during the Transition, then is removed.
_Avoid_: the Amazon store

**Transition**:
The coexistence window in which both channels sell the same Products. Ends when Amazon links are removed and Direct becomes the only channel.
_Avoid_: migration, phased rollout

### Site

**Landing Page**:
The story-driven homepage. Remains the homepage after the shop launches; previews the Catalog and links to it.
_Avoid_: home page, front page
