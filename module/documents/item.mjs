/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class CthulhuDarkItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

}