const { api, sheets } = foundry.applications;

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export class CthulhuDarkActorSheet extends api.HandlebarsApplicationMixin(
	sheets.ActorSheetV2
) {
	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["cthulhudark", "sheet", "actor"],
		position: {
			width: 310,
			height: 790,
		},
		window: {
			resizable: true,
		},
		actions: {
			roll: this._onRoll,
			onInsightUpdate: this._onInsightUpdate,
		},
		form: {
			submitOnChange: true,
		},
	};

	/** @override */
	static PARTS = {
		character: {
			template: "systems/cthulhudark/templates/actor/actor-character-sheet.hbs",
		},
		npc: {
			template: "systems/cthulhudark/templates/actor/actor-npc-sheet.hbs",
		},
		tabs: {
			// Foundry-provided generic template
			template: "templates/generic/tab-navigation.hbs",
		},
		notes: {
			template: "systems/cthulhudark/templates/actor/notes.hbs",
		},
		rules: {
			template: "systems/cthulhudark/templates/actor/rules.hbs",
		},
	};

	/** @override */
	static TABS = {
		primary: {
			tabs: [{ id: "notes" }, { id: "rules" }],
			labelPrefix: "CTHULHUDARK.Tabs",
			initial: "notes",
		},
	};

	/** @override */
	get title() {
		return `${this.actor.name}`;
	}

	/* -------------------------------------------- */

	/** @override */
	_configureRenderOptions(options) {
		super._configureRenderOptions(options);
		// Not all parts always render
		// options.parts = ['actor'];
		// Don't show the other tabs if only limited view
		// if (this.document.limited) return;
		// Control which parts show based on document subtype
		switch (this.document.type) {
			case "character":
				options.parts = ["character", "tabs", "notes", "rules"];
				break;
			case "npc":
				options.parts = ["npc", "notes"];
				break;
		}
	}

	/** @override */
	async _prepareContext(options) {
		// Output initialization
		const context = {
			// Validates both permissions and compendium status
			editable: this.isEditable,
			owner: this.document.isOwner,
			limited: this.document.limited,
			// Add the actor document.
			actor: this.actor,
			// Add the actor's data to context.data for easier access, as well as flags.
			system: this.actor.system,
			flags: this.actor.flags,
			// Adding a pointer to CONFIG.BOILERPLATE
			config: CONFIG.CTHULHUDARK,
			tabs: this._prepareTabs("primary"),
			// Necessary for formInput and formFields helpers
			fields: this.document.schema.fields,
			systemFields: this.document.system.schema.fields,
		};

		return context;
	}

	/** @override */
	async _preparePartContext(partId, context) {
		switch (partId) {
			case "rules":
				context.tab = context.tabs[partId];
				break;
			case "notes":
				context.tab = context.tabs[partId];
				// Enrich biography info for display
				// Enrichment turns text like `[[/r 1d20]]` into buttons
				context.enrichedNotes = await foundry.applications.ux.TextEditor.implementation.enrichHTML(
					this.actor.system.notes,
					{
						// Whether to show secret blocks in the finished html
						secrets: this.document.isOwner,
						// Data to fill in for inline rolls
						rollData: this.actor.getRollData(),
						// Relative UUID resolution
						relativeTo: this.actor,
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

	static async _onInsightUpdate(event, target) {
		event.preventDefault();
		const { value, property } = target.dataset;
		let prop = foundry.utils.deepClone(
			foundry.utils.getProperty(this.actor, property)
		);
		let index = Number(value) + 1; // Adjust for 1-index
		// Handle clicking the same checkbox to unset its value.
		if (!event.target.checked && prop === index) {
			index--;
		}
		prop = index;
		await this.actor.update({ [property]: prop });
	}

	/**
	 * Handle clickable rolls and actions.
	 * @param {Event} event   The originating click event
	 * @private
	 */
	static async _onRoll(event, target) {
		event.preventDefault();
		const dataset = target.dataset;

		// Handle actions.
		if (dataset.rollType) {
			switch (dataset.rollType) {
				case "investigate": {
					// Investigate
					const move = 1;
					this._asyncCDMoveDialog({ move });
					return;
				}
				case "insight": {
					// Insight
					this._insightRoll();
					return;
				}
				case "failure": {
					// Failure
					this._failureRoll();
					return;
				}
				case "clearInsight": {
					this._onClearInsight();
					return;
				}
				case "doSomethingElse":
				default: {
					// Do Something Else 2
					const move = 2;
					this._asyncCDMoveDialog({ move });
					return;
				}
			}
		}
	}

	_onClearInsight() {
		this.actor.update({ ["system.insight.value"]: 0 });
	}

	_increaseInsightByOne(newInsightVal) {
		if (newInsightVal <= 6) {
			this.actor.update({ "system.insight.value": newInsightVal });
		}
	}

	/* -------------------------------------------- */

	// ---------------------------
	// From my macro rolling files
	// ---------------------------

	getWordInsightWithFormatting() {
		return `<b class="${CONFIG.CTHULHUDARK.RiskColor}">
			<i>${game.i18n.localize("CTHULHUDARK.Insight")}</i>
		</b>`;
	}

	getWordInsightRollWithFormatting() {
		return `<b class="${CONFIG.CTHULHUDARK.RiskColor}">
			<i>${game.i18n.localize("CTHULHUDARK.InsightRoll")}</i>
		</b>`;
	}

	getRiskMoveMessage() {
		return game.i18n.format("CTHULHUDARK.RiskMoveMessage", {
			insightroll: this.getWordInsightRollWithFormatting(),
		});
	}

	dialogTitle(moveNumber) {
		switch (moveNumber) {
			case 1:
				return game.i18n.localize("CTHULHUDARK.InvestigateDialogTitle");
			case 2:
			default:
				return game.i18n.localize("CTHULHUDARK.DoSomethingElseDialogTitle");
		}
	}

	async dialogContent(moveNumber) {
		let dialogTitleDesc = "";
		switch (moveNumber) {
			case 1: // Investigate
				dialogTitleDesc = game.i18n.localize("CTHULHUDARK.InvestigateDialogDesc");
				break;
			case 2: // Do Something Else
			default:
				dialogTitleDesc = game.i18n.localize(
					"CTHULHUDARK.DoSomethingElseDialogDesc"
				);
		}

		const template_file =
			"systems/cthulhudark/templates/dialog/roll-content-template.hbs";
		const template_data = {
			dialogTitle: dialogTitleDesc,
			riskColor: CONFIG.CTHULHUDARK.RiskColor,
		};
		const rendered_html = await foundry.applications.handlebars.renderTemplate(
			template_file,
			template_data
		);
		return rendered_html;
	}

	getMaxDieMessage(moveNumber, maxDieNumber) {
		switch (moveNumber) {
			case 1: // Investigate
				switch (maxDieNumber) {
					case "1":
					case "2":
					case "3":
						return game.i18n.localize("CTHULHUDARK.InvestigateMaxDieMessage123");
					case "4":
						return game.i18n.localize("CTHULHUDARK.InvestigateMaxDieMessage4");
					case "5":
						return game.i18n.localize("CTHULHUDARK.InvestigateMaxDieMessage5");
					case "6":
						return game.i18n.format("CTHULHUDARK.InvestigateMaxDieMessage6", {
							insightroll: this.getWordInsightRollWithFormatting(),
						});
					default: {
						console.error("ERROR(getMaxDieMessage.1)");
						return `<span class="error-color">ERROR(getMaxDieMessage.1)</span>`;
					}
				}
			case 2: // Do Something Else
			default:
				switch (maxDieNumber) {
					case "1":
					case "2":
					case "3":
						return game.i18n.localize("CTHULHUDARK.DoSomethingElseMaxDieMessage123");
					case "4":
						return game.i18n.localize("CTHULHUDARK.DoSomethingElseMaxDieMessage4");
					case "5":
						return game.i18n.localize("CTHULHUDARK.DoSomethingElseMaxDieMessage5");
					case "6":
						return game.i18n.format("CTHULHUDARK.DoSomethingElseMaxDieMessage6", {
							insightroll: this.getWordInsightRollWithFormatting(),
						});
					default: {
						console.error("ERROR(getMaxDieMessage.2)");
						return `<span class="error-color">ERROR(getMaxDieMessage.2)</span>`;
					}
				}
		}
	}

	/**
	 * Build the template data for a rolled die.
	 * @param {string} dieNumber   The rolled value, "1" through "6"
	 * @param {string} colorClass  CSS class used to color the die icon
	 * @returns {{icon: string, colorClass: string}}
	 */
	getDieForOutput(dieNumber, colorClass) {
		const icons = ["one", "two", "three", "four", "five", "six"];
		const name = icons[Number(dieNumber) - 1];
		if (!name) console.error("Error in the getDieForOutput, bad die number used.");
		return { icon: `fa-dice-${name}`, colorClass };
	}

	/**
	 * Render one of the system's chat card templates.
	 * @param {string} name  Template file name in templates/chat, without extension
	 * @param {object} data  Template data
	 * @returns {Promise<string>}
	 */
	async renderChatCard(name, data) {
		return foundry.applications.handlebars.renderTemplate(
			`systems/cthulhudark/templates/chat/${name}.hbs`,
			data
		);
	}

	async _asyncCDMoveDialog({ move = 0 } = {}) {
		const selection = await api.DialogV2.input({
			window: { title: this.dialogTitle(move) },
			// THIS ADDS A CLASS TO THE WINDOW
			classes: ["cd-roll-dialog"],
			content: await this.dialogContent(move),
			ok: {
				icon: "fa-solid fa-dice",
				label: "CTHULHUDARK.Roll",
			},
		});

		// Dialog was closed without rolling
		if (!selection) return;

		// get and roll selected dice
		const dice = [];

		if (selection.humanDie) {
			let hdRoll = await new Roll("1d6").evaluate();
			dice.push({
				dieColor: CONFIG.CTHULHUDARK.BaseColor,
				isRisk: false,
				rollVal: hdRoll.result,
				roll: hdRoll,
			});
		}

		if (selection.occupationalDie) {
			let odRoll = await new Roll("1d6").evaluate();
			dice.push({
				dieColor: CONFIG.CTHULHUDARK.BaseColor,
				isRisk: false,
				rollVal: odRoll.result,
				roll: odRoll,
			});
		}

		if (selection.insightDie) {
			let idRoll = await new Roll("1d6").evaluate();
			dice.push({
				dieColor: CONFIG.CTHULHUDARK.RiskColor,
				isRisk: true,
				rollVal: idRoll.result,
				roll: idRoll,
			});
		}

		// No dice selected, nothing to roll
		if (!dice.length) return;

		const maxDie = dice.reduce((a, b) => (a.rollVal > b.rollVal ? a : b));

		// Determine if the risk die won
		const isRiskDie = dice.some(
			(die) => die.isRisk && die.rollVal == maxDie.rollVal
		);

		// Initialize chat data.
		const chatContentMessage = await this.renderChatCard("move-roll", {
			moveName: this.dialogTitle(move),
			dice: dice.map((die) => this.getDieForOutput(die.rollVal, die.dieColor)),
			outcome: this.getMaxDieMessage(move, maxDie.rollVal),
			riskMessage: isRiskDie ? this.getRiskMoveMessage() : "",
		});
		const user = game.user.id;
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });
		const messageMode = game.settings.get("core", "messageMode");

		ChatMessage.create({
			author: user,
			rolls: dice.map((die) => {
				// If "Dice So Nice!" is installed, color the risk die so it stands out.
				// Other dice keep the player's own Dice So Nice appearance.
				if (die.isRisk) {
					die.roll.dice[0].options.appearance = {
						...CONFIG.CTHULHUDARK.RiskDieAppearance,
					};
				}

				return die.roll;
			}),
			speaker: speaker,
			content: chatContentMessage,
			flags: { cthulhudark: { chatID: "cthulhudark" } },
		}, { messageMode });
	}

	// -------
	// Insight
	// -------

	insightMessage(previousInsight, newInsight) {
		if (newInsight > previousInsight) {
			switch (newInsight) {
				case 1:
				case 2:
				case 3:
				case 4:
					return game.i18n.format("CTHULHUDARK.InsightChatContent4", {
						insight: this.getWordInsightWithFormatting(),
						previousinsight: previousInsight,
						newnsight: newInsight,
					});
				case 5:
					return game.i18n.format("CTHULHUDARK.InsightChatContent5", {
						insight: this.getWordInsightWithFormatting(),
						previousinsight: previousInsight,
						newnsight: newInsight,
						insighttwo: this.getWordInsightWithFormatting(),
					});
				case 6:
					return game.i18n.format("CTHULHUDARK.InsightChatContent6", {
						insight: this.getWordInsightWithFormatting(),
						previousinsight: previousInsight,
						newnsight: newInsight,
					});
				default: {
					console.error("Error in the insightMessage, bad dice numbers used.");
					return "";
				}
			}
		} else {
			return game.i18n.format("CTHULHUDARK.InsightChatContent", {
				insight: this.getWordInsightWithFormatting(),
				previousinsight: previousInsight,
			});
		}
	}

	async _insightRoll() {
		let insightRoll = await new Roll("1d6").evaluate();
		let currentInsightVal = this.actor.system.insight.value;

		let newInsightVal = currentInsightVal;
		if (insightRoll.result > currentInsightVal && currentInsightVal < 6) {
			++newInsightVal;
			this._increaseInsightByOne(newInsightVal);
		}

		const chatContentMessage = await this.renderChatCard("insight-roll", {
			title: this.getWordInsightRollWithFormatting(),
			dice: [this.getDieForOutput(insightRoll.result, CONFIG.CTHULHUDARK.RiskColor)],
			message: this.insightMessage(currentInsightVal, newInsightVal),
		});
		const user = game.user.id;
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });
		const messageMode = game.settings.get("core", "messageMode");

		// If "Dice So Nice!" is installed, this data will cause it to roll a
		// visual die with the insight theme colors
		insightRoll.dice[0].options.appearance = {
			...CONFIG.CTHULHUDARK.RiskDieAppearance,
		};

		ChatMessage.create({
			author: user,
			speaker: speaker,
			rolls: [insightRoll],
			content: chatContentMessage,
			flags: { cthulhudark: { chatID: "cthulhudark" } },
		}, { messageMode });
	}

	// -------
	// Failure
	// -------

	async _failureRoll() {
		let failureRoll = await new Roll("1d6").evaluate();

		const chatContentMessage = await this.renderChatCard("failure-roll", {
			title: game.i18n.localize("CTHULHUDARK.FailureRoll"),
			dice: [this.getDieForOutput(failureRoll.result, CONFIG.CTHULHUDARK.BaseColor)],
			message: game.i18n.localize("CTHULHUDARK.FailureRollContent"),
		});
		const user = game.user.id;
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });
		const messageMode = game.settings.get("core", "messageMode");

		ChatMessage.create({
			author: user,
			speaker: speaker,
			rolls: [failureRoll],
			content: chatContentMessage,
			flags: { cthulhudark: { chatID: "cthulhudark" } },
		}, { messageMode });
	}
}
