// bootstrap

var $ = require('jquery');
require('kuromoji');

var HatenaIkku = require('./hatena-ikku.js');
$(function() { new HatenaIkku(); });
