/**
 * Base item data model for Cthulhu Dark
 * @extends {foundry.abstract.TypeDataModel}
 */
export class CthulhuDarkItemData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.HTMLField({ required: true, blank: true }),
    };
  }
}