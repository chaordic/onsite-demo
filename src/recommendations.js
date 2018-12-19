import { ajax } from '@linx-impulse/commons-js/http/ajax';
import config from './config';

const getFirstChild = (categories, item) => (
  (categories || []).find(category => (
    !category.used
    && Array.isArray(category.parents)
    && category.parents.indexOf(item.id) !== -1
  ))
);

const formattedCategories = (categories) => {
  // considering the first position of this list is string the others will be
  if (typeof categories[0] === 'string') {
    return categories;
  }

  // Filter wrong formatted
  const filteredCategories = (categories || [])
    .filter(category => (category && category.id))
    .map(category => ({
      id: category.id,
      parents: category.parents,
    }));

  // Find the root node
  let item = filteredCategories.find(category => (
    (
      !category.parents || (
        Array.isArray(category.parents) && !category.parents.length
      )
    )
  ));
  const ids = [];

  while (typeof item === 'object') {
    ids.push(item.id);
    item.used = true;
    item = getFirstChild(filteredCategories, item);
  }

  return ids;
};

const formattedTags = tags => (
  (tags || []).map(tag => (
    typeof tag === 'string' ? tag : (tag.id || tag.name)
  ))
);

export const PageClient = {
  validatePageRecommendations({
    apiKey,
    secretKey,
    name,
    source,
    deviceId,
    url,
    categoryId = [],
    tagId = [],
    productId = [],
    userId,
    productFormat,
    salesChannel,
    dummy = false,
    homologation = false,
    showOnlyAvailable = true,
  }) {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('apiKey is invalid');
    }

    if (!secretKey || typeof secretKey !== 'string') {
      throw new Error('secretKey is invalid');
    }

    if (
      !name
      || typeof name !== 'string'
      || config.pageType.indexOf(name) === -1
    ) {
      throw new Error('name is invalid');
    }

    if (!source || typeof source !== 'string') {
      throw new Error('source is invalid');
    }

    if (!deviceId || typeof deviceId !== 'string') {
      throw new Error('deviceId is invalid');
    }

    if (typeof url !== 'string') {
      throw new Error('url is invalid');
    }

    if (
      !Array.isArray(categoryId)
      || categoryId.filter(i => (
        typeof i !== 'string' && typeof i !== 'object'
      )).length
    ) {
      throw new Error('categoryId is invalid');
    }

    if (
      !Array.isArray(tagId)
      || tagId.filter(i => (
        typeof i !== 'string' && typeof i !== 'object'
      )).length
    ) {
      throw new Error('tagId is invalid');
    }

    if (
      !Array.isArray(productId)
      || productId.filter(i => typeof i !== 'string').length
    ) {
      throw new Error('productId is invalid');
    }

    if (typeof userId !== 'string') {
      throw new Error('userId is invalid');
    }

    if (
      typeof productFormat !== 'string'
      || (
        typeof productFormat === 'string'
        && productFormat.length
        && config.responseType.indexOf(productFormat) === -1
      )
    ) {
      throw new Error('productFormat is invalid');
    }

    if (salesChannel !== undefined && typeof salesChannel !== 'string') {
      throw new Error('salesChannel is invalid');
    }

    if (dummy !== undefined && typeof dummy !== 'boolean') {
      throw new Error('dummy is invalid');
    }

    if (homologation !== undefined && typeof homologation !== 'boolean') {
      throw new Error('homologation is invalid');
    }

    if (showOnlyAvailable !== undefined && typeof showOnlyAvailable !== 'boolean') {
      throw new Error('showOnlyAvailable is invalid');
    }
  },

  getResponse({
    apiKey,
    secretKey,
    name,
    source,
    deviceId,
    url,
    categoryId = [],
    tagId = [],
    productId = [],
    userId,
    productFormat,
    salesChannel,
    dummy,
    homologation,
    showOnlyAvailable,
  } = {}) {
    if (!apiKey) {
      return Promise.reject(new TypeError('apiKey is required to get pages'));
    }
    if (!secretKey) {
      return Promise.reject(new TypeError('secretKey is required to get pages'));
    }
    if (!deviceId) {
      return Promise.reject(new TypeError('deviceId is required to get pages'));
    }
    if (!name) {
      return Promise.reject(new TypeError('name is required to get pages'));
    }
    if (!source) {
      return Promise.reject(new TypeError('source is required to get pages'));
    }
    return new Promise((resolve, reject) => {
      ajax({
        url: `${config.server.baseUrl}${config.server.recommendationUrl}`,
        params: {
          apiKey,
          secretKey,
          name,
          source,
          deviceId,
          url,
          categoryId,
          tagId,
          productId,
          userId,
          productFormat,
          salesChannel,
          dummy,
          homologation,
          showOnlyAvailable,
        },
        success: resolve,
        error: reject,
      });
    });
  },

  getRecommendations(params) {
    this.validatePageRecommendations(params);

    if (params.tagId) {
      params.tagId = formattedTags(params.tagId);
    }

    if (params.categoryId) {
      params.categoryId = formattedCategories(params.categoryId);
    }

    return this.getResponse(params);
  },
};
