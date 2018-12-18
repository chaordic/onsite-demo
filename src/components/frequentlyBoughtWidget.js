import ejs from 'ejs/ejs';
import {
  setCookie,
  getCookie,
  isInViewport,
} from '@linx-impulse/commons-js/browser';
import { ajax } from '@linx-impulse/commons-js/http/ajax';
import templateFrequentlyBoughtWidget from '../../layout/templates/frequentlyBoughtWidget.ejs';
import templateFbtCard from '../../layout/templates/components/fbtCard.ejs';
import templateFbtControls from '../../layout/templates/components/fbtControls.ejs';

function listenClicks(widgetId, product) {
  $(`#${product.id}-${widgetId}`).mousedown(() => {
    console.log('clicked on ', product);
    /**
     * If product is clicked append on the cookie the trackUrl.
     * Remember to make the requests when page load in the next access.
     */
    const cookie = getCookie(global.cookieProductUrls);
    let arr = [];

    if (cookie) {
      arr = JSON.parse(cookie);
    }
    arr.push(product.trackingUrl);
    setCookie(global.cookieProductUrls, JSON.stringify(arr));
  });
}

function isViewed(widget) {
  /**
   * Widget id keeps the same and reference id changes.
   * Need to append to the tracked arrays this tuple
   * because when reference changes you need to call another impression.
   */
  const reference = widget.displays[0].references[0];
  const tuple = `${widget.id} ${reference.id}`;
  // Check if widget is in Viewport and it was not viewed before.
  if (isInViewport(document.getElementById(widget.id))
    && global.impressionWidget.indexOf(tuple) === -1) {
    // Push to impressions trackeds to declare that the widget was viewed.
    global.impressionWidget.push(tuple);
    // Ajax request to add the impression track to the API.
    ajax({ url: widget.impressionUrl });
  }
}

function listenImpression(widget, reload) {
  if (reload === true) {
    isViewed(widget);
  }
  /**
   * Each time the user scrolls the page is checked
   * if there is any widget on his Viewport.
   */
  $(window).scroll(() => isViewed(widget));
}

function getIndexProduct(recs, productId) {
  let product;
  let productIndex;
  Object.keys(recs).forEach((index) => {
    if (productId === recs[index].id) {
      product = recs[index];
      productIndex = index;
    }
  });
  return { index: productIndex, details: product };
}

function getCards(widget, card, siblingCard) {
  const recs = widget.displays[0].recommendations;
  const reference = widget.displays[0].references[0];
  const productId = card.children('a').attr('product');
  const selected = {
    product: getIndexProduct(recs, productId),
    active: !card.children('a').hasClass('disabled'),
  };
  const siblingId = siblingCard.children('a').attr('product');
  const sibling = {
    product: getIndexProduct(recs, siblingId),
    active: !siblingCard.children('a').hasClass('disabled'),
  };
  return { reference, selected, sibling };
}

export const FrequentlyBoughtWidget = {
  updatePrice(summary, cardsDisplayed) {
    let priceDisplayed = cardsDisplayed.reference.price;
    if (cardsDisplayed.selected.active) {
      priceDisplayed += cardsDisplayed.selected.product.details.price;
    }
    if (cardsDisplayed.sibling.active) {
      priceDisplayed += cardsDisplayed.sibling.product.details.price;
    }
    priceDisplayed = priceDisplayed.toFixed(2);
    summary.children('.price-fbt').text(priceDisplayed);
  },

  updateCount(summary, cardsDisplayed) {
    let count = 1;
    if (cardsDisplayed.selected.active) {
      count += 1;
    }
    if (cardsDisplayed.sibling.active) {
      count += 1;
    }
    summary.children('.count-fbt').text(count);
  },

  refreshCard(widget, card, siblingCard, summary) {
    const recs = widget.displays[0].recommendations;
    let cardsDisplayed = getCards(widget, card, siblingCard);
    let nextIndex = (parseInt(cardsDisplayed.selected.product.index, 10) + 1) % recs.length;

    if (nextIndex === parseInt(cardsDisplayed.sibling.product.index, 10)) {
      nextIndex = (nextIndex + 1) % recs.length;
    }

    card.children('a').remove();
    card.append(ejs.render(templateFbtCard, {
      widget,
      product: recs[nextIndex],
    }));

    cardsDisplayed = getCards(widget, card, siblingCard);
    this.updatePrice(summary, cardsDisplayed);
    listenClicks(widget.id, cardsDisplayed.selected.product.details);
  },

  removeCard(widget, card, siblingCard, offset, summary) {
    card.children('a').children('div').addClass('disabled');
    card.children('a').addClass('disabled');
    card.children('a').attr('onclick', 'return false;');
    card.children('.fbt-controls').replaceWith(ejs.render(templateFbtControls, {
      fbtControls: { add: true },
    }));

    const cardsDisplayed = getCards(widget, card, siblingCard);

    this.updateCount(summary, cardsDisplayed);
    this.updatePrice(summary, cardsDisplayed);
    this.listenChange(widget, offset);
  },

  addCard(widget, card, siblingCard, offset, summary) {
    card.children('a').children('div').removeClass('disabled');
    card.children('a').attr('onclick', 'return true;');
    card.children('a').removeClass('disabled');
    card.children('.fbt-controls').replaceWith(ejs.render(templateFbtControls, {
      fbtControls: { skip: true, remove: true },
    }));

    const cardsDisplayed = getCards(widget, card, siblingCard);

    this.updateCount(summary, cardsDisplayed);
    this.updatePrice(summary, cardsDisplayed);
    this.listenChange(widget, offset);
  },

  listenChange(widget, offset) {
    const card = $(`#${widget.id}`).children(`.card-fbt:eq(${offset})`);
    const siblingCard = $(`#${widget.id}`).children(`.card-fbt:eq(${offset === 1 ? 2 : 1})`);
    const summary = card.parent().children('.fbt-summary');

    if (card.find('.fbt-skip').length > 0) {
      card.find('.fbt-skip').mousedown(() => this.refreshCard(widget, card, siblingCard, summary));
    }
    if (card.find('.fbt-remove').length > 0) {
      card.find('.fbt-remove').mousedown(() => this.removeCard(widget, card, siblingCard, offset, summary));
    }
    if (card.find('.fbt-add').length > 0) {
      card.find('.fbt-add').mousedown(() => this.addCard(widget, card, siblingCard, offset, summary));
    }
  },

  listenEvents(widget) {
    // Set the Widget Impression track listening.
    listenImpression(widget);
    // Listen click on reference.
    listenClicks(widget.id, widget.displays[0].references[0]);
    // Listen click on recommendations.
    for (let index = 0; index < 2; index += 1) {
      listenClicks(widget.id, widget.displays[0].recommendations[index]);
    }
  },

  // Get the html to append in page.
  getHtml(widget) {
    return ejs.render(templateFrequentlyBoughtWidget, { widget });
  },

  render(widget, field) {
    // Injecting html of the widget.
    $(`.${field}`).append(this.getHtml(widget));
    // Listen changes on FBT controls.
    this.listenChange(widget, 1);
    this.listenChange(widget, 2);
    // Set the listening of refresh reference and widget.
    this.listenEvents(widget);
  },
};
