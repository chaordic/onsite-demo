import ejs from 'ejs/ejs';
// import {
//   setCookie,
//   getCookie,
//   deleteCookie,
//   isInViewport,
// } from '@linx-impulse/commons-js/browser';
// import { ajax } from '@linx-impulse/commons-js/http/ajax';
import templateFrequentlyBoughtWidget from '../../layout/templates/frequentlyBoughtWidget.ejs';
import templateFbtCard from '../../layout/templates/components/fbtCard.ejs';
import templateFbtControls from '../../layout/templates/components/fbtControls.ejs';

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
    console.log('update price');
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
  },
};
