import ejs from 'ejs/ejs';
// import { ajax } from '@linx-impulse/commons-js/http/ajax';
// import {
//   setCookie,
//   getCookie,
//   isInViewport,
// } from '@linx-impulse/commons-js/browser';
import templatePushWidget from '../../layout/templates/pushWidget.ejs';
// import templateProducts from '../../layout/templates/components/products.ejs';
// import templateLoading from '../../layout/templates/components/loading.ejs';
// import { carouselRender } from '../utils';

export const PushWidget = {
  // Get the html to append in page.
  getHtml(widget) {
    return ejs.render(templatePushWidget, { widget });
  },

  render(widget, field) {
    // Injecting html of the widget
    $(`.${field}`).append(this.getHtml(widget));
    // // Set the tracking of events.
    // this.listenEvents(widget);
    // // Set the listening to refresh on widget based on selected reference.
    // this.listenRefresh(widget);
  },
};
