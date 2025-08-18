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
			value: new fields.NumberField({
				...requiredInteger,
				initial: 1,
				min: 0,
			}),
			max: new fields.NumberField({
				...requiredInteger,
				initial: 6,
				min: 0,
			}),
		});
    
    schema.occupation = new fields.StringField({ ...requiredString });

    return schema;
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