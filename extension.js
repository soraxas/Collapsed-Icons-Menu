/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */
// const Gio = imports.gi.Gio;
// const Main = imports.ui.main;
// const Lang = imports.lang;



// const Lang = imports.lang;
// const GLib = imports.gi.GLib;
// const Gio = imports.gi.Gio;
const { GObject, Gio, Gtk, GLib, St, Clutter } = imports.gi;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Mainloop = imports.mainloop;
const Me = imports.misc.extensionUtils.getCurrentExtension();

// const Extension = imports.misc.extensionUtils.getCurrentExtension();
// const ArgosLineView = Extension.imports.lineview.ArgosLineView;
// const ArgosMenuItem = Extension.imports.menuitem.ArgosMenuItem;
// const Utilities = Extension.imports.utilities;

const Main = imports.ui.main;


var NoEventButton = GObject.registerClass(
    class NoEventButton extends St.Button {
        /* This class is to stop contained items being reactive to hover action.
        The issue being: 
            (1) when a menu is opened, moving mouse to another panel button will
                automatically open the new hovering icon's menu, and
            (2) when 1 occurs in a nested menu scenario (i.e. a trying to open a
                new popup menu as a menu item in another already opened popup menu)
                the new one will tries to opens, then the old one will closes, and
            (3) because the new popupmenu's actor is the old's popup menu, the new
                popup menu will closes as well (because its parent is closing).
            ALL IN ALL, this eventButton stops event passing onto contained
            icons by setting XXX.reactive = false, and manually passing button-press
            event to its contained item (this is to try and block Clutter.EventType.ENTER
                and Clutter.EventType.MOVE) from the contained item. */

        _init(indicator, statusIconName, params){
            this.indicator = indicator;
            this.statusIconName = statusIconName;
            this.indicator.reactive = false;
            super._init(params);
        }

        vfunc_event(event) {
            if (event.type() == Clutter.EventType.BUTTON_PRESS) {
                // emit it back into the container's child
                this.indicator.emit("button-press-event", event)
            }
            return Clutter.EVENT_PROPAGATE;
        }
});

var HiddenStatusIcon = GObject.registerClass(
class HiddenStatusIcon extends PopupMenu.PopupBaseMenuItem {
    _init(container_name, indicator, mainMenu) {
        this.name = container_name
        this.indicator = indicator;
        this.original_parent = indicator.container.get_parent();
        this.isDestroyed = false;
        this.original_reactive = indicator.reactive;
        // this keep track of the icon's original index
        let _panel_icon = indicator.get_parent();
        this.original_index = _panel_icon.get_parent().get_children().indexOf(_panel_icon);

        const STYLE1 = 'width: 120px;';
        const STYLE2 = 'font-weight: bold;';


        let container = this.indicator.container;
        // var ExtensionStates =
        //     [_("Unknown"),
        //     _("Enabled"),
        //     _("Disabled"),
        //     _("Error"),
        super._init({ reactive: false, can_focus: false });
        //     _("Out of Date"),
        //     _("Downloading"),
        //     _("Initialized")];

        // if (extension.state != ExtensionSystem.ExtensionState.ERROR) {
        // } else {
        //     super._init(params);
        // }
        // this._extension = extension;
        // this._state = extension.state;
        // this._uuid = extension.uuid;
        // this._name = name;
        // if (this._state > 6)
        //     this._state = 0;
        // let box = new St.BoxLayout();
        // let label1 = new St.Label({ text: "errorrrrrrrrrrrrr" });
        // label1.set_style(STYLE1);
        // box.add_actor(label1);
        // let label2 = new St.Label({ text: "extension name" });
        // // if (this._state == ExtensionSystem.ExtensionState.ERROR)
        // label2.set_style(STYLE2);
        // box.add_actor(label2);
        
        // this.add_child(box);
        const STYLE = 'width: 120px; font-weight: bold;';
        



        ////////////////////////////
        //// REMOVE ORIGINAL PARENT
        indicator.reactive = false;
        let parent = container.get_parent();
        if (parent)
            parent.remove_actor(container);
        ////////////////////////////









        let itembox = new St.BoxLayout({
            // style_class: this.menu._use_alternative_theme ? "headerBar dark" : "headerBar",
            vertical: false,
            reactive: false
        });



        let icon_name = new St.Label({ 
            text: container_name
        });
        icon_name.set_style(STYLE);

        this.icon_name_button = new St.Button({ child: icon_name });
        // this.container_button = new St.Button({ child: container });
        this.container_button = new NoEventButton(indicator, container_name, { child: container });
    
        
        
        itembox.add_child(this.icon_name_button);
        itembox.add_child(this.container_button);
        // itembox.insert_child_at_index(container, 1);
        // container.actor
        this.add_child(itembox);

        this.new_parent = this.indicator.container.get_parent();

// .actor.connect('button-press-event', button => {
            //     let _indicator = Main.panel.statusArea[button.statusButtonName];
            //     // Main.notify('Example Notification', "2" + Main.panel.statusArea[button.statusButtonName]);
    }

    restoreIcon() { this.destroy(); }

    destroy(by_external=false) {
        // if it is destroyed by external, we can no longer access indicator, as it's freed by C backend.
        if (!by_external) {
            let indicator = this.indicator;
            let container = indicator.container;
            // remove myself
            let parent = container.get_parent();
            if (parent) {
                parent.remove_actor(container);
            }
            // reset back to it's parent actor
            if (this.original_parent) {
                // try to restore to it's original index if it is a valid index
                let restore_index = 0;
                if (this.original_index >= 0) {
                    restore_index = this.original_index;
                }
                this.original_parent.insert_child_at_index(container, restore_index)
            }
            // reset reactive
            container.show();
            this.indicator.reactive = this.original_reactive

        }
        super.destroy();
    }

    // hideIcon() {
    //     let indicator = this.indicator;
    //     let container = this.indicator.container;
    //     indicator.reactive = false;
    //     let parent = container.get_parent();
    //     if (parent)
    //         parent.remove_actor(container);

    // }


});

const CollapsedIconsMenu = GObject.registerClass(class CollapsedIconsMenu extends PanelMenu.Button {

    _init(gsettings, keep_at_leftmost=true) {
        super._init(0.5, 'collapsed-icons-menu', false);

        this._settings = gsettings;
        
        // if set to true, this extensino will always to keep itself to be the left most icon
        this.keep_at_leftmost = keep_at_leftmost;

        this._icon = new St.Icon({
            style_class: 'popup-menu-icon'
            // style_class: 'system-status-icon'
        });
        // this._icon.gicon = Gio.icon_new_for_string(`${Me.path}/icons/menu-down-outline.svg`);
        this._icon.gicon = Gio.icon_new_for_string(`${Me.path}/icons/collapsed-icon.svg`);

        this.actor.add_actor(this._icon);
        this._hidden_icon_menuitem = {};
        
        // this._status_icon_to_hide = ["Caffeine"];
        // load from gsettings
        let icons_to_hide = this._settings.get_value("status-icons-name-to-hide").deep_unpack();
        if (!icons_to_hide) {
            icons_to_hide = []
        }
        this._status_icon_to_hide = new Set(icons_to_hide);
        // this._status_icon_to_hide.add("Caffeine");
        
        // this set is to keep track of all hidden icon's parent under our control,
        // so that we can check if the hidden status is indeed active
        this._hidden_icon_parents = new Set();

        // super._init()
        // Main.notify('Example Notification', this.menu + "1");
        
        // this.parent(0.0);
        // let topBox = new St.BoxLayout();
        // topBox.add_actor(this._icon);
        // topBox.add_actor(this._panelButtonLabel);
        // this.actor.add_actor(topBox);
        //        this.menu = this;
        
        this._hidden_status_icons = {};
        // return;
        // let label = new St.Label({ text: 'HEYO Button' });
        let label = new St.Label({
            y_align: Clutter.ActorAlign.CENTER,
            text: _('…')
        });
        // this.actor.add_child(label);
        


        // let menuItem = new PopupMenu.PopupMenuItem('Menu Item');
        // menuItem.actor.connect('button-press-event', (a, b, c) => { 
        //     Main.notify('Example Notification', 'Hello World !' + this) ; 
        //     this.asf = [a, b, c];
        //     Main.notify('Example Notification', 'Hello World !2222222222222') ; 
        // });
        // this.menu.addMenuItem(menuItem);
        // // let section = new PopupMenu.PopupMenuSection();

        // // this._item = new PopupMenu.PopupBaseMenuItem({ activate: false })
        // // this.menu.addMenuItem(this._item)


        
        
        // let box = new St.BoxLayout({ name: 'containerbox' });
        // menuItem.add_child(box);
        
        // let container = Main.panel.statusArea["Caffeine"].container;
        // // menuItem.add_child(container);
        // menuItem.add_actor(container);
        
        // let parent = container.get_parent();
        // if (parent)
        //     parent.remove_actor(container);
        
        
            // box.insert_child_at_index(container, 0);
            // Main.panel.statusArea[statusButtonName]
            
        // menuItem.box = box;
        
        this.submenu_nonhidden_icons = new PopupMenu.PopupSubMenuMenuItem("Icons to hide (click to hide)", false);
        this.menu.addMenuItem(this.submenu_nonhidden_icons);


        this.submenu_hidden_icons = new PopupMenu.PopupSubMenuMenuItem("Hidden Icons", false);
        this.menu.addMenuItem(this.submenu_hidden_icons);
        
        // this.aaa = box;
        
        // return;

        this.update();




        this.menu.connect("open-state-changed", (menu, open) => {
            // Main.notify('Example Notification', "hi " + open);
            // Main.notify('Example Notification', "hi " + this);
            if (open) {
                this.submenu_hidden_icons.menu.open();
                this.update();
                // default open the hidden icon menu
                this.submenu_hidden_icons.menu.open();
            }
        });

        this.actor.connect('destroy', this._onDestroy.bind(this));
        
    }

    notify(msg) {
        Main.notify("Collapsed-icons-menu", ""+msg)
    }

    update() {
        let sortedName = [];
        for (let k in Main.panel.statusArea)
            sortedName[sortedName.length] = k;
        // sort case insensitive
        sortedName.sort((a, b) => {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        
        this.submenu_nonhidden_icons.menu.removeAll();
        // menu for showing what icons are available to hide
        try {
            for (let statusButtonName of sortedName) {
    
                let _indicator = Main.panel.statusArea[statusButtonName];
                
                // display available icon to be hidden
                if (
                    // statusButtonName in this._hidden_status_icons || 
                    _indicator.is_visible() && 
                    _indicator != this) {
                        // create switches
                        let menuItem = this._createSwitchMenu(statusButtonName)
                        this.submenu_nonhidden_icons.menu.addMenuItem(menuItem);
                        if (this._status_icon_to_hide.has(statusButtonName)) {
                            menuItem.setToggleState(true);
                        }
                }
                ////////////////////////////////////////////////////////////
                ////////////////////////////////////////////////////////////
                // restore any icons that should be restored
                if (statusButtonName in this._hidden_icon_menuitem && !this._status_icon_to_hide.has(statusButtonName)){
                    this.restoreIcon(statusButtonName);
                }
            }
        } catch (ex) {
            this.notify("Error occurs when populating icon list: " + e)
        }

        // hide icons
        for (let statusButtonName of sortedName) {

            if (statusButtonName in this._hidden_icon_menuitem) {
                // this icon should have been hidden. Ensure it.
                try {
                    // ensure it's always in-reactive
                    this._hidden_icon_menuitem[statusButtonName].indicator.reactive = false;
    
                    let parentsDiffer = false;
    
                    if (Main.panel.statusArea[statusButtonName].container.get_parent() != this._hidden_icon_menuitem[statusButtonName].new_parent) {
                        // parents differ!
                        parentsDiffer = true;
                    }
    
                    if (parentsDiffer) {
                        // return;
                        // something went wrong, this icon is NO LONGER UNDER OUR CONTROL!!!
                        // probably gnome-shell reset the icon's actor to topbar. Redo the hiding procedure.
                        this.onDestroyedExternally(statusButtonName)
                    }
                } catch (ex) {
                    this.notify("Error occurs when re-hiding: " + statusButtonName + " - " + e)
                }
                // already hidden
                continue;
            }

            if (this._status_icon_to_hide.has(statusButtonName) && !(statusButtonName in this._hidden_icon_menuitem)) {
                try {
                    this.hideIcon(statusButtonName);
                }catch (ex) {
                    this.notify("Error occurs when hiding: " + statusButtonName + " - " + e)
                }
            }
        }

        // update hidden icon menu
        // let _children = this.submenu_hidden_icons.menu._getMenuItems();
        // for (let i = 0; i < _children.length; i++){
        //     _children[i].get_parent().remove_child(_children[i]);
        // }
        
        // DETACH OLD submenu items
        //     let _container = this._hidden_status_icons[name].indicator.container;
        //     let parent = _container.get_parent();
        //     if (parent)
        //         parent.remove_actor(_container);
        // }
        
        // REMOVE OLD submenu items
        // this.submenu_hidden_icons.menu.removeAll();

        //     // let _container = this._hidden_status_icons[name].indicator.container;
        //     // let parent = _container.get_parent();
        //     // if (parent)
        //     //     parent.remove_actor(_container);

        //     let submenuItem = new HiddenStatusIcon(this._hidden_status_icons[name].indicator.container, name);
        //     this.submenu_hidden_icons.menu.addMenuItem(submenuItem);
        // }
        
        // this.submenu_hidden_icons.menu.removeAll();
        
        // for (c in this._hidden_containers) {
        //     Main.notify("this", "hide " + c);
        //     let submenuItem = new HiddenStatusIcon(c);
        //     this.submenu_hidden_icons.menu.addMenuItem(submenuItem)
        // }

        if (this.keep_at_leftmost) {
            // move this icon to left most
            // this.get_parent() should returns the panel-menuItem
            Main.panel._rightBox.set_child_at_index(this.get_parent(), 0);
        }


    }
    
    update_gsettings() {
        let tmpVairant = new GLib.Variant('as', Array.from(this._status_icon_to_hide));
        this._settings.set_value("status-icons-name-to-hide", tmpVairant);
    }

    hideIcon(name) {
        this._status_icon_to_hide.add(name);
        // update gsettings
        this.update_gsettings();
        let _indicator = Main.panel.statusArea[name];
        if (!_indicator) {
            Main.notify("Collapsed-Icons-Menu", "Icon " + name + " does not exists")
            return;
        }
        if (name in this._hidden_icon_menuitem) {
            Main.notify("Collapsed-Icons-Menu", "Icon " + name + " is already hidden")
            return;
        }
        //////////////////////////////
        // add new sub menu for the hidden icon
        let submenuItem = new HiddenStatusIcon(name, _indicator, this);
        
        // let notify_destroyed = (name) => { this. [name].isDestroyed = true; }
        
        _indicator.connect("destroy", this.onDestroyedExternally.bind(this, name));
        

        // add to our tray
        this._hidden_icon_menuitem[name] = submenuItem;
        this.submenu_hidden_icons.menu.addMenuItem(this._hidden_icon_menuitem[name]);
        // allow user to click on tray icons
        submenuItem.container_button.actor.connect('button-press-event', (button, event) => {
            // this needs to first close the main menu, then open the nested sub-menu
            this.aaaa = button;
            // we first try to open a sub-menu. If after doing so, it's state is open
            this._hidden_icon_menuitem[button.statusIconName].indicator.menu.open();
            // then we will close the main menu (because gnome cannot has two menu opened at once and it will
            // try to close them), and perform the same action again.
            // By doing this, we avoid closing the main menu if no sub-menu will opens anyway.
            // E.G. useful for caffeine where it's only click action, and no menu is necessary.
            if (this._hidden_icon_menuitem[button.statusIconName].indicator.menu.isOpen) {
                this.menu.close()
                this._hidden_icon_menuitem[button.statusIconName].indicator.menu.open();
            }
            Main.notify("clicked",'this finished')
        });


        // // this is the icon's new parent which hides it from topbar
        // let hidden_icon_parent = container.get_parent();
        // this._hidden_icon_parents.add(hidden_icon_parent);
    }

    onDestroyedExternally(name) {
        Main.notify("Destroyed!", 'haha')
        // the target indicator has been destroy. We will redo the same process to 
        // hide the icon again
        try {
            this._hidden_icon_menuitem[name].destroy(true);
        } catch (ex) {}
        delete this._hidden_icon_menuitem[name];
        Main.notify("Destroyed!", 'hahaok')
    }

    restoreIcon(name) {
        this._status_icon_to_hide.delete(name);
        // update gsettings
        this.update_gsettings();
        if (!(name in this._hidden_icon_menuitem)) {
            Main.notify("Collapsed-Icons-Menu", "Icon " + name + " is not hidden")
            return;
        }

        this._hidden_icon_menuitem[name].destroy();
        delete this._hidden_icon_menuitem[name];
    }

    _createSwitchMenu(name) {
        let state = false;
        if (name in this._hidden_icon_menuitem)
            state = true;
        let switchmenuitem = new PopupMenu.PopupSwitchMenuItem(name, state);
        switchmenuitem.statusButtonName = name;
        switchmenuitem.connect('toggled', (button, value) => {
            if (value) {
                this.hideIcon(name);
            } else {
                this.restoreIcon(name);
            }


            // try {
            //     this._status_icon_to_hide.delete(name)
            // } catch (ex) { }
            // this._hidden_icon_parents.delete(this._hidden_status_icons[name].hidden_icon_parent);




            button.setToggleState(value);
            this.update();
            this.submenu_hidden_icons.menu.open();
        });
        return switchmenuitem;
    }

    destroy() {
        this.menu.removeAll();
        this.submenu_hidden_icons.menu.removeAll();
        this.submenu_nonhidden_icons.menu.removeAll();
        super.destroy();
    }
});



class CollapsedIconMenuExtension {
    constructor() {
        Main.notify('Example Notification', "con");
        this.settings = {
            updateOnOpen: false,
            updateInterval: null,
            position: 0,
            box: "right"
        };
        this.cim_indicator = null;

        const ExtensionUtils = imports.misc.extensionUtils;
        // If `settings-schema` is defined in `metadata.json` you can simply call this
        // this function without an argument.
        this._settings = ExtensionUtils.getSettings();

        // // You can also use this function to safely create a GSettings object for other
        // // schemas without knowing whether they exist or not.
        // let nautilusSettings = null;

        // try {
        //     nautilusSettings = ExtensionUtils.getSettings('org.gnome.nautilus');
        // } catch (e) {
        //     logError(e, 'Failed to load Nautilus settings');
        // }
    }
    
    enable() {
        this.cim_indicator = new CollapsedIconsMenu(this._settings)
        Main.panel.addToStatusArea("collapsed-icons-menu", this.cim_indicator,
                                    this.settings.position,
                                    this.settings.box);
    }
    
    disable() {
        if (this.cim_indicator){
            this.cim_indicator.destroy();
            this.cim_indicator = null;
        }
    }
}

function init() {
    return new CollapsedIconMenuExtension();
}
