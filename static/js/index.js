/**
 * Refreshs the overlay for the pad bookmark list and its content
 */
var refreshPadList = function() {
  var bookmarks = bookmarkStorage.getAllPadBookmarks();
  var padDiv;
  var padLinkTag;
  var commentTag;
  var commentEditTag;
  var editTag;
  var saveTag;
  var closeTag;
  
  $("#padBookmarkList").empty();
  if (bookmarks.length == 0) {
    $("#padBookmarkList").append("<div id='noPads'></div>").text(html10n.get("ep_bookmark.noPads"));
  } else {
    for (var i=0; i < bookmarks.length; i++) {
      padDiv = $("<div/>").attr('class', 'padBookmark').attr('id', bookmarks[i].padId);
      padLinkTag = $("<a class='bookmarkPadId' href='javascript:pad.switchToPad(\""+bookmarks[i].padId+"\")'>"+bookmarks[i].padId+"</a>").attr('title', html10n.get("ep_bookmark.lastVisit")+': '+new Date(bookmarks[i].timestamp).toLocaleString());
      commentTag = $("<span/>").attr('class', 'comment').text(bookmarks[i].description);
      commentEditTag = $("<input/>").attr('class', 'editComment');
      editTag = $("<a class='editIcon' href='#'>&#9997;</a>'").click(editCommentClick);
      saveTag = $("<a class='saveIcon' href='#'>&#10003;</a>'").click(saveCommentClick);
      closeTag = $("<a class='closeIcon' href='#'>&#10007;</a>'").click(closeCommentClick);
      deleteTag = $("<a class='deleteIcon' href='#'>&#10006;</a>").click(removePadClick);
        
      padDiv.append(padLinkTag).append(" ").append(commentTag).append(commentEditTag).append(" ").append(editTag).append(saveTag).append(closeTag).append(deleteTag);
      $("#padBookmarkList").append(padDiv);
    }
    $(".editIcon").attr('title', (html10n.get("ep_bookmark.editIcon.title")));
    $(".saveIcon").attr('title', (html10n.get("ep_bookmark.saveIcon.title")));
    $(".closeIcon").attr('title', (html10n.get("ep_bookmark.closeIcon.title")));
    $(".deleteIcon").attr('title', (html10n.get("ep_bookmark.deleteIcon.title")));
    
    $(".editComment").keyup(function(e){
      // ESC pressed
      if (e.keyCode == 27){
        abortCommentEditing($(e.currentTarget).parent());
        // Enter pressed
      } else if (e.keyCode == 13) {
        saveComment($(e.currentTarget).parent());
      }
    });
  }
}

/*********
* BookmarkStorage
* - supported():
*   returns if browser supports LocalStorage
*
* - getLocalStorageItem():
*   returns the LocalStorage JSON-object
*   Example: 
*   { "options": {}, "padList": []}
*
* - getAllPadBookmarks():
*   returns the padList object of the LocaleStorage in JSON sorted by timestamp
*
* - getPadBookmark(padId):
*   returns the bookmark for the padId
*
* - savePadBookmark(bookmark):
*   saves the pad bookmark in the LocalStorage
*
* - padBookmarksExists(padId):
*   returns true if the bookmark for the padId exists
*
* - saveLocalStorageItem(storageItem):
*   saves the array with all pad bookmarks in the LocalStorage
*
* - addPad(padId, desc):
*   checks if a pad exists if not it will add a new bookmark to the LocalStorage
*
* - removePad(padId):
*   remove bookmark for the padId
*
* - setOption(name, value):
*   set a value for the name in the LocalStorage options list
*
* - getOption(name):
*   returns the value for the name of the LocalStorage options list
*
*********/
var bookmarkStorage = {
  supported: function() {
    var mod = 'padBookmarksTest';
    try {
      localStorage.setItem(mod, mod);
      localStorage.removeItem(mod);
      return true;
    } catch(e) {
      return false;
    }
  },
  getLocalStorageItem: function() {
    var item = null;
    try {
      item = localStorage.getItem("padBookmarks");
    } catch (e) {
      
    }
    if (item == null) {
      item = {"options": {}, "padList": []};
    } else {
      item = JSON.parse(item);
    }
    return item;
  },
  getAllPadBookmarks: function() {
    var bookmarks = bookmarkStorage.getLocalStorageItem().padList;
    var sortedBookmarks = [];
    
    var bookmarkAdded = false;
    for (var i=0; i < bookmarks.length; i++) {
      bookmarkAdded = false;
      for (var k=0; k < sortedBookmarks.length; k++) {
        if (bookmarks[i].timestamp > sortedBookmarks[k].timestamp) {
          if (k == 0) {
            // Add bookmark on first position
            sortedBookmarks.unshift(bookmarks[i]);
          } else {
            // Remove 0 elements on position k and add the actual bookmark after the k element
            sortedBookmarks.slice(k-1, 0, bookmarks[i]);
          }
          bookmarkAdded = true;
        }
      }
      if (bookmarkAdded == false) {
        sortedBookmarks.push(bookmarks[i]);
      }
    }
    return sortedBookmarks;
  },
  getPadBookmark: function(padId) {
    var bookmarks = bookmarkStorage.getLocalStorageItem().padList;
    for (var i=0; i < bookmarks.length; i++) {
      if (bookmarks[i].padId == padId) {
        return bookmarks[i];
      }
    }
    return null;
  },
  savePadBookmark: function(bookmark) {
    var localStorageItem = bookmarkStorage.getLocalStorageItem();
    var bookmarks = localStorageItem.padList;
    for (var i=0; i < bookmarks.length; i++) {
      if (bookmarks[i].padId == bookmark.padId) {
        bookmarks[i] = bookmark;
      }
    }
    bookmarkStorage.saveLocalStorageItem(localStorageItem);
  },
  padBookmarkExists: function(padId) {
    return bookmarkStorage.getPadBookmark(padId) == null ? false : true;
  },
  saveLocalStorageItem: function(storageItem) {
    try {
      localStorage.setItem("padBookmarks", JSON.stringify(storageItem));
    } catch (e) {
    
    }
  },
  addPad: function(padId, desc) {
    if (!bookmarkStorage.padBookmarkExists(padId)) {
      var localStorageItem = bookmarkStorage.getLocalStorageItem();
      var bookmarks = localStorageItem.padList;
      bookmarks.push({padId: padId, description: (desc || ''), timestamp: new Date()});
      bookmarkStorage.saveLocalStorageItem(localStorageItem);
      refreshPadList();
    }
  },
  removePad: function(padId) {
    var localStorageItem = bookmarkStorage.getLocalStorageItem();
    var bookmarks = localStorageItem.padList;
    for (var i=0; i < bookmarks.length; i++) {
      if (bookmarks[i].padId == padId) {
        bookmarks.splice(i, 1);
        break;
      }
    }
    bookmarkStorage.saveLocalStorageItem(localStorageItem);
    refreshPadList();
  },
  setOption: function(name, value) {
    var localStorageItem = bookmarkStorage.getLocalStorageItem();
    var options = localStorageItem.options;
    options[name] = value;
    bookmarkStorage.saveLocalStorageItem(localStorageItem);
  },
  getOption: function(name) {
    var localStorageItem = bookmarkStorage.getLocalStorageItem();
    var options = localStorageItem.options;
    if (options && name in options) {
      return options[name];
    } else {
      return null;
    }
  }
}

/**
 * update the timestamp of the pad bookmark with the actual time
 */
var updateLastVisitTime = function() {
  var bookmark = bookmarkStorage.getPadBookmark(pad.getPadId());
  if (bookmark) {
    bookmark.timestamp = new Date();
    bookmarkStorage.savePadBookmark(bookmark);
  }
}

/**
 * Checks if pad bookmarks should automatically be added to the list. If it's true the bookmark will be added
 */
var autoAddBookmark = function() {
  if (bookmarkStorage.getOption("addBookmarksAutomatically")) {
    bookmarkStorage.addPad(pad.getPadId(), html10n.get("ep_bookmark.autoAdded"));
  }
}

/**
 * Clicked to edit bookmark comment
 */
var editCommentClick = function() {
  var $parentNode = $(this).parent();
  var $spanComment = $parentNode.children("span.comment");
  var $editComment = $parentNode.children("input.editComment");
  var $editButton = $parentNode.children("a.editIcon");
  var $saveButton = $parentNode.children("a.saveIcon");
  var $closeButton = $parentNode.children("a.closeIcon");
  var $deleteButton = $parentNode.children("a.deleteIcon");
  
  $editComment.val($spanComment.text());
  $spanComment.css('display', 'none');
  $editComment.css('display', 'inline');
  $editButton.css('display', 'none');
  $saveButton.css('display', 'inline');
  $closeButton.css('display', 'inline');
  $deleteButton.css('display', 'none');
  
  $editComment.focus();
}

/**
 * Close the text field for the bookmark comment and change the visibility of the buttons
 * @param {Object} padBookmarkElem DOM-Object of the surrounding bookmark element
 * @param {Object} save boolean if the note should be saved
 */
var closeEditing = function(padBookmarkElem, save) {
  var $parentNode = $(padBookmarkElem);
  var $spanComment = $parentNode.children("span.comment");
  var $editComment = $parentNode.children("input.editComment");
  var $editButton = $parentNode.children("a.editIcon");
  var $saveButton = $parentNode.children("a.saveIcon");
  var $closeButton = $parentNode.children("a.closeIcon");
  var $deleteButton = $parentNode.children("a.deleteIcon");
  
  if (save) {
    var bookmark = bookmarkStorage.getPadBookmark($parentNode.attr('id'));
    if (bookmark) {
      bookmark.description = $editComment.val();
      bookmarkStorage.savePadBookmark(bookmark);
    }
    
    $spanComment.text($editComment.val());
  }
  
  $spanComment.css('display', '');
  $editComment.css('display', 'none');
  $editButton.css('display', '');
  $saveButton.css('display', 'none');
  $closeButton.css('display', 'none');
  $deleteButton.css('display', '');
}

/**
 * aborts editing of the comment (called by key-press)
 * @param {Object} padBookmarkElem
 */
var abortCommentEditing = function(padBookmarkElem) {
  closeEditing(padBookmarkElem, false);
}

/**
 * aborts editing of the comment (called by button click)
 */
var closeCommentClick = function() {
  closeEditing($(this).parent(), false);
}

/**
 * ends editing of the comment and saves it (called by key-press)
 * @param {Object} padBookmarkElem
 */
var saveComment = function(padBookmarkElem) {
  closeEditing(padBookmarkElem, true);
}

/**
 * ends editing of the comment and saves it (called by button click)
 */  
var saveCommentClick = function() {
  closeEditing($(this).parent(), true);
}

/**
 * deletes the pad bookmark (called by button click)
 */
var removePadClick = function() {
  bookmarkStorage.removePad(this.parentNode.id);
}

var documentReady = function (hook, context) {
  $("#managePadBookmarks a").click(function () {
    var module = $("#padBookmarkManager");

    if (module.css('display') == "none") {
      $("#addPadBookmark").val(html10n.get("ep_bookmark.addPadToBookmarks"));
      $("#infoText").attr("title", html10n.get("ep_bookmark.info.title"));
      $("#addBookmarksAutomatically").attr('title', html10n.get("ep_bookmark.addBookmarksAutomatically.title"));
      $("#managePadBookmarks").attr('title', html10n.get("ep_bookmark.bookmarkTitle"));
      
      if (bookmarkStorage.supported()) {
        $("#padBookmarkMain").show();
        $("#padBookmarkError").hide();
        $("#autoAddBookmarkCheckbox").attr('checked', bookmarkStorage.getOption("addBookmarksAutomatically"));
        $("#addPadBookmark").attr('disabled', $("#autoAddBookmarkCheckbox").attr('checked'));
        refreshPadList();
      } else {
        $("#padBookmarkMain").hide();
        $("#padBookmarkError").show();
      }
    }
  });

  $("#addPadBookmark").click(function() {
    bookmarkStorage.addPad(pad.getPadId());
  });
  
  $("#autoAddBookmarkCheckbox").change(function() {
    bookmarkStorage.setOption("addBookmarksAutomatically", $(this).is(":checked"));
    $("#addPadBookmark").attr('disabled', $(this).is(":checked"));
  });
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
