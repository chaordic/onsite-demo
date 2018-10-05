import { ajax } from '@linx-impulse/commons-js/http/ajax';
import config from '../config';

function formattedTags(tags) {
  return (tags || []).map(tag => (tag.id || tag.name));
}

function getParent(categories, item) {
  return (categories || []).find(category => (
    Array.isArray(category.parents) && category.parents.indexOf(item.id) !== -1
  ));
}

function filterWrongCategorie(categories) {
  return (categories || []).filter(category => category && category.id);
}

function findRootNode(filteredCategories) {
  return filteredCategories.find(category => (
    (
      !category.parents || (
        Array.isArray(category.parents) && !category.parents.length
      )
    )
  ));
}

function formattedCategories(categories) {
  const filteredCategories = filterWrongCategorie(categories);

  let item = findRootNode(filteredCategories);
  const ids = [];

  while (typeof item === 'object') {
    ids.push(item.id);
    item = getParent(filteredCategories, item);
  }
  return ids;
}

export const PageClient = {
  getRecommendations({
    apiKey,
    secretKey,
    name,
    source,
    deviceId,
    url,
    categories,
    tags,
    product,
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
          categoryId: formattedCategories(categories),
          tagId: formattedTags(tags),
          productId: (product || {}).id,
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
};
