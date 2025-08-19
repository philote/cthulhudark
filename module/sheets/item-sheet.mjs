const { api, sheets } = foundry.applications;

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheetV2}
 */
export class CthulhuDarkItemSheet extends api.HandlebarsApplicationMixin(
	sheets.ItemSheetV2
) {
	constructor(options = {}) {
		super(options);
	}

	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["cthulhudark", "sheet", "item"],
		position: {
			width: 310,
			height: 650,
		},
		window: {
			resizable: true,
		},
		actions: {
			onEditImage: this._onEditImage,
		},
		form: {
			submitOnChange: true,
		},
	};

	/** @override */
	static PARTS = {
		item: {
			template: "systems/cthulhudark/templates/item/item-sheet.hbs",
			scrollable: [""],
		},
	};

	/* -------------------------------------------- */

	/** @override */
	_configureRenderOptions(options) {
		super._configureRenderOptions(options);
		options.parts = ["item"];
	}

	/** @override */
	async _prepareContext(options) {
		const context = {
			// Validates both permissions and compendium status
			editable: this.isEditable,
			owner: this.document.isOwner,
			// Add the item document.
			item: this.item,
			// Adding system and flags for easier access
			system: this.item.system,
			flags: this.item.flags,
			// Adding a pointer to CONFIG.ETR
			config: CONFIG.CTHULHUDARK,
			// Necessary for formInput and formFields helpers
			fields: this.document.schema.fields,
			systemFields: this.document.system.schema.fields,
		};

		return context;
	}

	/** @override */
	async _preparePartContext(partId, context) {
		switch (partId) {
			case "item":
				context.enrichedDescription = await TextEditor.enrichHTML(
					this.item.system.description,
					{
						secrets: this.document.isOwner,
						rollData: this.item.getRollData(),
						relativeTo: this.item,
					}
				);
				break;
		}
		return context;
	}

	/**
	 * Actions performed after any render of the Application.
	 * Post-render steps are not awaited by the render process.
	 * @param {ApplicationRenderContext} context      Prepared context data
	 * @param {RenderOptions} options                 Provided render options
	 * @protected
	 * @override
	 */
	async _onRender(context, options) {
		await super._onRender(context, options);
		// You may want to add other special handling here
		// Foundry comes with a large number of utility classes, e.g. SearchFilter
		// That you may want to implement yourself.
	}

	/**************
	 *
	 *   ACTIONS
	 *
	 **************/

	/**
	 * Handle changing a Document's image.
	 *
	 * @this CthulhuDarkItemSheet
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
