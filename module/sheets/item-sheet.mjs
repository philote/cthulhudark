const { api, sheets } = foundry.applications;

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class CthulhuDarkItemSheet extends api.HandlebarsApplicationMixin(
  sheets.ItemSheetV2
) {
  /** @override */
  static DEFAULT_OPTIONS = {
    classes: ["cthulhudark", "sheet", "item"],
    position: {
      width: 310,
      height: 620,
		},
    window: {
			resizable: true,
		},
    actions: {
      onEditImage: this._onEditImage,
    },
    form: {
      submitOnChange: true,
    }
  };

  /** @override */
  static PARTS = {
    item: {
      template: "systems/cthulhudark/templates/item/item-sheet.hbs",
      scrollable: [""],
    }
  };

  /** @override */
  get title() {
    return `${this.item.name}`;
  }

  /* -------------------------------------------- */

  /** @override */
	_configureRenderOptions(options) {
		super._configureRenderOptions(options);
		// Not all parts always render
		options.parts = ['item'];
	}

  /** @override */
  _prepareContext(options) {
    // Retrieve base data structure.
    const context = super._prepareContext(options);

    // Retrieve the roll data for TinyMCE editors.
    // context.rollData = {};
    // let actor = this.object?.parent ?? null;
    // if (actor) {
    //   context.rollData = actor.getRollData();
    // }

    return context;
  }

  /* -------------------------------------------- */

  /**
	 * Handle changing a Document's image.
	 *
	 * @this BoilerplateActorSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @returns {Promise}
	 * @protected
	 */
	static async _onEditImage(event, target) {
		const attr = target.dataset.edit;
		const current = foundry.utils.getProperty(this.document, attr);
		const { img } =
			this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ??
			{};
		const fp = new FilePicker({
			current,
			type: "image",
			redirectToRoot: img ? [img] : [],
			callback: (path) => {
				this.document.update({ [attr]: path });
			},
			top: this.position.top + 40,
			left: this.position.left + 10,
		});
		return fp.browse();
	}

}
