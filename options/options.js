$(function() {
  var form = $('#form');

  var linkOnLoad = $('#link_on_load');
  var linkOnChange = $('#link_on_change');
  var linkEmails = $('#link_emails');

  var statusText = $('#status');
  var reset = $('#reset');

  getOptions();

  $(':input').change(saveOptions);
  reset.click(resetDefaults);

  function saveOptions() {
    statusText.hide();
    statusText.text('Options saved!');
    chrome.storage.sync.set({
      linkOnLoad: linkOnLoad.prop('checked'),
      linkOnChange: linkOnChange.prop('checked'),
      linkEmails: linkEmails.prop('checked')
    }, function() {
      statusText.fadeIn();
    });
  }

  function getOptions() {
    chrome.storage.sync.get(DEFAULT_OPTIONS, function(options) {
      linkOnLoad.prop('checked', options.linkOnLoad);
      linkOnChange.prop('checked', options.linkOnChange);
      linkEmails.prop('checked', options.linkEmails);
    });
  }

  function resetDefaults() {
    statusText.hide();
    statusText.text('Options reset');
    chrome.storage.sync.set(DEFAULT_OPTIONS, function() {
      linkOnLoad.prop('checked', true);
      linkOnChange.prop('checked', true);
      linkEmails.prop('checked', true);
      statusText.fadeIn();
    });
  }
});