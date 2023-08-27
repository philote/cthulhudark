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
