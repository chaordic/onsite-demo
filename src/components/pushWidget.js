import ejs from 'ejs/ejs';
import { ajax } from '@linx-impulse/commons-js/http/ajax';
import {
  setCookie,
  getCookie,
  isInViewport,
} from '@linx-impulse/commons-js/browser';
import { Widget } from './widget';
import templatePushWidget from '../../layout/templates/pushWidget.ejs';
import templateProducts from '../../layout/templates/components/products.ejs';
import templateLoading from '../../layout/templates/components/loading.ejs';
import { carouselRender } from '../utils';

function getRefreshWidget(menu) {
  // Requesting new widget from API based on a new reference.
  return new Promise((resolve, reject) => {
    ajax({
      url: menu.url,
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

function isViewed(widget, selectedMenu) {
  /**
   * Widget id stays the same and the selected menu label changes.
   * Need to append to the tracked arrays this tuple
   * because when the selected menu changes you need to call another impression.
   */
  const tuple = `${widget.id}-${selectedMenu.label}`;
  // Check if widget is in Viewport and it was not viewed before.
  if (isInViewport(document.getElementById(widget.id))
    && global.impressionWidget.indexOf(tuple) === -1) {
    // Push to impressions trackeds to declare that the widget was viewed.
    global.impressionWidget.push(tuple);
    // Ajax request to add the impression track to the API.
    ajax({ url: widget.impressionUrl });
  }
}

function listenImpression(widget, selectedMenu, reload) {
  if (reload === true) {
    isViewed(widget, selectedMenu);
  }
  /**
   * Each time the user scrolls the page is checked
   * if there is any widget on his Viewport.
   */
  $(window).scroll(() => isViewed(widget, selectedMenu));
}

export const PushWidget = {
  async refreshWidget(widget, menu, callback) {
    const widgetDiv = $(`#${widget.id}`);

    // Remove product carousel, the reference card and add loading animation.
    widgetDiv.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
    widgetDiv.find('.owl-stage-outer').children().unwrap();
    widgetDiv.empty();
    widgetDiv.addClass('owl-carousel');

    widgetDiv.append(ejs.render(templateLoading));

    // Get the new refreshed widget.
    const refreshedWidget = await getRefreshWidget(menu);

    widgetDiv.empty();
    widgetDiv.append(ejs.render(templateProducts, { widget: refreshedWidget }));
    // Rendering carousels with callback render after response.
    callback();
    // Set the tracking events to the new widget.
    this.listenEvents(refreshedWidget, true);
  },

  listenRefresh(widget) {
    const widgetLabels = $(`#${widget.id}-labels`).find('.menu-labels');
    const highlight = 'menu-highlight';
    const menuArray = widget.displays[0].menu;

    widgetLabels.mousedown(function onLabelSelect() {
      // Add highlight to the selected.
      $(this).addClass(highlight);
      // Remove highlight from siblings.
      $(this).siblings().removeClass(highlight);
      // For each menu listen the refresh.
      Object.keys(menuArray).forEach((index) => {
        // The menus are identified with their unique campaignIds.
        if ($(this).attr('id') === menuArray[index].campaignId) {
          // The refresh will be applyed based on the selected menu.
          PushWidget.refreshWidget(widget, menuArray[index], carouselRender);
        }
      });
    });
  },

  listenEvents(widget, reload) {
    const menus = widget.displays[0].menu;
    let selectedMenu;

    Object.keys(menus).forEach((index) => {
      if (menus[index].selected) {
        selectedMenu = menus[index];
      }
    });

    // Set the Widget Impression track listening.
    listenImpression(widget, selectedMenu, reload);
    // For each product set the Click track listening.
    const recs = widget.displays[0].recommendations;
    Object.keys(recs).forEach(indexRec => listenClicks(widget.id, recs[indexRec]));
  },

  // Get the html to append in page.
  getHtml(widget) {
    return ejs.render(templatePushWidget, { widget });
  },

  render(widget, field) {
    const menus = widget.displays[0].menu;
    // Check if the Push widget is configured with menu.
    if (menus) {
      // Injecting html of the widget
      $(`.${field}`).append(this.getHtml(widget));
      // Set the tracking of events.
      this.listenEvents(widget);
      // Set the listening to refresh on widget based on selected menu.
      this.listenRefresh(widget);
    } else {
      // If there is no menu is rendered as a default widget.
      Widget.render(widget, field);
    }
  },
};
