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

   ======================================================================

   This class contains code based on the following work:

   * Prototype JS
     http://www.prototypejs.org/
     Version 1.5

     Copyright:
       (c) 2006-2007, Prototype Core Team

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Prototype Core Team


************************************************************************ */

/* ************************************************************************

#module(html2)

************************************************************************ */

/**
 * Style querying and modification of HTML elements.
 *
 * Automatically normalizes cross-browser differences. Optimized for
 * performance. This class does not contain cross-browser support
 * for special things like <code>opacity</code> which otherwise will
 * result in a much bigger implementation. For special things like
 * these please use the appropriate classes in this namespace.
 */
qx.Class.define("qx.html2.element.Style",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** Internal map of style property convertions */
    __hints : 
    { 
      names : 
      { 
        "float" : qx.core.Client.getInstance().isMshtml() ? "styleFloat" : "cssFloat" 
      }
    },


    /**
     * Sets the value of a style property
     *
     * @type static
     * @param element {Element} The DOM element to modify
     * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
     * @param value {var} the value for the given style
     * @return {void}
     */
    set : function(element, name, value)
    {
      var hints = this.__hints;

      // normalize name
      name = hints.names[name] || name;

      // apply style
      element.style[name] = value || "";
    },


    /**
     * Returns the computed value of a style property
     *
     * @type static
     * @param element {Element} The DOM element to query
     * @param name {String} Name of the style attribute (js variant e.g. marginTop, wordSpacing)
     * @signature function(element, name)
     * @return {var} the value of the given style
     */
    get : qx.core.Variant.select("qx.client",
    {
      // Mshtml uses currentStyle to query the computed style.
      // This is a propertiery property on mshtml.
      // Opera supports currentStyle, too, which is also faster
      // than evaluating using style+getComputedStyle
      "mshtml|opera" : function(element, name)
      {
        var hints = this.__hints;

        // normalize name
        name = hints.names[name] || name;

        // read out computed style
        var value = element.currentStyle[name];

        // auto should be interpreted as null
        return value === "auto" ? null : value;
      },

      // Support for the DOM2 getComputedStyle method
      //
      // Safari >= 3 & Gecko > 1.4 expose all properties to the returned
      // CSSStyleDeclaration object. In older browsers the function
      // "getPropertyValue" is needed to access the values.
      //
      // On a computed style object all properties are read-only which is
      // identical to the behavior of MSHTML's "currentStyle".
      "default" : function(element, name)
      {
        var hints = this.__hints;

        // normalize name
        name = hints.names[name] || name;

        // read out explicit style:
        // faster than the method call later
        var value = element.style[name];

        // otherwise try computed value
        if (!value)
        {
          // Opera, Mozilla and Safari 3+ also have a global getComputedStyle which is identical
          // to the one found under document.defaultView.
          
          // The problem with this is however that this does not work correctly
          // when working with frames and access an element of another frame.
          // Then we must use the <code>getComputedStyle</code> of the document
          // where the element is defined.
          var computed = qx.html2.element.Node.getDocument(element).defaultView.getComputedStyle(element, null);

          // All relevant browsers expose the configured style properties to the CSSStyleDeclaration
          // objects
          if (computed) {
            value = computed[name];
          }
        }

        // auto should be interpreted as null
        return value === "auto" ? null : value;
      }
    })
  }
});
