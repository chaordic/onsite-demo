import { PageClient, WidgetClient } from './manager';
import config from './config';
import './style.scss';

async function applyEventRequestApi() {
  $(`#${config.html.widgetsContainer}`).addClass('hided');
  try {
    const response = await PageClient.getRecommendations(
      ['apiKey', 'secretKey', 'name', 'source', 'deviceId'].reduce((obj, key) => {
        obj[key] = $(`#${key}`).val();
        return obj;
      }, {})
    );

    WidgetClient.render(response);
  } catch (e) {
    alert(e);
  }
}

function listenEventRequestApi() {
  $('#try_btn').click(applyEventRequestApi());
}

const demoApp = {
  async init() {
    listenEventRequestApi();
  },
};

demoApp.init();
