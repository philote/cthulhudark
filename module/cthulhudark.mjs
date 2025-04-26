// Import document classes.
import { CthulhuDarkActor } from "./documents/actor.mjs";
import { CthulhuDarkItem } from "./documents/item.mjs";
// Import sheet classes.
import { CthulhuDarkActorSheet } from "./sheets/actor-sheet.mjs";
import { CthulhuDarkItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { CTHULHUDARK } from "./helpers/config.mjs";
// Import data models.
import { CharacterData, NPCData } from "./data/actor.mjs";
import { CthulhuDarkItemData } from "./data/item.mjs";
// Import migration functions.
// import { migrateWorld } from "./data/migrations.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", async function () {
	// Add utility classes to the global game object so that they're more easily
	// accessible in global contexts.
	game.cthulhudark = {
		CthulhuDarkActor,
		CthulhuDarkItem,
	};

	// Add custom constants for configuration.
	CONFIG.CTHULHUDARK = CTHULHUDARK;

	// Define custom Document classes
	CONFIG.Actor.documentClass = CthulhuDarkActor;
	CONFIG.Item.documentClass = CthulhuDarkItem;

	// Register data models
	CONFIG.Actor.dataModels = {
		character: CharacterData,
		npc: NPCData,
	};
	CONFIG.Item.dataModels = {
		item: CthulhuDarkItemData,
	};

	// Register sheet application classes
	Actors.unregisterSheet("core", ActorSheet);
	Actors.registerSheet("cthulhudark", CthulhuDarkActorSheet, {
    makeDefault: true,
	});
	Items.unregisterSheet("core", ItemSheet);
	Items.registerSheet("cthulhudark", CthulhuDarkItemSheet, {
		makeDefault: true,
	});
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

// Hooks.once('ready', async function() {
//   // Wait to make sure all actors and items are fully loaded
//   if (game.user.isGM) {
//     // Determine whether a system migration is required
//     const currentVersion = game.system.version;
//     const needsMigration = true; // For v13 migration, always run once

//     // Perform the migration if required
//     if (needsMigration) {
//       await migrateWorld();
//     }
//   }
// });

Hooks.on("renderChatMessage", (chatMessage, [html], messageData) => {
	const flag = chatMessage.getFlag("cthulhudark", "chatID");
	if (flag && flag == "cthulhudark") {
		$(html).addClass("cd-roll-chat");
	}
});
