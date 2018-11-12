import { parse } from '@linx-impulse/commons-js/query-string/parse';
import config from './config';

export function owlRender() {
  $('.owl-carousel').owlCarousel({
    items: 4,
    loop: false,
    dots: false,
    lazyLoad: true,
    nav: true,
    slideBy: 4,
    rewind: true,
  });
}

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
