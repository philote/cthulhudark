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
			onEditImage: this._onEditImage,
			roll: this._onRoll,
		},
		form: {
			submitOnChange: true,
		},
	};

	// remove - title: "CTHULHUDARK.ActorSheet",
	/*
      tabs: [
      {
        navSelector: ".sheet-tabs",
        contentSelector: ".sheet-body",
        initial: "rules",
      },
    ],
  */

	// /** @inheritdoc */
	// static TABS = {
	// 	primary: {
	// 		tabs: [{ id: "rules" }, { id: "notes" }],
	// 		initial: "rules",
	// 		//   labelPrefix: "DRAW_STEEL.Actor.Tabs",
	// 	},
	// };

	/** @override */
	static PARTS = {
		character: {
			template: 'systems/cthulhudark/templates/actor/actor-character-sheet.hbs',
			scrollable: [""],
		},
		npc: {
			template: 'systems/cthulhudark/templates/actor/actor-npc-sheet.hbs',
			scrollable: [""],
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
				options.parts = ["character"];
				break;
			case "npc":
				options.parts = ["npc"];
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
			// TODO:  tabs: this._getTabs(options.parts),
			// Necessary for formInput and formFields helpers
			fields: this.document.schema.fields,
			systemFields: this.document.system.schema.fields,
		};

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

	/* -------------------------------------------- */

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
					this.asyncCDMoveDialog({ move });
					return;
				}
				case "insight": {
					// Insight
					this.insightRoll();
					return;
				}
				case "failure": {
					// Failure
					this.failureRoll();
					return;
				}
				case "toggleInsight": {
					this._onToggleInsight(dataset.pos);
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
					this.asyncCDMoveDialog({ move });
					return;
				}
			}
		}
	}

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

	_onToggleInsight(pos) {
		let currentArray = this.actor.system.insight.states;
		let currentState = currentArray[pos];
		let newState = 0;

		if (currentState === false) {
			newState = true;
		} else {
			newState = false;
		}

		currentArray[pos] = newState;
		this.actor.update({ ["system.insight.states"]: currentArray });
	}

	_onClearInsight() {
		let currentArray = this.actor.system.insight.states;
		for (const i in currentArray) {
			if (currentArray[i] === true) {
				currentArray[i] = false;
			}
		}

		this.actor.update({ ["system.insight.states"]: currentArray });
	}

	_increaseInsightByOne() {
		let newInsight = duplicate(this.actor.system.insight.value);

		if (newInsight < 6) {
			let currentArray = this.actor.system.insight.states;
			const firstPos = currentArray.indexOf(false);
			if (firstPos != -1) {
				currentArray[firstPos] = true;
				this.actor.update({ ["system.insight.states"]: currentArray });
			}
		}

		this.actor.update({ "system.insight.value": newInsight });
	}

	// ---------------------------
	// From my macro rolling files
	// ---------------------------

	getWordInsightWithFormatting() {
		return `<b style="color: ${
			CONFIG.CTHULHUDARK.RiskColor
		}"><i>${game.i18n.localize("CTHULHUDARK.Insight")}</i></b>`;
	}

	getWordInsightRollWithFormatting() {
		return `<b style="color: ${
			CONFIG.CTHULHUDARK.RiskColor
		}"><i>${game.i18n.localize("CTHULHUDARK.InsightRoll")}</i></b>`;
	}

	getRiskMoveMessage() {
		return `
        <hr>
        <div style="font-size: 18px">
          <b>${game.i18n.format("CTHULHUDARK.RiskMoveMessage", {
											insightroll: this.getWordInsightRollWithFormatting(),
										})}</b>
        <div>
    `;
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
		loadTemplates([template_file]);
		const template_data = {
			dialogTitle: dialogTitleDesc,
			riskColor: CONFIG.CTHULHUDARK.RiskColor,
		};
		const rendered_html = await renderTemplate(template_file, template_data);
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
						return `<span style="color:#ff0000">ERROR(getMaxDieMessage.1)</span>`;
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
						return `<span style="color:#ff0000">ERROR(getMaxDieMessage.2)</span>`;
					}
				}
		}
	}

	chatContent(moveNumber, diceOutput, maxDieNumber, riskMessage) {
		const moveName = this.dialogTitle(moveNumber);
		return `
      <p><span style="font-size: 1.5em;"><b>${moveName}</b>: </span>${diceOutput}</p>
      <hr>
      <p>${this.getMaxDieMessage(moveNumber, maxDieNumber)}</p>
      ${riskMessage}
    `;
	}

	getDiceForOutput(dieNumber, colorHex) {
		switch (dieNumber) {
			case "1":
				return `<i class="fas fa-dice-one" style="color:${colorHex}; font-size: 2em;"></i>`;
			case "2":
				return `<i class="fas fa-dice-two" style="color:${colorHex}; font-size: 2em;"></i>`;
			case "3":
				return `<i class="fas fa-dice-three" style="color:${colorHex}; font-size: 2em;"></i>`;
			case "4":
				return `<i class="fas fa-dice-four" style="color:${colorHex}; font-size: 2em;"></i>`;
			case "5":
				return `<i class="fas fa-dice-five" style="color:${colorHex}; font-size: 2em;"></i>`;
			case "6":
				return `<i class="fas fa-dice-six" style="color:${colorHex}; font-size: 2em;"></i>`;
			default:
				console.error("Error in the getDiceForOutput, bad die number used.");
		}
	}

	async asyncCDMoveDialog({ move = 0 } = {}) {
		return await new Promise(async (resolve) => {
			new Dialog(
				{
					title: this.dialogTitle(move),
					content: await this.dialogContent(move),
					buttons: {
						button1: {
							icon: '<i class="fa-solid fa-dice"></i>',
							label: game.i18n.localize("CTHULHUDARK.Roll"),
							callback: async (html) => {
								// get and roll selected dice
								const dice = [];
								// Using native DOM methods to check if checkboxes are checked
								const humanDieEl = document.getElementById("humanDie");
								const occupationalDieEl = document.getElementById("occupationalDie");
								const insightDieEl = document.getElementById("insightDie");

								if (humanDieEl?.checked) {
									let hdRoll = await new Roll("1d6").evaluate({ async: true });
									dice.push({
										dieColor: CONFIG.CTHULHUDARK.BaseColor,
										isRisk: false,
										rollVal: hdRoll.result,
										roll: hdRoll,
									});
								}

								if (occupationalDieEl?.checked) {
									let odRoll = await new Roll("1d6").evaluate({ async: true });
									dice.push({
										dieColor: CONFIG.CTHULHUDARK.BaseColor,
										isRisk: false,
										rollVal: odRoll.result,
										roll: odRoll,
									});
								}

								if (insightDieEl?.checked) {
									let idRoll = await new Roll("1d6").evaluate({ async: true });
									dice.push({
										dieColor: CONFIG.CTHULHUDARK.RiskColor,
										isRisk: true,
										rollVal: idRoll.result,
										roll: idRoll,
									});
								}

								const maxDie = dice.reduce((a, b) => (a.rollVal > b.rollVal ? a : b));

								// Determine if the risk die won
								let isRiskDie = false;
								dice.every((die) => {
									if (die.rollVal == maxDie.rollVal && die.isRisk) {
										isRiskDie = true;
										return false;
									}
									return true;
								});

								let riskMessage = "";
								if (isRiskDie) {
									riskMessage = this.getRiskMoveMessage();
								}

								// Build Dice list
								let diceOutput = "";
								dice.forEach((die) => {
									diceOutput = diceOutput.concat(
										this.getDiceForOutput(die.rollVal, die.dieColor),
										" "
									);
								});

								// Initialize chat data.
								const chatContentMessage = this.chatContent(
									move,
									diceOutput,
									maxDie.rollVal,
									riskMessage
								);
								const user = game.user.id;
								const speaker = ChatMessage.getSpeaker({ actor: this.actor });
								const rollMode = game.settings.get("core", "rollMode");

								ChatMessage.create({
									user: user,
									type: CONST.CHAT_MESSAGE_TYPES.ROLL,
									rolls: dice.map((die) => {
										// If "Dice So Nice!" is installed, this configuration will trigger a visual
										// dice roll with appropriate standard and insight colored dice
										if (game.dice3d) {
											if (die.isRisk) {
												die.roll.dice[0].options.appearance = {
													colorset: "custom",
													foreground: "black",
													background: CONFIG.CTHULHUDARK.RiskColor,
												};
											} else {
												die.roll.dice[0].options.appearance = {
													colorset: "custom",
													foreground: "black",
													background: CONFIG.CTHULHUDARK.BaseColor,
												};
											}
										}

										return die.roll;
									}),
									speaker: speaker,
									rollMode: rollMode,
									content: chatContentMessage,
									flags: { cthulhudark: { chatID: "cthulhudark" } },
								});

								// ----
								resolve(null);
							},
						},
					},
					close: () => {
						resolve(null);
					},
				},
				{
					// THIS ADDS A CLASS TO THE WINDOW
					classes: ["cd-roll-dialog"],
				}
			).render(true);
		});
	}

	// -------
	// Insight
	// -------

	insightChatContent(diceOutput, previousInsight, newInsight) {
		let insightMessage = `<p><span style="font-size: 1.5em;">${this.getWordInsightRollWithFormatting()}: </span>${diceOutput}</p><hr>`;

		if (newInsight > previousInsight) {
			switch (newInsight) {
				case 1:
				case 2:
				case 3:
				case 4:
					return insightMessage.concat(
						game.i18n.format("CTHULHUDARK.InsightChatContent4", {
							insight: this.getWordInsightWithFormatting(),
							previousinsight: previousInsight,
							newnsight: newInsight,
						})
					);
				case 5:
					return insightMessage.concat(
						game.i18n.format("CTHULHUDARK.InsightChatContent5", {
							insight: this.getWordInsightWithFormatting(),
							previousinsight: previousInsight,
							newnsight: newInsight,
							insighttwo: this.getWordInsightWithFormatting(),
						})
					);
				case 6:
					return insightMessage.concat(
						game.i18n.format("CTHULHUDARK.InsightChatContent6", {
							insight: this.getWordInsightWithFormatting(),
							previousinsight: previousInsight,
							newnsight: newInsight,
						})
					);
				default: {
					console.error("Error in the insightChatContent, bad dice numbers used.");
					return insightMessage;
				}
			}
		} else {
			return insightMessage.concat(
				game.i18n.format("CTHULHUDARK.InsightChatContent", {
					insight: this.getWordInsightWithFormatting(),
					previousinsight: previousInsight,
				})
			);
		}
	}

	async insightRoll() {
		let insightRoll = await new Roll("1d6").evaluate({ async: true });
		let currentInsightVal = duplicate(this.actor.system.insight.value);

		let newInsightVal = currentInsightVal;

		if (insightRoll.result > currentInsightVal) {
			++newInsightVal;
			this._increaseInsightByOne();
		}

		const chatContentMessage = this.insightChatContent(
			this.getDiceForOutput(insightRoll.result, CONFIG.CTHULHUDARK.RiskColor),
			currentInsightVal,
			newInsightVal
		);
		const user = game.user.id;
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });
		const rollMode = game.settings.get("core", "rollMode");

		// If "Dice So Nice!" is installed, this data will cause it to roll a
		// visual die with the insight theme colors
		insightRoll.dice[0].options.appearance = {
			colorset: "custom",
			foreground: "black",
			background: CONFIG.CTHULHUDARK.RiskColor,
		};

		ChatMessage.create({
			user: user,
			speaker: speaker,
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			rolls: [insightRoll],
			rollMode: rollMode,
			content: chatContentMessage,
			flags: { cthulhudark: { chatID: "cthulhudark" } },
		});
	}

	// -------
	// Failure
	// -------

	failureChatContent(diceOutput) {
		return `
        <p><span style="font-size: 1.5em;">${game.i18n.localize(
									"CTHULHUDARK.FailureRoll"
								)} </span> ${diceOutput}</p>
        <hr>
        ${game.i18n.localize("CTHULHUDARK.FailureRollContent")}
    `;
	}

	async failureRoll() {
		let failureRoll = await new Roll("1d6").evaluate({ async: true });

		const chatContentMessage = this.failureChatContent(
			this.getDiceForOutput(failureRoll.result, CONFIG.CTHULHUDARK.BaseColor)
		);
		const user = game.user.id;
		const speaker = ChatMessage.getSpeaker({ actor: this.actor });
		const rollMode = game.settings.get("core", "rollMode");

		// If "Dice So Nice!" is installed, this data will cause it to roll a
		// visual die with the insight theme colors
		failureRoll.dice[0].options.appearance = {
			colorset: "custom",
			foreground: "black",
			background: CONFIG.CTHULHUDARK.BaseColor,
		};

		ChatMessage.create({
			user: user,
			speaker: speaker,
			type: CONST.CHAT_MESSAGE_TYPES.ROLL,
			rolls: [failureRoll],
			rollMode: rollMode,
			content: chatContentMessage,
			flags: { cthulhudark: { chatID: "cthulhudark" } },
		});
	}
}
