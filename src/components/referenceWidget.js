import ejs from 'ejs/ejs';
import { ajax } from '@linx-impulse/commons-js/http/ajax';
import templateReferenceWidget from '../../layout/templates/referenceWidget.ejs';
import templateReference from '../../layout/templates/components/reference.ejs';
import templateProducts from '../../layout/templates/components/products.ejs';

function getRefreshWidget(widget) {
  return new Promise((resolve, reject) => {
    ajax({
      url: widget.displays[0].refreshReferenceUrl,
      success: resolve,
      error: reject,
    });
  });
}

export const ReferenceWidget = {
  /*
  ** Call the template of the specific type of widget
  ** and returning the html.
  */
  render(widget) {
    return ejs.render(templateReferenceWidget, { widget });
  },

  async refreshWidget(widget, callback) {
    const refreshedWidget = await getRefreshWidget(widget);
    const widgetDiv = $(`#${widget.id}`);
    const referenceDiv = widgetDiv.find('.reference-card');
    const productsDiv = widgetDiv.find('.owl-carousel');

    productsDiv.trigger('destroy.owl.carousel').removeClass('owl-carousel owl-loaded');
    productsDiv.find('.owl-stage-outer').children().unwrap();
    productsDiv.empty();
    productsDiv.addClass('owl-carousel');
    referenceDiv.children('a').empty();

    referenceDiv.append(ejs.render(templateReference, { widget: refreshedWidget }));
    productsDiv.append(ejs.render(templateProducts, { widget: refreshedWidget }));

    $(`#${widget.id}-refresh`).off();
    $(`#${widget.id}-refresh`).mousedown(async () => {
      this.refreshWidget(refreshedWidget, callback);
    });

    callback();
  },
};
