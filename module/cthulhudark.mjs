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
});

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper('concat', function() {
  var outStr = '';
  for (var arg in arguments) {
    if (typeof arguments[arg] != 'object') {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper('toLowerCase', function(str) {
  return str.toLowerCase();
});