import fetch from "node-fetch";

// Shopify credentials
const shopDomain = "green-check-1183.myshopify.com";
const storefrontToken = "700c88fcf8f4e9329316e9c154258266";
const adminToken = "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";

// to fetch product name from the command
const productName = process.argv[2];

// shopify graphql query to fetch product and variant
const query = `
query getProducts($sortKey: ProductSortKeys, $title: String) {
  products(first: 10, query: $title) {
    edges {
      node {
        title
        variants(first: 10, sortKey: $sortKey) {
          edges {
            node {
              title
              priceV2 {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
}
  `;

const variables = {
  first: 10,
  sortKey: "PRICE",
  title: productName,
};

const getProductFromShopify = async () => {
  try {
    const shopifyResult = await fetch(
      `https://${shopDomain}/api/graphql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": storefrontToken, // using storefront token
        },
        body: JSON.stringify({ query, variables }),
      },
      {}
    );

    const response = await shopifyResult.json();

    if (response.errors) {
      throw new Error(response.errors[0].message);
    }
    console.log(response);

    const products = response.data.products.edges;

    // if no products available on the shop
    if (!products.length) {
      console.log("No products found.");
      return;
    }

    products.forEach((product) => {
      const variants = product.node.variants.edges;
      variants.forEach((variant) => {
        const { title: variantTitle } = variant.node;
        const { amount, currencyCode } = priceV2;
        console.log(
          `${product.node.title} - variant ${variantTitle} - price ${currencyCode}${amount}`
        );
      });
    });
  } catch (error) {
    console.error("Could not fetch products and variants", error);
  }
};

getProductFromShopify();
