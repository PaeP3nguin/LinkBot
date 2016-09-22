$(function() {
  var navItems = $('nav li');

  var checkBoxes = $(':checkbox');
  var resetButton = $('#reset');

  var hostList = $('#host-list');
  var restoreHostsButton = $('#restore-hosts');

  var OPTIONS;

  navItems.click(function(ev) {
    navItems.removeClass('active');
    $(ev.currentTarget).addClass('active');
  });

  chrome.storage.sync.get(DEFAULT_OPTIONS, function(loaded) {
    OPTIONS = loaded;

    if (Object.keys(OPTIONS.excludedHostnames).length === 0) {
      OPTIONS.excludedHostnames = DEFAULT_EXCLUDED_HOSTNAMES;
    }

    updateCheckboxes();
    checkBoxes.change(saveCheckboxOption);
    resetButton.click(resetCheckboxDefaults);

    populateHosts();
    restoreHostsButton.click(restoreDefaultHosts);
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

  function restoreDefaultHosts() {
    $.extend(OPTIONS.excludedHostnames, DEFAULT_EXCLUDED_HOSTNAMES);
    populateHosts();
  }

  function populateHosts() {
    hostList.empty();
    $.each(OPTIONS.excludedHostnames, function(host) {
      var item = $('<li><span id="close">✖</span><span>' + host + '</span></li>');
      item.data('host', host);
      item.click(function(ev) {
        var item = $(this);
        delete OPTIONS.excludedHostnames[item.data('host')];
        item.remove();
        chrome.storage.sync.set(OPTIONS);
      });
      hostList.append(item);
    });
  }
});