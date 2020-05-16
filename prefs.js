/*
  This file is part of the collapsed-icon-menu@cs.tinyiu.com.

  Copyright (c) 2020 Tin Yiu Lai @soraxas

  This extension is free software; you can redistribute it and/or
  modify it under the terms of the GNU General Public License
  as published by the Free Software Foundation; either version 2
  of the License, or (at your option) any later version.

  This extension is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program. If not, see
  < https://www.gnu.org/licenses/old-licenses/gpl-2.0.html >.

  This extension is a derived work of the Gnome Shell.
*/

const GObject = imports.gi.GObject;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Config = imports.misc.config;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const DOMAIN = Me.metadata["gettext-domain"];
const Gettext = imports.gettext.domain(DOMAIN);
const _ = Gettext.gettext;
const COMMIT = "Commit: a16a7eda 2020-03-27 07:55 master";
const SHORTCUT = "shortcut";
const LEFT = "panel-icon-left";
const CENTER = "panel-icon-center";
const EPVERSION = "version";
const GSPVERSION = "shell-version";
const ExtensionUtils = imports.misc.extensionUtils;

const KEY_ICONS_TO_HIDE = "status-icons-name-to-hide";
const KEY_BLACKLISTED_ICONS = "blacklist-of-nonhidden-icons";
const KEY_DISPLAY_RAW_OBJECT_STR = "display-raw-icon-obj-name";
const KEY_DEEP_SEARCH = "deep-search-status-icons";
const KEY_IGNORE_INVISIBLE_ICON = "ignore-invisible-icons";

function init() {
  imports.gettext.bindtextdomain("nls1729-extensions", Me.path + "/locale");
  // imports.gettext.bindtextdomain("en", Me.path + "/locale");
}

const Columns = {
  APPINFO: 0,
  DISPLAY_NAME: 1,
  ICON: 2,
};

const CollapsedIconMenuPrefsWidget = new GObject.registerClass(
  class CollapsedIconMenuPrefsWidget extends Gtk.Box {
    _init(params) {
      super._init(params);
      // If `settings-schema` is defined in `metadata.json` you can simply call this
      // this function without an argument.
      // let GioSSS = Gio.SettingsSchemaSource;
      // let schema = Me.metadata['settings-schema'];
      // let schemaDir = Me.dir.get_child('schemas').get_path();
      // let schemaSrc = GioSSS.new_from_directory(schemaDir, GioSSS.get_default(), false);
      // let schemaObj = schemaSrc.lookup(schema, true);
      // this._settings = new Gio.Settings({settings_schema: schemaObj});
      this._settings = ExtensionUtils.getSettings();
      // this._grid = new Gtk.Grid(params);
      this._grid = new Gtk.Grid();
      this._grid.set_orientation(Gtk.Orientation.VERTICAL);
      // this._grid.margin = 5;
      // this._grid.row_spacing = 5;
      // this._grid.column_spacing = 5;
      // this._grid.set_column_homogeneous(true);

      // return;

      let btnPosition = "Button Location";
      this._centerCb = new Gtk.CheckButton({ label: "Center" });
      this._leftRb = new Gtk.RadioButton({ label: "Left" });
      this._rightRb = new Gtk.RadioButton({
        group: this._leftRb,
        label: "Right",
      });
      let rbGroup = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        homogeneous: false,
        margin_left: 4,
        margin_top: 2,
        margin_bottom: 2,
        margin_right: 4,
      });
      rbGroup.add(this._centerCb);
      rbGroup.add(this._leftRb);
      rbGroup.add(this._rightRb);

      let icons_to_hide = this._settings
        .get_value(KEY_ICONS_TO_HIDE)
        .deep_unpack();
      if (!icons_to_hide) {
        icons_to_hide = [""];
      }

      let blacklistedIcons = this._settings
        .get_value(KEY_BLACKLISTED_ICONS)
        .deep_unpack();
      if (!blacklistedIcons) {
        blacklistedIcons = [""];
      }

      let blacklistBox = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        margin: 7,
      });
      this._grid.add(
        new Gtk.Label({
          label: "Blacklisted icons",
          xalign: 0,
        })
      );
      let blacklistEntry = new Gtk.Entry();
      blacklistEntry.set_text(String(blacklistedIcons));
      blacklistEntry.connect("notify::text", () => this.errorLabel.set_text(""));
      this._grid.add(blacklistEntry);

      this.errorLabel = new Gtk.Label({
        label: "",
        xalign: 0,
      });

      let saveButton = new Gtk.ToolButton({
        stock_id: Gtk.STOCK_NEW,
      });
      saveButton.connect("clicked", () => {
        let _blText = blacklistEntry.get_text();
        // if (!_blText) return;
        try {
          let newBlacklistedIcons = new Set();
          for (let _bl of _blText.split(",")) {
            newBlacklistedIcons.add(_bl);
          }
          let tmpVairant = new GLib.Variant(
            "as",
            Array.from(newBlacklistedIcons)
          );
          this._settings.set_value(KEY_BLACKLISTED_ICONS, tmpVairant);
          this.errorLabel.set_text("Saved!");
        } catch (ex) {
          this.errorLabel.set_text(String(ex));
        }
        
      });
      this._grid.add(this.errorLabel);
      this._grid.add(saveButton);

      // for (let name of blacklistedIcons) {
      //   let entry = new Gtk.Entry();
      //   entry.set_text(name);
      //   this._grid.add(entry);
      // }

      const add_button = (key, label) => {
        let _Box = new Gtk.Box({
          orientation: Gtk.Orientation.HORIZONTAL,
          margin: 7,
        });

        let _Label = new Gtk.Label({
          label: label,
          xalign: 0,
        });

        let _Switch = new Gtk.Switch({
          active: this._settings.get_boolean(key),
        });
        _Switch.connect("notify::active", (button) => {
          this._settings.set_boolean(key, button.active);
        });

        _Box.pack_start(_Label, true, true, 0);
        _Box.add(_Switch);
        this._grid.add(_Box);
      };

      add_button(
        KEY_DISPLAY_RAW_OBJECT_STR,
        "Show Raw Object String in potential icon list"
      );
      add_button(
        KEY_DEEP_SEARCH,
        "Use a more hacky way to deep search for icons (Use at your own risk)."
      );
      add_button(KEY_IGNORE_INVISIBLE_ICON, "Ignore invisible icons");

      // let showRawSwitch = new Gtk.Switch({ active: this._settings.get_boolean(KEY_DISPLAY_RAW_OBJECT_STR) });
      // showRawSwitch.connect('notify::active', button => {
      //     this._settings.set_boolean(KEY_DISPLAY_RAW_OBJECT_STR, button.active);
      // });

      this._store = new Gtk.ListStore();
      this._store.set_column_types([
        Gio.AppInfo,
        GObject.TYPE_STRING,
        Gio.Icon,
      ]);

      this._treeView = new Gtk.TreeView({
        model: this._store,
        hexpand: true,
        vexpand: true,
      });
      this._treeView.get_selection().set_mode(Gtk.SelectionMode.SINGLE);

      const appColumn = new Gtk.TreeViewColumn({
        expand: true,
        sort_column_id: Columns.DISPLAY_NAME,
        title: "Applications which enable Caffeine automatically",
      });
      const iconRenderer = new Gtk.CellRendererPixbuf();
      appColumn.pack_start(iconRenderer, false);
      appColumn.add_attribute(iconRenderer, "gicon", Columns.ICON);
      const nameRenderer = new Gtk.CellRendererText();
      appColumn.pack_start(nameRenderer, true);
      appColumn.add_attribute(nameRenderer, "text", Columns.DISPLAY_NAME);
      this._treeView.append_column(appColumn);

      this._grid.add(this._treeView);

      const toolbar = new Gtk.Toolbar();
      toolbar.get_style_context().add_class(Gtk.STYLE_CLASS_INLINE_TOOLBAR);
      this._grid.add(toolbar);

      const newButton = new Gtk.ToolButton({
        stock_id: Gtk.STOCK_NEW,
        label: "Add blacklisted name",
        is_important: true,
      });
      newButton.connect("clicked", this._createNew.bind(this));
      toolbar.add(newButton);

      const delButton = new Gtk.ToolButton({
        stock_id: Gtk.STOCK_DELETE,
      });
      delButton.connect("clicked", this._deleteSelected.bind(this));
      toolbar.add(delButton);

      // // let version = '[ v' + Me.metadata[EPVERSION] +
      // ' GS ' + this._settings.get_string(GSPVERSION) + ' ]';
      this._linkBtn = new Gtk.LinkButton({
        uri: Me.metadata["url"],
        label: "Website",
      });
      // let left = this._settings.get_boolean(LEFT);
      // let center = this._settings.get_boolean(CENTER);
      // this._leftRb.connect('toggled', (b) => {
      //     if(b.get_active())
      //         this._settings.set_boolean(LEFT, true);
      //     else
      //         this._settings.set_boolean(LEFT, false);
      // });
      // this._rightRb.connect('toggled', (b) => {
      //     if(b.get_active())
      //         this._settings.set_boolean(LEFT, false);
      //     else
      //         this._settings.set_boolean(LEFT, true);
      // });
      // this._centerCb.connect('toggled', (b) => {
      //     if(b.get_active()) {
      //         this._settings.set_boolean(CENTER, true);
      //     } else {
      //         this._settings.set_boolean(CENTER, false);
      //     }
      // });
      let left = true;
      let center = true;
      this._leftRb.set_active(left);
      this._rightRb.set_active(!left);
      this._centerCb.set_active(center);
      this._grid.attach(
        new Gtk.Label({
          label: btnPosition,
          wrap: true,
          xalign: 0.5,
        }),
        0,
        8,
        7,
        1
      );
      this._grid.attach(rbGroup, 3, 10, 1, 3);
      // this._grid.attach(new Gtk.Label({ label: version, wrap: true, xalign: 0.5 }), 0, 18, 7, 1);
      this._grid.attach(
        new Gtk.Label({ label: COMMIT, wrap: true, xalign: 0.5 }),
        0,
        20,
        7,
        1
      );
      this._grid.attach(this._linkBtn, 3, 22, 1, 1);
      this.add(this._grid);
    }

    _deleteSelected() {}
    _createNew() {
      const dialog = new Gtk.Dialog({
        title: "Create new matching rule",
        transient_for: this._grid.get_toplevel(),
        modal: true,
      });
      dialog.add_button(Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL);
      dialog.add_button("Add", Gtk.ResponseType.OK);
      dialog.set_default_response(Gtk.ResponseType.OK);

      const grid = new Gtk.Grid({
        column_spacing: 10,
        row_spacing: 15,
        margin: 10,
      });
      // dialog._appChooser = new Gtk.GtkListBox();
      // grid.attach(dialog._appChooser, 0, 0, 2, 1);
      dialog.get_content_area().add(grid);

      dialog.connect("response", (dialog, id) => {
        if (id != Gtk.ResponseType.OK) {
          dialog.destroy();
          return;
        }

        // const appInfo = dialog._appChooser.get_app_info();
        // if (!appInfo)
        //     return;

        // this._changedPermitted = false;
        // if (!this._appendItem(appInfo.get_id())) {
        //     this._changedPermitted = true;
        //     return;
        // }
        // let iter = this._store.append();

        // this._store.set(iter,
        //     [Columns.APPINFO, Columns.ICON, Columns.DISPLAY_NAME],
        //     [appInfo, appInfo.get_icon(), appInfo.get_display_name()]);
        // this._changedPermitted = true;

        dialog.destroy();
      });
      dialog.show_all();
    }
  }
);

function buildPrefsWidget() {
  let widget = new CollapsedIconMenuPrefsWidget();
  widget.show_all();
  return widget;
}
