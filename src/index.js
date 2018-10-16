import { PageClient } from './recommendations';
import config from './config';
import {
  slickRender,
  jsonRender,
} from './utils';
import './styles/style.scss';
import { Widget } from './components/widget';

function renderWidget(widget, field) {
  // Injecting html of the widget
  $(`.${field}`).append(Widget.render(widget));
  // Set the tracking of events.
  Widget.listenEvents(widget);
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
    slot.forEach((widget) => {
      renderWidget(widget, field);
    });
  }
}

/**
 *  Rendering slots and widgets from the response.
 */
function renderPage(response) {
  // Iterating through the API response and rendering each slot.
  Object.keys(response).forEach((field) => { renderSlot(response[field], field); });

  // Rendering carousels with Slick-carousel plugin.
  setTimeout(slickRender, 0);

  // For demo purposes showing the Json response.
  jsonRender(response);

  // Unhiding the container with the slots and widgets.
  $(`#${config.html.demoContainer}`).removeClass('d-none');
}

async function applyEventRequestApi() {
  // Hiding the container with the slots and widgets.
  $(`#${config.html.demoContainer}`).addClass('d-none');

  /**
   * Requesting response from API based on the passed parameters.
   * You may fill the parameters based on your info.
   */
  try {
    const response = await PageClient.getRecommendations(
      ['apiKey', 'secretKey', 'name', 'source', 'deviceId'].reduce((obj, key) => {
        obj[key] = $(`#${key}`).val();
        return obj;
      }, {})
    );

    // Rendering slots and widgets from the response.
    renderPage(response);
  } catch (e) {
    console.log(e);
  }
}

function listenEventRequestApi() {
  $('#try_btn').click(applyEventRequestApi);
}

const demoApp = {
  /**
   * Start from the demo site.
   * Need to call trackClicks() to get the
   * tracking urls saved on the cookie and
   * make the ajax request.
   */
  init() {
    Widget.trackClicks();
    listenEventRequestApi();
  },
};

demoApp.init();
