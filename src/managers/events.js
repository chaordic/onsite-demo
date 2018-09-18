import {
  setCookie,
  getCookie,
  deleteCookie,
  isInViewport,
} from '@linx-impulse/commons-js/browser';
import { ajax } from '@linx-impulse/commons-js/http/ajax';

function listenClicks(product) {
  $(`#${product.id}`).click(() => {
    const cookie = getCookie('trackingUrl');
    let arr = [];

    if (cookie) {
      arr = JSON.parse(cookie);
      deleteCookie('trackingUrl');
    }

    arr.push(product.trackingUrl);
    setCookie('trackingUrl', JSON.stringify(arr));

    window.open(product.url, '_blank');
  });
}

function listenImpression(widget, divId) {
  widget.impressionStatus = false;

  if ($(`#${divId}`).length) {
    $(window).scroll(() => {
      if (isInViewport(document.getElementById(divId)) && widget.impressionStatus === false) {
        widget.impressionStatus = true;
        ajax({
          url: widget.impressionUrl,
        });
      }
    });
  }
}

export const EventsClient = {
  listenEvents(response) {
    let recs;
    let widget;
    let idWidget;

    Object.keys(response).forEach((field) => {
      Object.keys(response[field]).forEach((indexField) => {
        widget = response[field][indexField];
        recs = widget.displays[0].recommendations;
        idWidget = `${field}_${indexField}`;

        listenImpression(widget, idWidget);

        Object.keys(recs).forEach((indexRec) => {
          listenClicks(recs[indexRec]);
        });
      });
    });
  },

  trackClicks() {
    const cookie = getCookie('trackingUrl');
    let arr = [];

    if (cookie) {
      arr = JSON.parse(cookie);
      arr.forEach((urlClick) => {
        ajax({
          url: urlClick,
        });
      });
      deleteCookie('trackingUrl');
    }
  },
};
