import ejs from 'ejs/ejs';
import { ajax } from '@linx-impulse/commons-js/http/ajax';
import {
  // setCookie,
  // getCookie,
  isInViewport,
} from '@linx-impulse/commons-js/browser';
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

function isViewed(widget, selectedMenu) {
  /**
   * Widget id keeps the same and the selected reference id changes.
   * Need to append to the tracked arrays this tuple
   * because when reference changes you need to call another impression.
   */
  const tuple = `${widget.id} ${selectedMenu.label}`;
  // Check if widget is in Viewport and it was not viewed before.
  if (isInViewport(document.getElementById(widget.id))
    && global.impressionWidget.indexOf(tuple) === -1) {
    // Push to impressions trackeds to declare that the widget was viewed.
    global.impressionWidget.push(tuple);
    console.log(tuple);
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
  async refreshWidget(widget, index, callback) {
    const widgetDiv = $(`#${widget.id}`);
    const menu = widget.displays[0].menu[index];

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

    widgetLabels.mousedown(function () {
      $(this).addClass(highlight);
      $(this).siblings().removeClass(highlight);

      Object.keys(menuArray).forEach((index) => {
        if (parseInt($(this).attr('id'), 10) === menuArray[index].index) {
          PushWidget.refreshWidget(widget, index, carouselRender);
        }
      });
    });
  },

  listenEvents(widget, reload) {
    const menus = widget.displays[0].menu;
    let selectedMenu;

    Object.keys(menus).forEach((index) => {
      if (menus[index].selected === true) {
        selectedMenu = menus[index];
      }
    });

    // Set the Widget Impression track listening.
    listenImpression(widget, selectedMenu, reload);
    // For each product set the Click track listening.
    // const recs = widget.displays[0].recommendations;
    // Object.keys(recs).forEach(indexRec => listenClicks(widget.id, recs[indexRec]));
  },

  // Get the html to append in page.
  getHtml(widget) {
    return ejs.render(templatePushWidget, { widget });
  },

  render(widget, field) {
    // Injecting html of the widget
    $(`.${field}`).append(this.getHtml(widget));
    // Set the tracking of events.
    this.listenEvents(widget);
    // Set the listening to refresh on widget based on selected menu.
    this.listenRefresh(widget);
  },
};
