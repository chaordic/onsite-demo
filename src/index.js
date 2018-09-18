import { PageClient } from './managers/recommendations';
import { WidgetClient } from './managers/widget';
import { EventsClient } from './managers/events';
import config from './config/config';
import '../app/styles/style.scss';

async function applyEventRequestApi() {
  $(`#${config.html.demoContainer}`).addClass('d-none');
  try {
    const response = await PageClient.getRecommendations(
      ['apiKey', 'secretKey', 'name', 'source', 'deviceId'].reduce((obj, key) => {
        obj[key] = $(`#${key}`).val();
        return obj;
      }, {})
    );
    WidgetClient.load(response);
  } catch (e) {
    console.log(e);
  }
}

function listenEventRequestApi() {
  $('#try_btn').click(applyEventRequestApi);
}

const demoApp = {
  init() {
    EventsClient.trackClicks();
    listenEventRequestApi();
  },
};

demoApp.init();
