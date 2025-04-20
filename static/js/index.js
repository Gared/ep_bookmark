var documentReady = function (hook, context) {

  $("#managePadBookmarks a").click(function () {
    $("#addPadBookmark").val(html10n.get("ep_bookmark.addPadToBookmarks"));
    $("#infoText").attr("title", html10n.get("ep_bookmark.info.title"));
    $("#addBookmarksAutomatically").attr('title', html10n.get("ep_bookmark.addBookmarksAutomatically.title"));
    $("#managePadBookmarks").attr('title', html10n.get("ep_bookmark.bookmarkTitle"));

    if (bookmarkStorage.supported()) {
      $("#padBookmarkMain").show();
      $("#padBookmarkError").hide();
      $("#autoAddBookmarkCheckbox").attr('checked', bookmarkStorage.getOption("addBookmarksAutomatically"));
      $("#addPadBookmark").attr('disabled', $("#autoAddBookmarkCheckbox").attr('checked'));
      refreshPadList(bookmarkStorage.getAllPadBookmarks());
    } else {
      $("#padBookmarkMain").hide();
      $("#padBookmarkError").show();
    }
  });

  $("#addPadBookmark").click(function() {
    bookmarkStorage.addPad(pad.getPadId());
  });

  $("#autoAddBookmarkCheckbox").change(function() {
    bookmarkStorage.setOption("addBookmarksAutomatically", $(this).is(":checked"));
    $("#addPadBookmark").attr('disabled', $(this).is(":checked"));
    autoAddBookmark();
  });

  registerSearchInputHandler();
}

var postAceInit = function(hook, context) {
  updateLastVisitTime();
  autoAddBookmark();
}

var postToolbarInit = function(hook, context) {
  context.toolbar.registerDropdownCommand("padBookmarkManager");
}

// Export hook functions
exports.documentReady = documentReady;
exports.postAceInit = postAceInit;
exports.postToolbarInit = postToolbarInit;
