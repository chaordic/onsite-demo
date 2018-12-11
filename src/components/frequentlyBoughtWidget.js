import ejs from 'ejs/ejs';
// import {
//   setCookie,
//   getCookie,
//   deleteCookie,
//   isInViewport,
// } from '@linx-impulse/commons-js/browser';
// import { ajax } from '@linx-impulse/commons-js/http/ajax';
import templateFrequentlyBoughtWidget from '../../layout/templates/frequentlyBoughtWidget.ejs';

export const FrequentlyBoughtWidget = {
  // listenChange(widget) {

  // },

  // Get the html to append in page.
  getHtml(widget) {
    return ejs.render(templateFrequentlyBoughtWidget, { widget });
  },

  render(widget, field) {
    // Injecting html of the widget
    $(`.${field}`).append(this.getHtml(widget));
  },
};
