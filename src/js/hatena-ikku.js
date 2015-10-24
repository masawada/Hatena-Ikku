// Hatena-Ikku

var $ = require('jquery');
var Ikku = require('./ikku.js');

var HatenaIkku = function() {
  var _this = this;

  // init analyzer
  _this.ikku = new Ikku(function() {
    _this._initialize();
  });

  _this.ikkuList = [];
  _this.analyzing = false;
};

HatenaIkku.prototype = {
  _initialize: function() {
    var _this = this;

    // init ikku button
    var div = $('<div>');
    div.css({
      position: 'fixed',
      bottom: '0',
      right: '0',
      padding: '4px 10px',
      margin: '10px',
      color: '#FFFFFF',
      borderRadius: '4px',
      backgroundColor: '#3E93FF',
      cursor: 'pointer'
    })
    .text('ikku');

    div.on('click', function() {
      _this.nextIkku();
    });

    $('body').append(div);

    // load highlight.js
    var highlight = $('<script>');
    highlight.attr('src', chrome.extension.getURL('lib/highlight.js'));
    $('body').append(highlight);
  },
  nextIkku: function() {
    var _this = this;
    if (_this.ikkuList.length === 0) {
      // locked
      if (_this.analyzing) return;

      // lock
      _this.analyzing = true;

      // start analyzing
      _this._prepareIkkuList()
      .then(function() {
        // unlock
        _this.analyzing = false;
        _this._nextIkku();
      });
    } else {
      _this._nextIkku();
    }
  },
  _nextIkku: function() {
    var ikku = this.ikkuList.shift()
    var script = document.createElement('script');
    script.innerHTML = 'highlightIkku("' + ikku + '");';
    document.body.appendChild(script);
  },
  _prepareIkkuList: function() {
    var _this = this;

    // paragraphs to search
    var paragraphs = $.map($('.entry-content p'), function(el) {
      return el.textContent.replace(/<.+?>/g, '');
    });

    return new Promise(function(resolve) {
      _this.ikku.analyze(paragraphs)
      .then(function(list) {
        _this.ikkuList = list;
        resolve();
      });
    });
  }
};

module.exports = HatenaIkku;
