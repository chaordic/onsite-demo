import ejs from 'ejs/ejs';
// import { ajax } from '@linx-impulse/commons-js/http/ajax';
// import {
//   setCookie,
//   getCookie,
//   isInViewport,
// } from '@linx-impulse/commons-js/browser';
import templateHistoryWidget from '../../layout/templates/historyWidget.ejs';
// import templateProducts from '../../layout/templates/components/products.ejs';
// import templateLoading from '../../layout/templates/components/loading.ejs';

export const HistoryWidget = {
  listenRefresh(widget) {
    const highlight = 'border border-primary';
    const highlightClass = '.references-card';
    const referencesCards = $(`#${widget.id}`).find(highlightClass);

    referencesCards.mousedown(function () {
      referencesCards.parent()
        .parent()
        .siblings()
        .find(highlightClass)
        .removeClass(highlight);
      $(this).addClass(highlight);
    });
  },

  getHtml(widget) {
    return ejs.render(templateHistoryWidget, { widget });
  },

  render(widget, field) {
    $(`.${field}`).append(this.getHtml(widget));
    this.listenRefresh(widget);
  },
};
