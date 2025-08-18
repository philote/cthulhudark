// Import document classes.
import { CthulhuDarkActor } from "./documents/actor.mjs";
import { CthulhuDarkItem } from "./documents/item.mjs";
// Import sheet classes.
import { CthulhuDarkActorSheet } from "./sheets/actor-sheet.mjs";
import { CthulhuDarkItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { CTHULHUDARK } from "./helpers/config.mjs";
import * as utils from "./helpers/utils.mjs";
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

    utils.registerHandlebarsHelpers();
});

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.on("renderChatMessage", (chatMessage, [html], messageData) => {
	const flag = chatMessage.getFlag("cthulhudark", "chatID");
	if (flag && flag == "cthulhudark") {
		$(html).addClass("cd-roll-chat");
	}
});

Hooks.on("renderSettings", (app, html) => {
    // --- Setting Module Configuration
    const MODULE_CONFIG = {
        headingKey: "CTHULHUDARK.Settings.game.heading",
        sectionClass: "us2e-doc",
        buttonsData: [
            {
                action: (ev) => {
                    ev.preventDefault();
                    window.open("https://www.drivethrurpg.com/product/341997/Cthulhu-Dark", "_blank");
                },
                iconClasses: ["fa-solid", "fa-book"],
                labelKey: "CTHULHUDARK.Settings.game.publisher.title",
            },
            {
                action: (ev) => {
                    ev.preventDefault();
                    window.open("https://github.com/philote/cthulhudark", "_blank");
                },
                iconClasses: ["fab", "fa-github"],
                labelKey: "CTHULHUDARK.Settings.game.github.title",
            },
            {
                action: (ev) => {
                    ev.preventDefault();
                    window.open("https://ko-fi.com/ephson", "_blank");
                },
                iconClasses: ["fa-solid", "fa-mug-hot"],
                labelKey: "CTHULHUDARK.Settings.game.kofi.title",
            },
        ]
    };

    // --- Button Creation Logic 
    const buttons = MODULE_CONFIG.buttonsData.map(({ action, iconClasses, labelKey }) => {
        const button = document.createElement("button");
        button.type = "button";

        const icon = document.createElement("i");
        icon.classList.add(...iconClasses);

        // Append icon and localized text node
        button.append(icon, document.createTextNode(` ${game.i18n.localize(labelKey)}`));

        button.addEventListener("click", action);
        return button;
    });
    
    // --- Version Specific Logic (Reusable) ---
    if (game.release.generation >= 13) {
        // V13+ Logic: Insert after the "Documentation" section
        const documentationSection = html.querySelector("section.documentation");
        if (documentationSection) {
            // Create section wrapper
            const section = document.createElement("section");
            section.classList.add(MODULE_CONFIG.sectionClass, "flexcol");

            const divider = document.createElement("h4");
            divider.classList.add("divider");
            divider.textContent = game.i18n.localize(MODULE_CONFIG.headingKey);

            // Append divider and buttons to section
            section.append(divider, ...buttons);
            
            // Insert section before documentation
            documentationSection.before(section);
        } else {
            console.warn(`${game.i18n.localize(MODULE_CONFIG.headingKey)} | Could not find 'section.documentation' in V13 settings panel.`);
        }
    } else {
        // V12 Logic: Insert after the "Game Settings" section
        const gameSettingsSection = html[0].querySelector("#settings-game");
        if (gameSettingsSection) {
			const header = document.createElement("h2");
			header.innerText = game.i18n.localize(MODULE_CONFIG.headingKey);

			const settingsDiv = document.createElement("div");
			settingsDiv.append(...buttons);

			// Insert the header and the div containing buttons after the game settings section
			gameSettingsSection.after(header, settingsDiv);
        } else {
            console.warn(`${game.i18n.localize(MODULE_CONFIG.headingKey)} | Could not find '#settings-game' section in V12 settings panel.`);
        }
    }
});