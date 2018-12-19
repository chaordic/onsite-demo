import { parse } from '@linx-impulse/commons-js/query-string/parse';
import ejs from 'ejs/ejs';
import config from './config';
import templateProduct from '../layout/templates/components/products.ejs';
import templateReference from '../layout/templates/components/reference.ejs';
import templateCarouselReference from '../layout/templates/components/carouselReference.ejs';
import templateFbtCard from '../layout/templates/components/fbtCard.ejs';
import templateFbtControls from '../layout/templates/components/fbtControls.ejs';

// Util functions for DEMO PURPOSES.

const toggleSelector = $('.switch');

function getToggle() {
  return toggleSelector.attr('toggle');
}

function setToggle(value) {
  toggleSelector.attr('toggle', value);
}

export function carouselRender() {
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
        loop: false,
        dots: false,
        lazyLoad: true,
        nav: true,
        rewind: false,
        autoplay: toggle,
        smartSpeed: 400,
        autoplayTimeout: 5000,
        autoplayHoverPause: false,
        navText: [
          '<i class="octicon octicon-chevron-left"></i>',
          '<i class="octicon octicon-chevron-right"></i>',
        ],
      });

      // Sync autoplay of caroulsels.
      if (getToggle() === 'true') {
        $('.owl-carousel').trigger('stop.owl.autoplay');
        $('.owl-carousel').trigger('play.owl.autoplay');
      }
    }
  });

  $('.slick-vertical').each((index, element) => {
    if (!$(element).hasClass('slick-initialized')) {
      $(element).slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        vertical: true,
        arrows: true,
        infinite: false,
        prevArrow: `<button type="button" class="slick-arrow slick-prev">
                      <span class="octicon octicon-chevron-up"></span>
                    </button>`,
        nextArrow: `<button type="button" class="slick-arrow slick-next">
                      <span class="octicon octicon-chevron-down">
                    </button>`,
      });
    }
  });
}

const ejsHelper = {
  './components/product.ejs': templateProduct,
  './components/reference.ejs': templateReference,
  './components/carouselReference.ejs': templateCarouselReference,
  './components/fbtCard.ejs': templateFbtCard,
  './components/fbtControls.ejs': templateFbtControls,
};

global.ejsInject = (path, options) => {
  const obj = {
    widget: options.widget,
    product: options.product,
    fbtControls: options.fbtControls,
    index: options.index,
  };
  const template = ejs.render(ejsHelper[path], obj);
  return template;
};

global.formatUrl = (url) => {
  let formatted = url;
  if (formatted.indexOf('http') !== 0) {
    formatted = (formatted.indexOf('//') === 0 ? '' : '//') + formatted;
  }
  return formatted;
};

export function urlParams() {
  const url = window.location.href;
  const params = parse(url.split('?')[1]);
  let formattedKey;

  if (Object.keys(params).length === 0) {
    return false;
  }
  Object.keys(params).forEach((key) => {
    formattedKey = key.replace(/\[\]/, '');
    $(`#${formattedKey}`).val(params[key]);
  });
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
