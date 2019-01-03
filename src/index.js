import { getPageRecommendations } from 'engage-onsite-sdk-js';
import {
  setCookie,
  getCookie,
} from '@linx-impulse/commons-js/browser';
import { stringify } from '@linx-impulse/commons-js/query-string';
import config from './config';
import {
  carouselRender,
  jsonRender,
  urlParams,
  listenToggleSwitch,
} from './utils';
import { Widget } from './components/widget';
import { ReferenceWidget } from './components/referenceWidget';
import { HistoryWidget } from './components/historyWidget';
import { PushWidget } from './components/pushWidget';
import { FrequentlyBoughtWidget } from './components/frequentlyBoughtWidget';
import './styles/style.scss';

function renderWidget(widget, field) {
  const referenceWidgets = [
    'ViewPersonalized',
    'PurchasePersonalized',
    'CartPersonalized',
    'UltimateBuy',
    'Wishlist',
  ];
  // Checking witch type of widget to render
  if (widget.feature === 'FrequentlyBoughtTogether') {
    FrequentlyBoughtWidget.render(widget, field);
  } else if (widget.feature === 'HistoryPersonalized') {
    HistoryWidget.render(widget, field);
  } else if (widget.feature === 'Push') {
    PushWidget.render(widget, field);
  } else if (referenceWidgets.indexOf(widget.feature) !== -1) {
    ReferenceWidget.render(widget, field);
  } else {
    Widget.render(widget, field);
  }
}

/**
 * Slot is a array of widgets.
 * Field is the name of the slot.
 * You can add more slots on the Onsite dashboard.
 * Default slot fields: Top, Middle, Bottom.
*/
function renderSlot(slot, field) {
  // Checking if the slot field exists.
  if ($(`.${field}`).length) {
    $(`.${field}`).empty();
    // For each widget in slot render and track events.
    slot.forEach(widget => renderWidget(widget, field));
  }
}

/**
 *  Rendering slots and widgets from the response.
 */
function renderPage(response) {
  // Iterating through the API response and rendering each slot.
  Object.keys(response).forEach(field => renderSlot(response[field], field));
  // For demo purposes showing the Json response.
  jsonRender(response);
  // Unhiding the container with the slots and widgets.
  $(`#${config.html.demoContainer}`).removeClass('d-none');
  $(`#${config.html.demoContainer}`).animate({ opacity: 1 }, 1200);
}

async function applyEventRequestApi(callback) {
  /**
   * Requesting response from API based on the passed parameters.
   * You may fill the parameters based on your info.
   */
  const labels = [
    'apiKey',
    'secretKey',
    'name',
    'source',
    'deviceId',
    'productId',
    'categoryId',
    'tagId',
    'url',
    'userId',
    'productFormat',
    'salesChannel',
    'dummy',
    'homologation',
    'showOnlyAvailable',
  ];
  const multipleLabels = [
    'categoryId',
    'tagId',
    'productId',
  ];
  const boolLabels = [
    'dummy',
    'homologation',
    'showOnlyAvailable',
  ];
  try {
    const inputs = labels.reduce((obj, key) => {
      if (multipleLabels.indexOf(key) !== -1) {
        obj[key] = $(`#${key}`).val().split(',');
      } else if (boolLabels.indexOf(key) !== -1) {
        obj[key] = $(`#${key}`).val() === 'true';
      } else {
        obj[key] = $(`#${key}`).val();
      }
      return obj;
    }, {});
    const response = await getPageRecommendations(inputs);
    if (getCookie('pageRendered') !== 'true') {
      // Rendering slots and widgets from the response.
      renderPage(response);
      // Rendering carousels with callback render after response.
      callback();
      // Demo toggle autoplay.
      listenToggleSwitch();
      // Demo refresh page (to reset listeners).
      setCookie('pageRendered', 'true');
    } else {
      window.location.assign(`${window.location.href.split('?')[0]}?${stringify(inputs)}`);
    }
  } catch (e) {
    console.log(e);
  }
}

function listenEventRequestApi() {
  $('#try_btn').click(() => applyEventRequestApi(carouselRender));
}

const demoApp = {
  /**
   * Start from the demo site.
   * Need to call trackClicks() to get the
   * tracking urls saved on the cookie and
   * make the ajax request.
   */
  init() {
    setCookie('pageRendered', 'false');
    // Var containing the name of the cookie that saves products URLs.
    global.cookieProductUrls = 'trackingUrl';
    // List of tracked widgets and refreshes.
    global.impressionWidget = [];
    Widget.trackClicks();
    // Check if the url have the insert parameters and add them to the inputs.
    if (urlParams()) {
      applyEventRequestApi(carouselRender);
    }
    // Listen to the interaction with the inputs.
    listenEventRequestApi();
  },
};

demoApp.init();
