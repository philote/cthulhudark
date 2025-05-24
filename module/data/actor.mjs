/**
 * Base actor data that all actor types share
 * @extends {foundry.abstract.TypeDataModel}
 */
export class CthulhuDarkActorData extends foundry.abstract.TypeDataModel {
  
  /** @override */
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = {};

    schema.notes = new fields.HTMLField({ 
      required: true, 
      blank: true 
    });
    
    return schema;
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
    const schema = super.defineSchema();

    schema.insight = new fields.SchemaField({
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
    });
    
    schema.occupation = new fields.StringField({ ...requiredString });

    return schema;
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
    const schema = super.defineSchema();

    schema.looks = new fields.StringField({ ...requiredString });
    schema.behaviors = new fields.StringField({ ...requiredString });
    schema.motivations = new fields.StringField({ ...requiredString });
    
    return schema;
  }
}