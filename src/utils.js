import { parse } from '@linx-impulse/commons-js/query-string/parse';
import ejs from 'ejs/ejs';
import config from './config';
import templateProduct from '../layout/templates/components/products.ejs';
import templateReference from '../layout/templates/components/reference.ejs';

export function owlRender() {
  $('.owl-carousel').each((index, element) => {
    if (!$(element).hasClass('owl-loaded')) {
      let quantity;
      if ($(element).hasClass('owl-3')) {
        quantity = 3;
      } else {
        quantity = 4;
      }

      $(element).owlCarousel({
        items: quantity,
        slideBy: quantity,
        loop: false,
        dots: false,
        lazyLoad: true,
        nav: true,
        rewind: true,
      });
    }
  });
}

const ejsHelper = {
  './components/product.ejs': templateProduct,
  './components/reference.ejs': templateReference,
};

global.ejsInject = (path, widget) => {
  const template = ejs.render(ejsHelper[path], { widget });
  return template;
};

export function urlParams() {
  const url = window.location.href;
  const params = parse(url.split('?')[1]);

  if (!params) {
    return false;
  }

  Object.keys(params).forEach(key => $(`#${key}`).val(params[key]));
  return true;
}

export function syntaxHighlight(json) {
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

export function replacer(key, value) {
  return (typeof value === 'number') ? undefined : value;
}

export function jsonRender(response) {
  $(`#${config.html.jsonContainer}`).empty();
  $(`#${config.html.jsonContainer}`).append(`
    ${syntaxHighlight(JSON.stringify(response, replacer, 4))}
  `);
}
