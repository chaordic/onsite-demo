import { parse } from '@linx-impulse/commons-js/query-string/parse';
import ejs from 'ejs/ejs';
import config from './config';
import templateProduct from '../layout/templates/components/products.ejs';
import templateReference from '../layout/templates/components/reference.ejs';

const toggleSelector = $('.switch');

function getToggle() {
  return toggleSelector.attr('toggle');
}

function setToggle(value) {
  toggleSelector.attr('toggle', value);
}

export function owlRender() {
  $('.owl-carousel').each((index, element) => {
    if (!$(element).hasClass('owl-loaded')) {
      let quantity = 4;
      let toggle = false;

      if ($(element).hasClass('owl-3')) {
        quantity = 3;
      } else if ($(element).hasClass('owl-4')) {
        quantity = 4;
      }

      if (getToggle() === 'true') {
        toggle = true;
      } else if (getToggle() === 'false') {
        toggle = false;
      }

      $(element).owlCarousel({
        items: quantity,
        slideBy: quantity,
        loop: true,
        dots: false,
        lazyLoad: true,
        nav: true,
        rewind: false,
        autoplay: toggle,
        smartSpeed: 400,
        autoplayTimeout: 5000,
        autoplayHoverPause: false,
      });

      // Sync autoplay of caroulsels.
      if (getToggle() === 'true') {
        $('.owl-carousel').trigger('stop.owl.autoplay');
        $('.owl-carousel').trigger('play.owl.autoplay');
      }
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
  if (Object.keys(params).length === 0) {
    return false;
  }
  Object.keys(params).forEach(key => $(`#${key}`).val(params[key]));
  return true;
}

export function listenToggleSwitch() {
  toggleSelector.mousedown(() => {
    if (getToggle() === 'false') {
      setToggle('true');
      $('.owl-carousel').trigger('play.owl.autoplay');
    } else if (getToggle() === 'true') {
      setToggle('false');
      $('.owl-carousel').trigger('stop.owl.autoplay');
    }
  });
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
