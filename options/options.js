$(function() {
  var navItems = $('nav li');

  var checkBoxes = $(':checkbox');
  var reset = $('#reset');

  var hostList = $('#host-list');

  var OPTIONS;

  navItems.click(function(ev) {
    navItems.removeClass('active');
    $(ev.currentTarget).addClass('active');
  });

  chrome.storage.sync.get(DEFAULT_OPTIONS, function(loaded) {
    OPTIONS = loaded;

    updateCheckboxes();
    checkBoxes.change(saveCheckboxOption);
    reset.click(resetCheckboxDefaults);

    populateHosts();
  });

  function saveCheckboxOption(ev) {
    var checkBox = ev.target;
    OPTIONS[checkBox.id] = checkBox.checked;
    chrome.storage.sync.set(OPTIONS);
  }

  function resetCheckboxDefaults() {
    checkBoxes.each(function(i, e) {
      OPTIONS[e.id] = DEFAULT_OPTIONS[e.id];
    });
    chrome.storage.sync.set(OPTIONS, function() {
      updateCheckboxes();
    });
  }

  function updateCheckboxes() {
    checkBoxes.each(function(i, e) {
      e.checked = OPTIONS[e.id];
    });
  }

  function populateHosts() {
    $.each(OPTIONS.excludedHostnames, function(host) {
      var item = $('<li><span id="close">✖</span><span>' + host + '</span></li>');
      hostList.append(item);
    });
  }
});