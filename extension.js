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

const {GObject, St} = imports.gi;
const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();

// StBin cannot handle enter and leave event,
// StButton is perfect for blocking mouse press events.
var Notch = GObject.registerClass(class Notch extends St.Button {
  _init() {
    super._init({"name": "notch"});
    // The camera image is set to widget's background in stylesheet.
    this.set_child(new St.Widget({"name": "camera"}));
  }

  // A physical notch cannot display cursor.
  vfunc_enter_event(event) {
    Main.magnifier.hideSystemCursor();
    return super.vfunc_enter_event(event);
  }

  vfunc_leave_event(event) {
    Main.magnifier.showSystemCursor();
    return super.vfunc_leave_event(event);
  }
});

class Extension {
  constructor() {
    this.notch = null;
  }

  enable() {
    this.notch = new Notch();
    Main.layoutManager.addTopChrome(this.notch);
    const primaryMonitor = Main.layoutManager.primaryMonitor;
    const width = 250;
    const height = 60;
    const x = primaryMonitor.x + (primaryMonitor.width - width) / 2;
    const y = 0;
    this.notch.set_size(width, height);
    this.notch.set_position(x, y);
  }

  disable() {
    Main.layoutManager.removeChrome(this.notch);
    this.notch.destroy();
  }
}

function init() {
    return new Extension();
}
