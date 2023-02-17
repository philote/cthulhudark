// Import document classes.
import { CthulhuDarkActor } from "./documents/actor.mjs";
import { CthulhuDarkItem } from "./documents/item.mjs";
// Import sheet classes.
import { CthulhuDarkActorSheet } from "./sheets/actor-sheet.mjs";
import { CthulhuDarkItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { CTHULHUDARK } from "./helpers/config.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once('init', async function() {

  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.cthulhudark = {
    CthulhuDarkActor,
    CthulhuDarkItem
  };

  // Add custom constants for configuration.
  CONFIG.CTHULHUDARK = CTHULHUDARK;

  // Define custom Document classes
  CONFIG.Actor.documentClass = CthulhuDarkActor;
  CONFIG.Item.documentClass = CthulhuDarkItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cthulhudark", CthulhuDarkActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("cthulhudark", CthulhuDarkItemSheet, { makeDefault: true });

  /* -------------------------------------------- */
  /*  Handlebars Helpers                          */
  /* -------------------------------------------- */

  // Multiboxes from Blades in the Dark system module. 
  // https://github.com/megastruktur/foundryvtt-blades-in-the-dark
  Handlebars.registerHelper('multiboxes', function(selected, options) {

    let html = options.fn(this);

    // Fix for single non-array values.
    if ( !Array.isArray(selected) ) {
      selected = [selected];
    }

    if (typeof selected !== 'undefined') {
      selected.forEach(selected_value => {
        if (selected_value !== false) {
          let escapedValue = RegExp.escape(Handlebars.escapeExpression(selected_value));
          let rgx = new RegExp(' value=\"' + escapedValue + '\"');
          let oldHtml = html;
          html = html.replace(rgx, "$& checked");
          while( ( oldHtml === html ) && ( escapedValue >= 0 ) ){
            escapedValue--;
            rgx = new RegExp(' value=\"' + escapedValue + '\"');
            html = html.replace(rgx, "$& checked");
          }
        }
      });
    }
    return html;
  });

  // "N Times" loop for handlebars.
  //  Block is executed N times starting from n=1.
  //
  // Usage:
  // {{#times_from_1 10}}
  //   <span>{{this}}</span>
  // {{/times_from_1}}
  Handlebars.registerHelper('times_from_1', function(n, block) {

    var accum = '';
    for (var i = 1; i <= n; ++i) {
      accum += block.fn(i);
    }
    return accum;
  });

  // "N Times" loop for handlebars.
  //  Block is executed N times starting from n=0.
  //
  // Usage:
  // {{#times_from_0 10}}
  //   <span>{{this}}</span>
  // {{/times_from_0}}
  Handlebars.registerHelper('times_from_0', function(n, block) {

    var accum = '';
    for (var i = 0; i <= n; ++i) {
      accum += block.fn(i);
    }
    return accum;
  });
});


// // If you need to add Handlebars helpers, here are a few useful examples:
// Handlebars.registerHelper('concat', function() {
//   var outStr = '';
//   for (var arg in arguments) {
//     if (typeof arguments[arg] != 'object') {
//       outStr += arguments[arg];
//     }
//   }
//   return outStr;
// });

// Handlebars.registerHelper('toLowerCase', function(str) {
//   return str.toLowerCase();
// });