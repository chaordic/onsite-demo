import ejs from 'ejs/ejs';
import { ajax } from '@linx-impulse/commons-js/http/ajax';
import {
  setCookie,
  getCookie,
  isInViewport,
} from '@linx-impulse/commons-js/browser';
import templateReferenceWidget from '../../layout/templates/referenceWidget.ejs';
import templateReference from '../../layout/templates/components/reference.ejs';
import templateProducts from '../../layout/templates/components/products.ejs';
import templateLoading from '../../layout/templates/components/loading.ejs';
import { carouselRender } from '../utils';

function getRefreshWidget(widget) {
  // Requesting new widget from API based on a new reference.
  return new Promise((resolve, reject) => {
    ajax({
      url: widget.displays[0].refreshReferenceUrl,
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
   * Widget id stays the same and reference id changes.
   * Need to append to the tracked arrays this tuple
   * because when reference changes you need to call another impression.
   */
  const reference = widget.displays[0].references[0];
  const tuple = `${widget.id}-${reference.id}`;
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

export const ReferenceWidget = {
  async refreshWidget(widget, callback) {
    const widgetDiv = $(`#${widget.id}`);
    const referenceDiv = widgetDiv.find('.reference-card');
    const productsDiv = widgetDiv.find('.owl-carousel');

    // Remove product carousel, the reference card and add loading animation.
    productsDiv.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
    productsDiv.find('.owl-stage-outer').children().unwrap();
    productsDiv.empty();
    productsDiv.addClass('owl-carousel');
    productsDiv.addClass('d-block');
    referenceDiv.children('a').remove();
    widgetDiv.find('button').css('display', 'none');

    referenceDiv.append(ejs.render(templateLoading));
    productsDiv.append(ejs.render(templateLoading));

    // Get the new refreshed widget.
    const refreshedWidget = await getRefreshWidget(widget);

    if (!$.isEmptyObject(refreshedWidget)) {
      referenceDiv.children('div').remove();
      referenceDiv.append(ejs.render(templateReference, { widget: refreshedWidget }));
      productsDiv.empty();
      productsDiv.append(ejs.render(templateProducts, { widget: refreshedWidget }));
      // Set the listen to track new refreshes in widget.
      this.listenRefresh(refreshedWidget);
      // Set the tracking events to the new widget.
      this.listenEvents(refreshedWidget, true);
    } else {
      referenceDiv.children('div').remove();
      referenceDiv.append(ejs.render(templateReference, { widget }));
      productsDiv.empty();
      productsDiv.append(ejs.render(templateProducts, { widget }));
    }
    widgetDiv.find('button').css('display', 'inline-block');
    // Rendering carousels with callback render after response.
    callback();
  },

  listenRefresh(widget) {
    const refreshButton = $(`#${widget.id}-refresh`);
    // Turn off listener button
    refreshButton.off();
    refreshButton.mousedown(async () => {
      // Refreshing the widget with the new reference.
      ReferenceWidget.refreshWidget(widget, carouselRender);
    });
  },

  /**
   * Function that iterates through all the widgets and products to activate
   * the tracking of widgets impression and products clicks.
   */
  listenEvents(widget, reload) {
    // Set the Widget Impression track listening.
    listenImpression(widget, reload);
    // Set the Click track listening of the reference.
    const reference = widget.displays[0].references[0];
    listenClicks(widget.id, reference);
    // For each product set the Click track listening.
    const recs = widget.displays[0].recommendations;
    Object.keys(recs).forEach(indexRec => listenClicks(widget.id, recs[indexRec]));
  },

  // Get the html to append in page.
  getHtml(widget) {
    return ejs.render(templateReferenceWidget, { widget });
  },

  render(widget, field) {
    // Injecting html of the widget.
    $(`.${field}`).append(this.getHtml(widget));
    // Set the tracking events of the widget
    this.listenEvents(widget);
    // Set the listening of refresh reference and widget.
    this.listenRefresh(widget);
  },
};
