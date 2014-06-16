/*
 *  jQuery Panels - v0.1.0
 *  Simple content switcher.
 *  http://jqueryboilerplate.com
 *
 *  Made by Mike Kornelson
 *  Under GPL License
 */
// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ($, window, document, undefined) {

	// undefined is used here as the undefined global variable in ECMAScript 3 is
	// mutable (ie. it can be changed by someone else). undefined isn't really being
	// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
	// can no longer be modified.

	// window and document are passed through as local variable rather than global
	// as this (slightly) quickens the resolution process and can be more efficiently
	// minified (especially when both are regularly referenced in your plugin).

	// Create the defaults once
	var pluginName = "panels",
		defaults = {
			panel: ".panel",
			item: ".item",
			active: "active",
			skipInitialHide: false,
			showFunc: null,
			hideFunc: null,
			DEBUG: false
		};

	// The actual plugin constructor
	function Plugin(element, options) {
		this.element = element;
		this.settings = $.extend({}, defaults, options);
		this._defaults = defaults;
		this._name = pluginName;
		this.init();
	}

	// Avoid Plugin.prototype conflicts
	$.extend(Plugin.prototype, {

		init: function () {
			var self = this;

			// Grab the panels and items
			var $panels = $(self.settings.panel);
			self._items = $(self.settings.item, self.element);

			// Build a map of the panels with key of item targets
			self._panels = {};
			self._items.each(function () {
				var target = $(this).data("target");
				if (target)
					self._panels[target] = $panels.filter("." + target);
			});

			// Bind the item clicks
			self._bindItemClicks(self._items);

			// Set the current item
			self._currentItem = self._items.filter("." + self.settings.active);

			// Hide all the panels that aren't active
			if (!self.settings.skipInitialHide) {
				var currentPanel = self._panels[self._currentItem.data("target")];
				if (currentPanel) {
					if (self.settings.hideFunc) {
						self.settings.hideFunc.call($panels.not(currentPanel));
					} else {
						$panels.not(currentPanel).hide();
					}
				}
			}
		},

		_bindItemClicks: function (items) {
			var self = this;
			items.click(function (ev) {
				var $selectedItem = $(ev.currentTarget);

				// Add the active class to the selected item and get the target
				var target = $selectedItem.data("target");

				if (target === self._currentItem.data("target")) return;

				$selectedItem.addClass(self.settings.active);

				self.DLOG(target);

				// Remove the active class from the currently active item
				self._currentItem.removeClass(self.settings.active);

				// Hide the currently active panel
				var currentPanel = self._panels[self._currentItem.data("target")];
				if (currentPanel) {
					// Call the defined hide function or else the normal jquery hide
					if (self.settings.hideFunc) {
						self.settings.hideFunc.call(currentPanel);
					} else {
						currentPanel.hide();
					}
				}

				// Show the panel of the selected target
				if (self._panels[target]) {
					// Call the defined show function or else the normal jquery show
					if (self.settings.showFunc) {
						self.settings.showFunc.call(self._panels[target]);
					} else {
						self._panels[target].show();
					}

					// Update the current item
					self._currentItem = $selectedItem;
				}
			});
		},

		DLOG: function() {
			if (!this.settings.DEBUG) return;
			for (var i in arguments) {
				console.log(pluginName + ": ", arguments[i]);
			}
		}
	});


	$.fn[ pluginName ] = function (methodOrOptions) {
		if (!$(this).length) {
			return $(this);
		}
		var instance = $(this).data(pluginName);

		// CASE: action method (public method on PLUGIN class)
		if (instance && methodOrOptions.indexOf("_") !== 0 && instance[ methodOrOptions ]	&& typeof( instance[ methodOrOptions ] ) === "function") {

			return instance[ methodOrOptions ](Array.prototype.slice.call(arguments, 1));


			// CASE: argument is options object or empty = initialise
		}
		if (typeof methodOrOptions === "object" || !methodOrOptions) {

			instance = new Plugin($(this), methodOrOptions);    // ok to overwrite if this is a re-init
			$(this).data(pluginName, instance);
			return $(this);

			// CASE: method called before init
		} else if (!instance) {
			$.error("Plugin must be initialised before using method: " + methodOrOptions);

			// CASE: invalid method
		} else if (methodOrOptions.indexOf("_") === 0) {
			$.error("Method " + methodOrOptions + " is private!");
		} else {
			$.error("Method " + methodOrOptions + " does not exist.");
		}
	};

})(jQuery, window, document);
