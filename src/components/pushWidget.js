import ejs from 'ejs/ejs';
import { ajax } from '@linx-impulse/commons-js/http/ajax';
// import {
//   setCookie,
//   getCookie,
//   isInViewport,
// } from '@linx-impulse/commons-js/browser';
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

    callback();
  },

  listenRefresh(widget) {
    const widgetLabels = $(`#${widget.id}-labels`).find('.menu-labels');
    const highlight = 'menu-highlight';
    const menuArray = widget.displays[0].menu;

    widgetLabels.mousedown(function () {
      $(this).addClass(highlight);
      $(this).siblings().removeClass(highlight);

      Object.keys(menuArray).forEach((index) => {
        if ($(this).attr('id') === menuArray[index].campaignId) {
          PushWidget.refreshWidget(widget, index, carouselRender);
        }
      });
    });
  },

  // Get the html to append in page.
  getHtml(widget) {
    return ejs.render(templatePushWidget, { widget });
  },

  render(widget, field) {
    // Injecting html of the widget
    $(`.${field}`).append(this.getHtml(widget));
    // // Set the tracking of events.
    // this.listenEvents(widget);
    // // Set the listening to refresh on widget based on selected menu.
    this.listenRefresh(widget);
  },
};
