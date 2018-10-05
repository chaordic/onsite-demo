import ejs from 'ejs/ejs';
import config from '../config';
import {
  slickRender,
  syntaxHighlight,
  replacer,
} from './utils';
import templateWidget from '../../app/layout/templates/widget.ejs';
import { EventsClient } from './events';

function widgetsRender(response) {
  Object.keys(response).forEach((field) => {
    if ($(`.${field}`).length) {
      $(`.${field}`).empty();
      $(`.${field}`).append(ejs.render(templateWidget,
        {
          response,
          field,
        }));
    }
  });
}

function jsonRender(response) {
  $(`#${config.html.jsonContainer}`).empty();
  $(`#${config.html.jsonContainer}`).append(`
    ${syntaxHighlight(JSON.stringify(response, replacer, 4))}
  `);
}

export const WidgetClient = {
  render(response) {
    widgetsRender(response);
    setTimeout(slickRender, 0);
    jsonRender(response);

    $(`#${config.html.demoContainer}`).removeClass('d-none');
  },

  load(response) {
    this.render(response);
    EventsClient.listenEvents(response);
  },
};
