import ejs from 'ejs/ejs';
import { ajax } from '@linx-impulse/commons-js/http/ajax';
import {
  setCookie,
  getCookie,
  isInViewport,
} from '@linx-impulse/commons-js/browser';
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

function listenClicks(widgetId, product) {
  $(`#${product.id}-${widgetId}`).mousedown(() => {
    console.log(product.id);
    /**
     * If product is clicked append on the cookie the trackUrl.
     * Remember to make the requests when page load in the next access.
     */
    const cookie = getCookie(global.cookieProductUrls);
    let arr = [];

    if (cookie) {
      arr = JSON.parse(cookie);
    }
    arr.push(product.trackingUrl);
    console.log(arr);
    setCookie(global.cookieProductUrls, JSON.stringify(arr));
  });
}

function isViewed(widget) {
  const reference = widget.displays[0].references[0];
  const tuple = `${widget.id} ${reference.id}`;
  // Check if widget is in Viewport and it was not viewed before.
  if (isInViewport(document.getElementById(widget.id))
    && global.impressionWidget.indexOf(tuple) === -1) {
    // Push to impressions trackeds to declare that the widget was viewed.
    global.impressionWidget.push(tuple);
    // Ajax request to add the impression track to the API.
    ajax({ url: widget.impressionUrl });
  }
}

function listenImpression(widget, reload) {
  if (reload === true) {
    isViewed(widget);
  }
  /**
   * Each time the user scrolls the page is checked
   * if there is any widget on his Viewport.
   */
  $(window).scroll(() => isViewed(widget));
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

    this.listenEvents(refreshedWidget, true);
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

  listenEvents(widget, reload) {
    // Set the Widget Impression track listening.
    listenImpression(widget, reload);
    // For each product set the Click track listening.
    const recs = widget.displays[0].recommendations;
    Object.keys(recs).forEach(indexRec => listenClicks(widget.id, recs[indexRec]));
  },

  getHtml(widget) {
    return ejs.render(templateHistoryWidget, { widget });
  },

  render(widget, field) {
    $(`.${field}`).append(this.getHtml(widget));
    this.listenEvents(widget);
    this.listenRefresh(widget);
  },
};
