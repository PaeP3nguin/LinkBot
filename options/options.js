var form = $('#form');
var linkOnLoad = $('#link_on_load');
var linkOnChange = $('#link_on_change');
var statusText = $('#status');
var reset = $('#reset');

function saveOptions() {
  statusText.hide();
  statusText.text('Options saved!');
  chrome.storage.sync.set({
    linkOnLoad: linkOnLoad.prop('checked'),
    linkOnChange: linkOnChange.prop('checked')
  }, function() {
    statusText.fadeIn();
  });
}

function getOptions() {
  chrome.storage.sync.get({
    linkOnLoad: true,
    linkOnChange: true
  }, function(items) {
    linkOnLoad.prop('checked', items.linkOnLoad);
    linkOnChange.prop('checked', items.linkOnChange);
  });
}

function resetDefaults() {
  statusText.hide();
  statusText.text('Options reset');
  chrome.storage.sync.set({
    linkOnLoad: true,
    linkOnChange: true
  }, function() {
    linkOnLoad.prop('checked', true);
    linkOnChange.prop('checked', true);
    statusText.fadeIn();
  });
}

getOptions();

$(':input').change(saveOptions);
reset.click(resetDefaults);