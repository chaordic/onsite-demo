import ejs from 'ejs/ejs';
import {
  setCookie,
  getCookie,
  deleteCookie,
  isInViewport,
} from '@linx-impulse/commons-js/browser';
import { ajax } from '@linx-impulse/commons-js/http/ajax';
import templateWidget from '../../layout/templates/widget.ejs';

function listenClicks(product) {
  $(`#${product.id}`).mousedown(() => {
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
  // Check if widget is in Viewport and it was not viewed before.
  if (isInViewport(document.getElementById(widget.id))
    && global.impressionWidget.indexOf(widget.id) === -1) {
    // Push to impressions trackeds to declare that the widget was viewed.
    global.impressionWidget.push(widget.id);
    // Ajax request to add the impression track to the API.
    ajax({ url: widget.impressionUrl });
  }
}

function listenImpression(widget) {
  /**
   * Each time the user scrolls the page is checked
   * if there is any widget on his Viewport.
   */
  $(window).scroll(() => isViewed(widget));
}

export const Widget = {
  /**
   * Call the template of the widgets carousels
   * and returning the html.
   */
  render(widget) {
    return ejs.render(templateWidget, { widget });
  },

  /**
   * Function that iterates through all the widgets and products to activate
   * the tracking of widgets impression and products clicks.
   */
  listenEvents(widget) {
    // Set the Widget Impression track listening.
    listenImpression(widget);
    // For each product set the Click track listening.
    const recs = widget.displays[0].recommendations;
    Object.keys(recs).forEach(indexRec => listenClicks(recs[indexRec]));
  },

  /**
   * For each trackUrl saved on the cookie make the request to save
   * the click track on the API.
   *
   * This function is used at the beginning of the page
   * and works for all kind of widgets.
   */
  trackClicks() {
    const cookie = getCookie(global.cookieProductUrls);
    let arr = [];

    if (cookie) {
      arr = JSON.parse(cookie);
      arr.forEach(url => ajax({ url }));
      // Deleting the cookie to avoid unnecessary/wrong requests;
      deleteCookie(global.cookieProductUrls);
    }
  },
};
