import ejs from 'ejs/ejs';
import { ajax } from '@linx-impulse/commons-js/http/ajax';
// import {
//   setCookie,
//   getCookie,
//   isInViewport,
// } from '@linx-impulse/commons-js/browser';
import templateHistoryWidget from '../../layout/templates/historyWidget.ejs';
import templateProducts from '../../layout/templates/components/products.ejs';
import templateLoading from '../../layout/templates/components/loading.ejs';
import { carouselRender } from '../utils';

function getRefreshWidget(ref) {
  // Requesting new widget from API based on a new reference.
  return new Promise((resolve, reject) => {
    ajax({
      url: ref.getRecommendationsUrl,
      success: resolve,
      error: reject,
    });
  });
}

export const HistoryWidget = {
  async refreshWidget(widget, index, callback) {
    const refs = widget.displays[0].references;
    const widgetDiv = $(`#${widget.id}`);
    const productsDiv = widgetDiv.find('.owl-carousel');

    productsDiv.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
    productsDiv.find('.owl-stage-outer').children().unwrap();
    productsDiv.empty();
    productsDiv.addClass('owl-carousel');

    productsDiv.append(ejs.render(templateLoading));

    const refreshedWidget = await getRefreshWidget(refs[index]);

    productsDiv.empty();
    productsDiv.append(ejs.render(templateProducts, { widget: refreshedWidget }));

    console.log(refreshedWidget);
    callback();
  },

  listenRefresh(widget) {
    const refs = widget.displays[0].references;
    const highlight = 'border border-primary';
    const highlightClass = '.references-card';
    const referencesCards = $(`#${widget.id}`).find(highlightClass);

    referencesCards.mousedown(function () {
      referencesCards.parent()
        .parent()
        .siblings()
        .find(highlightClass)
        .removeClass(highlight);
      Object.keys(refs).forEach((index) => {
        if ($(this).attr('id').replace(/ref-/, '') === refs[index].id) {
          HistoryWidget.refreshWidget(widget, index, carouselRender);
        }
      });
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
