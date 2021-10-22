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
const PointerWatcher = imports.ui.pointerWatcher;
const ExtensionUtils = imports.misc.extensionUtils;

const Me = ExtensionUtils.getCurrentExtension();

var Notch = GObject.registerClass(class Notch extends St.Bin {
  _init() {
    super._init({"name": "notch"});
    // The camera image is set to widget's background in stylesheet.
    this.set_child(new St.Widget({"name": "camera"}));
  }
});

class Extension {
  constructor() {
    this.notch = null;
    this.watch = null;
    this.isHidingCursor = false;
  }

  enable() {
    this.notch = new Notch();
    Main.layoutManager.addTopChrome(
      this.notch,
      {"trackFullscreen": false}
    );
    const primaryMonitor = Main.layoutManager.primaryMonitor;
    const width = 250;
    const height = 60;
    const x = primaryMonitor.x + (primaryMonitor.width - width) / 2;
    const y = primaryMonitor.y;
    this.notch.set_size(width, height);
    this.notch.set_position(x, y);

    // A physical notch will hide the cursor.
    this.watch = PointerWatcher.getPointerWatcher().addWatch(70, (px, py) => {
      if (this.isHidingCursor) {
        if (!(px >= x && px <= x + width && py >= y && py <= y + height)) {
          Main.magnifier.showSystemCursor();
          this.isHidingCursor = false;
        }
      } else {
        if (px >= x && px <= x + width && py >= y && py <= y + height) {
          Main.magnifier.hideSystemCursor();
          this.isHidingCursor = true;
        }
      }
    });
  }

  disable() {
    Main.layoutManager.removeChrome(this.notch);
    this.notch.destroy();
    this.notch = null;
    this.watch.remove();
    this.watch = null;
    this.isHidingCursor = false;
  }
}

function init() {
  return new Extension();
}
