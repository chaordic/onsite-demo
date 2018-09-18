import { ajax } from '@linx-impulse/commons-js/http/ajax';
import config from './config';

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

function injectHtml(product, divId) {
  $(`#${divId}`).append(`
    <div id="${product.id}" class="row justify-content-center">
      <img src="https://${product.images.default}" class="rounded mx-auto d-block">
      <div class="m-1">${product.name}</div>
      <div class="m-1"><b>${product.price}</b></div>
    </div>
  `);
}

function insertProduct(widget, divId) {
  const recs = widget.displays[0].recommendations;
  Object.keys(recs).forEach((index) => {
    injectHtml(recs[index], divId);
  });
}

function injectWidget(divClass, divId, widget) {
  $(`.${divClass}`).append(`
    <div>
      <p>
        <h4> <b>Tipo de vitrine: </b>${widget.feature}</h4>
      </p> 
      <div class="carousel" id="${divId}"/>
    </div>
  `);

  insertProduct(widget, divId);
}

function parse(response) {
  let widget;
  let divId;

  Object.keys(response).forEach((field) => {
    if ($(`.${field}`).length) {
      $(`.${field}`).empty();
      $(`.${field}`).append(`
        <h3><b>${field}</b></h3>
        <hr class="my-4">
      `);

      Object.keys(response[field]).forEach((index) => {
        widget = response[field][index];
        divId = `${field}_${index}`;
        injectWidget(field, divId, widget);
      });
    }
  });
}

function slickRender() {
  $(`.${config.html.carouselContainer}`).slick({
    dots: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 3,
  });
}

function syntaxHighlight(json) {
  json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
    let cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return `<span class="${cls}">${match}</span>`;
  });
}

function replacer(key, value) {
  if (typeof value === 'number') {
    return undefined;
  }
  return value;
}

export const WidgetClient = {
  async render(response) {
    parse(response);

    $(`#${config.html.jsonContainer}`).empty();
    $(`#${config.html.jsonContainer}`).append(`
      ${syntaxHighlight(JSON.stringify(response, replacer, 4))}
    `);

    slickRender();

    $(`#${config.html.widgetsContainer}`).removeClass('hided');
  },
};
