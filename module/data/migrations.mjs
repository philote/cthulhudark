/**
 * Migration functions for Cthulhu Dark system
 * Handles migration of existing data to the new data model format
 */

/**
 * Migrate the entire world's actors and items
 * @returns {Promise} A promise which resolves once the migration is complete
 */
export async function migrateWorld() {
  ui.notifications.info(`Starting Cthulhu Dark system migration to v13 data models...`, {permanent: true});
  
  // Migrate Actor data
  for (const actor of game.actors) {
    try {
      const updateData = migrateActorData(actor.toObject());
      if (!foundry.utils.isEmpty(updateData)) {
        console.log(`Migrating Actor entity ${actor.name}`);
        await actor.update(updateData);
      }
    } catch(err) {
      console.error(`Error migrating actor ${actor.name}:`, err);
    }
  }
  
  // Migrate Item data
  for (const item of game.items) {
    try {
      const updateData = migrateItemData(item.toObject());
      if (!foundry.utils.isEmpty(updateData)) {
        console.log(`Migrating Item entity ${item.name}`);
        await item.update(updateData);
      }
    } catch(err) {
      console.error(`Error migrating item ${item.name}:`, err);
    }
  }
  
  // Migrate Compendium Actors
  for (const pack of game.packs) {
    if (pack.documentName !== "Actor") continue;
    await migrateCompendium(pack);
  }
  
  // Migrate Compendium Items
  for (const pack of game.packs) {
    if (pack.documentName !== "Item") continue;
    await migrateCompendium(pack);
  }
  
  ui.notifications.info(`Cthulhu Dark system migration to v13 data models complete!`, {permanent: true});
}

/**
 * Migrate a compendium pack
 * @param {CompendiumCollection} pack - The compendium pack to migrate
 * @returns {Promise} A promise which resolves once the migration is complete
 */
async function migrateCompendium(pack) {
  const documentName = pack.documentName;
  if (!["Actor", "Item"].includes(documentName)) return;

  // Unlock the pack for editing
  const wasLocked = pack.locked;
  await pack.configure({locked: false});

  // Begin by requesting all documents from the compendium
  const documents = await pack.getDocuments();
  
  // Iterate through all documents, applying migrations
  for (const doc of documents) {
    try {
      let updateData = {};
      if (documentName === "Actor") updateData = migrateActorData(doc.toObject());
      else if (documentName === "Item") updateData = migrateItemData(doc.toObject());
      
      // If the document needs an update
      if (!foundry.utils.isEmpty(updateData)) {
        console.log(`Migrating ${documentName} entity ${doc.name} in compendium ${pack.collection}`);
        await doc.update(updateData);
      }
    } catch(err) {
      console.error(`Error migrating ${documentName} ${doc.name} in compendium ${pack.collection}:`, err);
    }
  }

  // Re-lock the pack if it was locked before
  if (wasLocked) await pack.configure({locked: true});
  console.log(`Migrated all ${documentName} entities from compendium ${pack.collection}`);
}

/**
 * Migrate actor data from the old format to the new data model format
 * @param {Object} actorData - The actor data to migrate
 * @returns {Object} The update data to apply
 */
export function migrateActorData(actorData) {
  const updateData = {};
  
  // Handle version differences
  const version = game.system.version || "0.0.0";
  
  // Only migrate data for supported actor types
  if (!["character", "npc"].includes(actorData.type)) return updateData;
  
  // Migrate data in the actor system property
  if (actorData.system) {
    const systemData = migrateActorSystemData(actorData.type, actorData.system);
    if (!foundry.utils.isEmpty(systemData)) {
      updateData["system"] = systemData;
    }
  }
  
  // Migrate owned items
  if (actorData.items?.length) {
    const items = actorData.items.map(i => {
      const itemUpdate = migrateItemData(i);
      // Return the original item if no updates are needed
      return foundry.utils.isEmpty(itemUpdate) ? i : foundry.utils.mergeObject(i, itemUpdate, {inplace: false});
    });
    updateData.items = items;
  }
  
  return updateData;
}

/**
 * Migrate the actor's system data
 * @param {string} actorType - The type of actor
 * @param {Object} system - The actor's system data
 * @returns {Object} The update data to apply to the actor's system data
 */
function migrateActorSystemData(actorType, system) {
  const updateData = {};
  
  // Handle character-specific migrations
  if (actorType === "character") {
    // Ensure insight data is properly structured
    if (system.insight) {
      // If insight.value is not an array, convert it to an array
      if (!Array.isArray(system.insight.value)) {
        updateData["insight.value"] = [system.insight.value || 1];
      }
      
      // If insight.states is not an array, initialize it
      if (!Array.isArray(system.insight.states)) {
        updateData["insight.states"] = [true, false, false, false, false, false];
      }
      
      // Ensure min and max values are set
      if (system.insight.min === undefined) updateData["insight.min"] = 0;
      if (system.insight.max === undefined) updateData["insight.max"] = 6;
    }
  }
  
  // Handle NPC-specific migrations
  if (actorType === "npc") {
    // Ensure NPC fields exist
    if (system.looks === undefined) updateData["looks"] = "";
    if (system.behaviors === undefined) updateData["behaviors"] = "";
    if (system.motivations === undefined) updateData["motivations"] = "";
  }
  
  // Ensure notes field exists for all actor types
  if (system.notes === undefined) updateData["notes"] = "";
  
  return updateData;
}

/**
 * Migrate item data from the old format to the new data model format
 * @param {Object} itemData - The item data to migrate
 * @returns {Object} The update data to apply
 */
export function migrateItemData(itemData) {
  const updateData = {};
  
  // Handle version differences
  const version = game.system.version || "0.0.0";
  
  // Only migrate data for supported item types
  if (itemData.type !== "item") return updateData;
  
  // Migrate data in the item system property
  if (itemData.system) {
    const systemData = migrateItemSystemData(itemData.system);
    if (!foundry.utils.isEmpty(systemData)) {
      updateData["system"] = systemData;
    }
  }
  
  return updateData;
}

/**
 * Migrate the item's system data
 * @param {Object} system - The item's system data
 * @returns {Object} The update data to apply to the item's system data
 */
function migrateItemSystemData(system) {
  const updateData = {};
  
  // Ensure description field exists
  if (system.description === undefined) updateData["description"] = "";
  
  // Ensure quantity field exists and is a number
  if (system.quantity === undefined) {
    updateData["quantity"] = 1;
  } else if (typeof system.quantity !== "number") {
    updateData["quantity"] = parseInt(system.quantity) || 1;
  }
  
  return updateData;
}