import ejs from 'ejs/ejs';
import templateReferenceWidget from '../../layout/templates/referenceWidget.ejs';

export const ReferenceWidget = {
  /*
  ** Call the template of the specific type of widget
  ** and returning the html.
  */
  render(widget) {
    return ejs.render(templateReferenceWidget, { widget });
  },
};
