/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_core)
#optional(qx.ui.form.Button)
#embed(qx.icontheme/16/actions/format-color.png)

************************************************************************ */

qx.Class.define("qx.manager.object.ColorManager",
{
  type : "singleton",
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Registers the themes
    this.__colorThemes = {};

    // Stores the objects
    this.__themedObjects = {};
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    colorTheme :
    {
      check : "Theme",
      nullable : true,
      apply : "_applyColorTheme"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      COLOR VALUE HANDLING
    ---------------------------------------------------------------------------
    */

    isNamedColor : function(value) {
      return this.__namedColors[value] !== undefined;
    },

    isThemedColor : function(value) {
      return this.__themedColors[value] !== undefined;
    },

    /**
     * Processing a color and handle callback execution on theme updates.
     *
     * @param instance {Object} Any object
     * @param callback {String} Name of callback function which handles the
     *   apply of the resulting CSS valid value.
     * @param value {var} Any acceptable color value
     * @return {void}
     */
    process : function(instance, callback, value)
    {
      // Store references for themed colors
      var key = "color" + instance.toHashCode() + "$" + callback;
      var reg = this.__themedObjects;

      if (value && this.__themedColors[value])
      {
        // Store reference for themed values
        reg[key] = { instance : instance, callback : callback, value : value };
      }
      else if (reg[key])
      {
        // In all other cases try to remove previously created references
        delete reg[key];
      }

      // Finally executing given callback
      instance[callback](value ? this.__anyColor2Style(value) : null);
    },

    getThemedColorRGB : function(value) {
      return this.__themedColors[value];
    },




    /*
    ---------------------------------------------------------------------------
      INTERNAL COLOR VALUE HANDLING
    ---------------------------------------------------------------------------
    */

    __namedColors :
    {
      black : 1,
      silver : 1,
      gray : 1,
      white : 1,
      maroon : 1,
      red  : 1,
      purple : 1,
      fuchsia : 1,
      green : 1,
      lime : 1,
      olive : 1,
      yellow : 1,
      navi : 1,
      blue : 1,
      teal : 1,
      aqua : 1,
      transparent : 1
    },

    __themedColor2Style : function(value)
    {
      var rgb = this.getColorTheme().colors[value];
      return rgb ? "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")" : null;
    },

    __anyColor2Style : function(value)
    {
      // TODO: Remove temporary compatibility
      if (value instanceof qx.renderer.color.Color)
      {
        this.debug("Deprecated usage of Color/ColorObject: " + value.getValue());
        return value.getStyle();
      }

      if (this.__namedColors[value]) {
        return value;
      }

      if (this.__themedColors[value]) {
        return this.__themedColors[value];
      }

      // Hex, RGB strings or other allowed values.
      // Validation is not done here.
      return value;
    },




    /*
    ---------------------------------------------------------------------------
      MODIFIER
    ---------------------------------------------------------------------------
    */

    _applyColorTheme : function(value, old)
    {
      // Generating RGB strings from themed colors
      var values = value.colors;
      var result = this.__themedColors = {};
      for (var key in values) {
        result[key] = this.__themedColor2Style(key);
      }

      // Inform objects which have registered
      // regarding the theme switch
      var reg = this.__themedObjects;
      var entry;

      for (var key in reg)
      {
        entry = reg[key];
        entry.instance[entry.callback](this.__themedColors[entry.value]);
      }
    },




    /*
    ---------------------------------------------------------------------------
      COLOR THEME REGISTRATION
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param vThemeClass {var} TODOC
     * @return {void}
     */
    registerColorTheme : function(vThemeClass)
    {
      this.__colorThemes[vThemeClass.name] = vThemeClass;

      if (vThemeClass.name == qx.core.Setting.get("qx.colorTheme")) {
        this.setColorTheme(vThemeClass);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vId {var} TODOC
     * @return {void}
     */
    setColorThemeById : function(vId) {
      this.setColorTheme(this.__colorThemes[vId]);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vParent {var} TODOC
     * @param xCor {var} TODOC
     * @param yCor {var} TODOC
     * @return {void}
     * @deprecated
     */
    createThemeList : function(vParent, xCor, yCor)
    {
      var vButton;
      var vThemes = this.__colorThemes;
      var vIcon = "icon/16/actions/format-color.png";
      var vPrefix = "Color Theme: ";
      var vEvent = "execute";

      for (var vId in vThemes)
      {
        var vObj = vThemes[vId];
        var vButton = new qx.ui.form.Button(vPrefix + vObj.title, vIcon);

        vButton.setLocation(xCor, yCor);
        vButton.addEventListener(vEvent, new Function("qx.manager.object.ColorManager.getInstance().setColorThemeById('" + vId + "')"));

        vParent.add(vButton);

        yCor += 30;
      }
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : {
    "qx.colorTheme" : "qx.theme.color.WindowsRoyale"
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("__colorThemes", "__themedObjects");
  }
});
