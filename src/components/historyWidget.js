import ejs from 'ejs/ejs';
import { ajax } from '@linx-impulse/commons-js/http/ajax';
import {
  setCookie,
  getCookie,
  isInViewport,
} from '@linx-impulse/commons-js/browser';
import { Widget } from './widget';
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
    setCookie(global.cookieProductUrls, JSON.stringify(arr));
  });
}

function isViewed(widget) {
  /**
   * If widget is configured to have references, its id keeps the
   * same and the selected reference id changes.
   * Need to append to the tracked arrays this tuple
   * because when reference changes you need to call another impression.
   */
  const refs = widget.displays[0].references;
  const tuple = `${widget.id}-${refs[0].id}`;
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

    // Remove product carousel and add loading animation.
    productsDiv.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded d-block');
    productsDiv.find('.owl-stage-outer').children().unwrap();
    productsDiv.empty();
    productsDiv.addClass('owl-carousel');
    productsDiv.addClass('d-block');

    productsDiv.append(ejs.render(templateLoading));

    // Get the new refreshed widget.
    const refreshedWidget = await getRefreshWidget(refs[index]);

    productsDiv.empty();
    productsDiv.append(ejs.render(templateProducts, { widget: refreshedWidget }));
    // Rendering carousels with callback render after response.
    callback();
    // Set the tracking events to the new widget.
    this.listenEvents(refreshedWidget, true);
  },

  listenRefresh(widget) {
    const refs = widget.displays[0].references;
    const highlight = 'border-primary';
    const highlightClass = '.references-card';
    const referencesCards = $(`#${widget.id}`).find(highlightClass);

    referencesCards.mousedown(function () {
      // Remove highlight from siblings.
      referencesCards.parent()
        .parent()
        .siblings()
        .find(highlightClass)
        .removeClass(highlight);
      // For each reference in carousel listen the refresh.
      Object.keys(refs).forEach((index) => {
        if ($(this).attr('id').replace(/ref-/, '') === refs[index].id) {
          HistoryWidget.refreshWidget(widget, index, carouselRender);
        }
      });
      // Add highlight to the selected.
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

  // Get the html to append in page.
  getHtml(widget) {
    return ejs.render(templateHistoryWidget, { widget });
  },

  render(widget, field) {
    const refsSize = widget.displays[0].references.length;
    // Check if the History widget is configured with references.
    if (refsSize > 0) {
      // Injecting html of the widget
      $(`.${field}`).append(this.getHtml(widget));
      // Set the tracking of events.
      this.listenEvents(widget);
      // Set the listening to refresh on widget based on selected reference.
      this.listenRefresh(widget);
    } else {
      // If there are no references carousel render as a default widget.
      Widget.render(widget, field);
    }
  },
};
