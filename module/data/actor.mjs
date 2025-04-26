/**
 * Base actor data that all actor types share
 * @extends {foundry.abstract.TypeDataModel}
 */
export class CthulhuDarkActorData extends foundry.abstract.TypeDataModel {
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      notes: new fields.HTMLField({ required: true, blank: true }),
    };
  }
}

/**
 * Character-specific data model
 * @extends {CthulhuDarkActorData}
 */
export class CharacterData extends CthulhuDarkActorData {
  /** @override */
  static defineSchema() {
    const requiredInteger = { required: true, nullable: false, integer: true };
    const requiredString = { required: true, blank: true };
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      insight: new fields.SchemaField({
        min: new fields.NumberField({
          ...requiredInteger,
          initial: 0,
          min: 0
        }),
        value: new fields.ArrayField(
          new fields.NumberField(), 
          {initial: [1]}
        ),
        max: new fields.NumberField({
          ...requiredInteger,
          initial: 6,
          min: 0
        }),
        states: new fields.ArrayField(
          new fields.BooleanField(), 
          {initial: [true, false, false, false, false, false]}
        )
      }),
      occupation: new fields.StringField({ ...requiredString })
    };
  }
  
  prepareDerivedData() {
    // Calculate insight value based on states
    // In the original data, value was an array, but for simplicity and based on the
    // states array, we'll calculate a single value representing the current insight level
    const insightLevel = this.insight.states.filter(Boolean).length;
    this.insight.value = [insightLevel]; // Keep as array for backward compatibility
  }
}

/**
 * NPC-specific data model
 * @extends {CthulhuDarkActorData}
 */
export class NPCData extends CthulhuDarkActorData {
  /** @override */
  static defineSchema() {
    const requiredString = { required: true, blank: true };
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      looks: new fields.StringField({ ...requiredString }),
      behaviors: new fields.StringField({ ...requiredString }),
      motivations: new fields.StringField({ ...requiredString })
    };
  }
}