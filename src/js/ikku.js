// ikku

var Ikku = function(ready) {
  // init tokenizer
  var Tokenizer = (function() {
    var tokenizer = function() {
      kuromoji.builder({
        dicPath: chrome.extension.getURL('dict/')
      })
      .build(function(err, _tokenizer) {
        this._tokenizer = _tokenizer;
        ready.call();
        return this._tokenizer;
      }.bind(this));
    };

    tokenizer.prototype.tokenize = function(text, callback) {
      if (this._tokenizer) {
        return callback(this._tokenizer.tokenize(text));
      }
    };

    return tokenizer;
  })();

  this.tokenizer = new Tokenizer();
  this.ikkuList = [];
};

Ikku.prototype = {
  analyze: function(paragraphs) {
    var _this = this;

    return Promise.resolve()
    .then(function() {
      return Promise.all(paragraphs.map(function(p) {
        return new Promise(function(resolve, reject) {
          _this.tokenize(p)
          .then(function(obj) {
            _this.detectIkku(obj);
            resolve();
          });
        });
      }));
    })
    .then(function() {
      return new Promise(function(resolve, reject) {
        resolve(_this.ikkuList);
      });
    });
  },
  tokenize: function(text) {
    if (!this.tokenizer.tokenize) return;

    return new Promise(function(resolve) {
      this.tokenizer.tokenize(text, function(obj) {
        resolve(obj);
      });
    }.bind(this));
  },

  detectIkku: function(obj) {
    var head = 0; // 読み取り開始ポイント
    var read = 0; // headからreadしていく
    var mora = 0;
    var moraSet = [5, 7, 5];
    var moraPointer = 0;
    var phrases = [[], [], []];
    var words = obj.length;

    var countMora = function(o) {
      return o.pronunciation.replace(/(ァ|ィ|ゥ|ェ|ォ|ャ|ュ|ョ)/g, '').length;
    };

    for (; head < words; head++) {
      read = head;
      mora = 0;
      moraPointer = 0;
      phrases = [[], [], []];

      while (true) {
        if (!obj[read]) break; // wordがなくなった
        if (obj[read].word_type === 'UNKNOWN') break; // UNKNOWNな単語を含むならカウントやめる
        if (obj[read].surface_form.match(/(、|。)/)) break; // 句読点あったらカウントやめる
        mora += countMora(obj[read]);
        if (mora > moraSet[moraPointer]) break; // 音が飛び出た
        phrases[moraPointer].push(obj[read]);
        if (mora === moraSet[moraPointer]) {
          mora = 0;
          moraPointer++;
        }
        if (moraPointer > 2) {
          if (this.validPhrases(phrases)) {
            this.ikkuList.push(phrases.map(function(phrase) {
              return phrase.map(function(w) {
                return w.surface_form;
              }).join('');
            }).join(''));
          }
          break;
        }
        read++;
      }
    }
  },
  validPhrases: function(phrases) {
    // あとここだけ実装
    var valid = true;

    // 最初の単語ルールチェック
    [phrases[0][0], phrases[1][0], phrases[2][0]].forEach(function(obj) {
      if (["名詞", "動詞", "形容詞", "形容動詞", "副詞", "連体詞", "接続詞", "感動詞", "接頭詞", "フィラー"].indexOf(obj.pos) === -1)
        valid = false;
    });

    // 最後の単語ルールチェック
    //[phrases[0], phrases[1], phrases[2]].forEach(function(obj) {
    //  if (obj[obj.length-1] = "接頭詞")
    //    valid = false;
    //});

    // 下の句の最後の単語のルール
    //var lastWord = phrases[2][phrases[2].length-1];
    //if (lastWord.conjugated_form !== '*' && lastWord.conjugated_form !== '終止形')
    //  valid = false;

    return valid;
  }
};

module.exports = Ikku;
