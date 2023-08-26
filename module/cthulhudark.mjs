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

Hooks.on('renderChatMessage', (chatMessage, [html], messageData) => {
  const flag = chatMessage.getFlag('cthulhudark', 'chatID');
  if (flag && flag == "cthulhudark") {
    $(html).addClass("cd-roll-chat");
  }
  /**
   <li class="chat-message message flexcol " data-message-id="4MwkrgTH5PYtlEHs">
    <header class="message-header flexrow">
        <h4 class="message-sender">Bob</h4>
        <span class="message-metadata">
            <time class="message-timestamp">Now</time>
            <a class="message-delete"><i class="fas fa-trash"></i></a>
        </span>


    </header>
    <div class="message-content">
        <p><span style="font-size:1.5em"><b style="color:#99d097"><i>Insight Roll!</i></b>: </span><i class="fas fa-dice-five" style="color:#99d097;font-size:2em"></i></p><hr>Your previous <b style="color:#99d097"><i>Insight</i></b> was <b>1</b>. You rolled higher, so your insight is now  <b>2</b>. Roleplay your fear.
    </div>
  </li>
  */
});

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