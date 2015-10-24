var highlightIkku = function(text) {
  if (!text || text === 'undefined') return false;
  var highlight = new Hatena.Star.Highlight(text);
  highlight.show();

  var highlightNode = document.querySelector('.hatena-star-highlight');
  var startNode = highlightNode.firstChild;
  var endNode = highlightNode.lastChild;

  var range = document.createRange();
  range.setStart(startNode, 0);
  range.setEnd(endNode, endNode.length);

  var selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  var target = $('.hatena-star-highlight').closest('p');
  var offset = target.offset();
  var event = jQuery.Event('mouseup');
  event.target = target[0];
  event.pageX = offset.left;
  event.pageY = offset.top;

  $(document).trigger(event);

  scrollTo(0, offset.top - 50);
};
