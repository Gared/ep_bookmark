var eejs = require("ep_etherpad-lite/node/eejs");

exports.eejsBlock_editbarMenuRight = function (hook_name, args, cb) {
  args.content = eejs.require("ep_bookmark/templates/editbarButtons.ejs", {}, module) + args.content;
  return cb();
}

exports.eejsBlock_editorContainerBox = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_bookmark/templates/modals.ejs", {}, module);
  return cb();
}

exports.eejsBlock_body = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_bookmark/templates/modals.old.ejs", {}, module);
  return cb();
}

exports.eejsBlock_styles = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_bookmark/templates/styles.ejs", {}, module);
  return cb();
}

exports.eejsBlock_scripts = function (hook_name, args, cb) {
  args.content = args.content + '<script src="/static/plugins/ep_bookmark/static/js/bookmarkManager.js"></script>';
  return cb();
}

exports.eejsBlock_indexWrapper = function (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_bookmark/templates/index.ejs", {});
  return cb();
}
