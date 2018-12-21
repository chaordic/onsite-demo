export default {
  server: {
    baseUrl: 'https://recs.chaordicsystems.com/v0',
    recommendationUrl: '/pages/recommendations',
  },
  html: {
    demoContainer: 'container-demo',
    jsonContainer: 'container-json',
  },
  responseType: [
    'onlyIds',
    'compact',
    'complete',
  ],
  pageType: [
    'home',
    'product',
    'category',
    'subcategory',
    'cart',
    'confirmation',
    'userprofile',
    'not_found',
    'search',
    'landing_page',
    'other',
  ],
};
