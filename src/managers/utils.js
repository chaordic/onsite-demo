import ejs from 'ejs/ejs';
import templateProduct from '../../app/layout/templates/product.ejs';

export function slickRender() {
  $('.carousel').slick({
    dots: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 3,
  });

  $('.product-slide')
    .mouseover(() => {
      $('html,body').css('cursor', 'pointer');
    })
    .mouseout(() => {
      $('html,body').css('cursor', 'default');
    });

  $('.slick-track').addClass('m-4');
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

const ejsIncludeData = {
  product: templateProduct,
};

const ejsInclude = (path, data = {}) => {
  const template = ejsIncludeData[path] || '';
  return ejs.render(template, data);
};

global.ejsInclude = ejsInclude;
