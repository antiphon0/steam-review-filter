// ==UserScript==
// @name          Steam review keyword filter (Enhanced)
// @author        Tobias Bindel (modified)
// @license       MIT
// @version       1.2
// @description   Allows filtering Steam reviews by keyword, supports exclusions (!keyword), and regex expressions.
// @homepageURL   https://github.com/ImJezze/steam-review-filter.git
// @match         https://steamcommunity.com/app/*/*reviews/*
// @require       https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.slim.min.js
// @grant         GM_addStyle
// @run-at        document-end
// ==/UserScript==

var observer = new MutationObserver(function(mutations) {
  mutations.forEach(e => filterCardRow(e.target));
});

observer.observe(document.getElementById('AppHubCards'), {
  childList: true,
  subtree: true,
  attributes: false,
  characterData: false,
});

function filterCardRow(element) {
  let term = document.getElementById('term');
  if (element.classList.contains('apphub_CardRow')) {
    let cards = element.getElementsByClassName('apphub_Card');
    Array.from(cards).forEach(e => {
      $(e).css('width', '460px');
      $(e).css('height', '400px');

      let content = element.getElementsByClassName('apphub_CardContentMain')[0];
      $(content).css('height', '350px');

      element.parentNode.insertBefore(e, null);
      filterCard(e, term.value);
    });

    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }
}

function filterCards() {
  let term = document.getElementById('term');
  let cards = document.getElementsByClassName('apphub_Card');
  Array.from(cards).forEach(e => filterCard(e, term.value));
}

function filterCard(element, keyword) {
  if (!element.classList.contains('apphub_Card')) return;

  let cardTextContent = element.getElementsByClassName('apphub_CardTextContent')[0];
  if (!cardTextContent) return;

  let text = cardTextContent.innerText.toLowerCase();
  let terms = keyword.split(/\s+/);
  let includePatterns = [];
  let excludePatterns = [];

  // Separate inclusion & exclusion patterns
  terms.forEach(term => {
    if (term.startsWith('!')) {
      excludePatterns.push(term.substring(1));
    } else {
      includePatterns.push(term);
    }
  });

  let includeRegex = includePatterns.length ? new RegExp(includePatterns.join('|'), 'i') : null;
  let excludeRegex = excludePatterns.length ? new RegExp(excludePatterns.join('|'), 'i') : null;

  let show = true;

  // Include filter: At least one pattern must match (if specified)
  if (includeRegex && !includeRegex.test(text)) {
    show = false;
  }

  // Exclude filter: Hide if any exclude pattern matches
  if (excludeRegex && excludeRegex.test(text)) {
    show = false;
  }

  element.classList.toggle('apphub_Card_hidden', !show);
}

// Create input field
let filterKeywordBlank = "enter search term";
let filterKeywordInput = document.createElement("input");
filterKeywordInput.type = "text";
filterKeywordInput.className = "text";
filterKeywordInput.id = "term";
filterKeywordInput.onfocus = function() {
  if (this.value == filterKeywordBlank) {
    this.value = '';
  }
};
filterKeywordInput.onchange = filterCards;
filterKeywordInput.onblur = function() {
  if (this.value == '') {
    this.value = filterKeywordBlank;
  }
};
filterKeywordInput.value = filterKeywordBlank;
filterKeywordInput.autocomplete = "off";

// Add input field
var sectionFilter = document.getElementsByClassName('apphub_SectionFilter')[0];
if (sectionFilter) {
  sectionFilter.insertBefore(filterKeywordInput, null);
}

// Add custom styles
let steamCSS = `
  .apphub_SectionFilterLabel {
    display: none;
  }
  .learnMore {
    display: none;
  }
  .apphub_Card_hidden {
    display: none;
  }
  #filterlanguage {
    width: auto;
    min-width: 150px;
  }
  #term {
    height: 22px;
    width: 340px;
    margin-left: 10px;
  }
`;

GM_addStyle(steamCSS);
