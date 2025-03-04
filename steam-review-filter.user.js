// ==UserScript==
// @name          Steam review keyword filter
// @author        Tobias Bindel
// @license       MIT
// @version       1.0
// @description   This user script allows you to filter the list of Steam reviews by a keyword.
// @homepageURL   https://github.com/ImJezze/steam-review-filter.git
// @match         https://steamcommunity.com/app/*/*reviews/*
// @require       https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.slim.min.js
// @grant         GM_addStyle
// @run-at        document-end
// ==/UserScript==

var observer = new window.MutationObserver(function(mutations, observer)
{
  mutations.forEach(e =>
  {
    filterCardRow(e.target);
  });
});

observer.observe(document.getElementById('AppHubCards'), {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false,
});

function filterCardRow(element)
{
  let term = document.getElementById('term');

  if (element.classList.contains('apphub_CardRow'))
  {
    let cards = element.getElementsByClassName('apphub_Card');
    Array.from(cards).forEach(e =>
    {
      // make all cards the same size (alligned in two columns)
      $(e).css('width', '460px');
      $(e).css('height', '400px');

      let content = element.getElementsByClassName('apphub_CardContentMain')[0];
      $(content).css('height', '350px');

      // add card directly into the page
      element.parentNode.insertBefore(e, null);

      filterCard(e, term.value);
    });

    // remove card row
    if (element.parentNode)
    {
      element.parentNode.removeChild(element);
    }
  }
}

function filterCards(keyword)
{
  let term = document.getElementById('term');
  let cards = document.getElementsByClassName('apphub_Card');
  Array.from(cards).forEach(e =>
  {
    filterCard(e, term.value);
  });
};

function filterCard(element, keyword) {
  if (!element.classList.contains('apphub_Card')) return;

  let cardTextContent = element.getElementsByClassName('apphub_CardTextContent')[0];
  if (!cardTextContent) return;

  let text = cardTextContent.innerText.toLowerCase();
  let terms = keyword.split(/\s+/); // Split input by spaces
  let includeTerms = [];
  let excludeTerms = [];

  // Separate include and exclude terms
  terms.forEach(term => {
    if (term.startsWith('!')) {
      excludeTerms.push(term.substring(1).toLowerCase()); // Remove '!' and store
    } else {
      includeTerms.push(term.toLowerCase());
    }
  });

  let show = true;

  // Include filter: At least one include term must match (if specified)
  if (includeTerms.length > 0) {
    show = includeTerms.some(term => text.includes(term));
  }

  // Exclude filter: Hide if any exclude term is found
  if (excludeTerms.some(term => text.includes(term))) {
    show = false;
  }

  // Show or hide the review
  element.classList.toggle('apphub_Card_hidden', !show);
}


// create input field
let filterKeywordBlank = "enter search term";
let filterKeywordInput = document.createElement("input");
filterKeywordInput.type = "text";
filterKeywordInput.class = "text";
filterKeywordInput.id = "term";
filterKeywordInput.onfocus = function() {
  if (this.value == filterKeywordBlank)
  {
    this.value = '';
  }
};
filterKeywordInput.onchange = function() {
  filterCards();
};
filterKeywordInput.onblur = function() {
  if (this.value == '')
  {
    this.value = filterKeywordBlank;
  }
};
filterKeywordInput.value = filterKeywordBlank;
filterKeywordInput.autocomplete = "off";

// add input field
var sectionFilter = document.getElementsByClassName('apphub_SectionFilter')[0];
sectionFilter.insertBefore(filterKeywordInput, null);

// add custom styles
let steamCSS = `
  /* hide labels */
  .apphub_SectionFilterLabel {
    display: none;
  }

  /* hide 'about reviews' button */
  .learnMore {
    display: none;
  }

  /* hide reviews */
  .apphub_Card_hidden {
    display: none;
  }

  /* resize language field */
  #filterlanguage {
    width: auto;
    min-width: 150px;
  }

  /* resize input field */
  #term {
    height: 22px;
    width: 340px;
    margin-left: 10px;
  }
`;

GM_addStyle(steamCSS);
