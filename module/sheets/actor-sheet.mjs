/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

export class CthulhuDarkActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cthulhudark", "sheet", "actor"],
      template: "systems/cthulhudark/templates/actor/actor-sheet.html",
      width: 310,
      height: 820,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "rules" }]
    });
  }

  /** @override */
  get template() {
    return `systems/cthulhudark/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    // if (actorData.type == 'npc') {}

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Rollable.
    html.find('.rollable').click(this._onRoll.bind(this));
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle rolls.
    if (dataset.rollType) {
      switch (dataset.rollType) {
        case 'investigate': { // Investigate
          const title = this.dialogTitle(1);
          const content = this.dialogContent(1);
          const move = 1;
          this.asyncCDMoveDialog({ title, content, move });
          return;
        }
        case 'insight': { // Insight
          this.insightRoll();
          return;
        }
        case 'failure': { // Failure
          this.failureRoll();
          return;
        }
        case 'doSomethingElse':
        default: { // Do Something Else 2
          const title = this.dialogTitle(2);
          const content = this.dialogContent(2);
          const move = 2;
          this.asyncCDMoveDialog({ title, content, move });
          return;
        }
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  // ---------------------------  
  // From my macro rolling files
  // ---------------------------

  getWordInsightWithFormatting() {
    return `<b style="color: ${CONFIG.CTHULHUDARK.RiskColor}"><i>${game.i18n.localize("CTHULHUDARK.Insight")}</i></b>`;
  }

  getWordInsightRollWithFormatting() {
    return `<b style="color: ${CONFIG.CTHULHUDARK.RiskColor}"><i>${game.i18n.localize("CTHULHUDARK.InsightRoll")}</i></b>`;
  }

  getRiskMoveMessage() {
    return `
        <hr>
        <div style="font-size: 18px">
          <b>${game.i18n.format('CTHULHUDARK.RiskMoveMessage', { insightroll: this.getWordInsightRollWithFormatting() })}</b>
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

  dialogContent(moveNumber) {
    let dialogTitle = "";
    switch (moveNumber) {
        case 1: // Investigate
            dialogTitle = game.i18n.localize("CTHULHUDARK.InvestigateDialogDesc");
            break;
        case 2: // Do Something Else
        default:
            dialogTitle = game.i18n.localize("CTHULHUDARK.DoSomethingElseDialogDesc");
    }
    return `
            <p><b>${dialogTitle}</b></p>
            <form class="flexcol">
                <div class="form-group">
                    <input type="checkbox" id="humanDie" name="humanDie">
                    <label for="humanDie"><i class="fa-solid fa-dice-five"></i>&#8194;${game.i18n.localize("CTHULHUDARK.DialogHumanDie")}</label>
                </div>
                <div class="form-group">
                    <input type="checkbox" id="occupationalDie" name="occupationalDie">
                    <label for="occupationalDie"><i class="fa-solid fa-dice-five"></i>&#8194;${game.i18n.localize("CTHULHUDARK.DialogOccupDie")}</label>
                </div>
                <div class="form-group">
                    <input type="checkbox" id="insightDie" name="insightDie">
                    <label for="insightDie" style="color: ${CONFIG.CTHULHUDARK.RiskColor}"><i class="fa-solid fa-dice-five"></i>&#8194;<b>${game.i18n.localize("CTHULHUDARK.DialogRiskDie")}</b></label>
                </div>
            </form>
            </br>
        `;
  }

  getMaxDieMessage(moveNumber, maxDieNumber) {
    switch (moveNumber) {
        case 1: // Investigate
            {
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
                        return game.i18n.format('CTHULHUDARK.InvestigateMaxDieMessage6', {insightroll: this.getWordInsightRollWithFormatting()});
                    default: {
                        console.error("ERROR(getMaxDieMessage.1)");
                        return `<span style="color:#ff0000">ERROR(getMaxDieMessage.1)</span>`;
                    }
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
                    return game.i18n.format('CTHULHUDARK.DoSomethingElseMaxDieMessage6', {insightroll: this.getWordInsightRollWithFormatting()});
                default:{
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

  async asyncCDMoveDialog({
    title = "",
    content = "", 
    move = 0
  } = {}) {
    return await new Promise(async (resolve) => {
        new Dialog({
            title: title,
            content: content,
            buttons: {
                button1: {
                    icon: '<i class="fa-solid fa-dice"></i>',
                    label: "Roll!",
                    callback: async (html) => {
                        
                        // get and roll selected dice
                        const dice = [];
                        if (document.getElementById("humanDie").checked) {
                            let hdRoll = await new Roll('1d6').evaluate({ async: true });
                            dice.push({
                                dieColor: CONFIG.CTHULHUDARK.BaseColor,
                                isRisk: false,
                                rollVal: hdRoll.result
                            });
                        };

                        if (document.getElementById("occupationalDie").checked) {
                            let odRoll = await new Roll('1d6').evaluate({ async: true });
                            dice.push({
                                dieColor: CONFIG.CTHULHUDARK.BaseColor,
                                isRisk: false,
                                rollVal: odRoll.result
                            });
                        };

                        if (document.getElementById("insightDie").checked) {
                            let idRoll = await new Roll('1d6').evaluate({ async: true });
                            dice.push({
                                dieColor: CONFIG.CTHULHUDARK.RiskColor,
                                isRisk: true,
                                rollVal: idRoll.result
                            });
                        };

                        const maxDie = dice.reduce((a, b) => (a.rollVal > b.rollVal) ? a : b);
                        
                        // Determine if the risk die won
                        let isRiskDie = false;
                        dice.every(die => {
                          if ((die.rollVal == maxDie.rollVal) && die.isRisk) {
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
                        dice.forEach(die => {
                            diceOutput = diceOutput.concat(this.getDiceForOutput(die.rollVal, die.dieColor), " ");
                        });

                        // Initialize chat data.
                        const chatContentMessage = this.chatContent(move, diceOutput, maxDie.rollVal, riskMessage);
                        const user = game.user.id;
                        const speaker = ChatMessage.getSpeaker({ actor: this.actor });
                        const rollMode = game.settings.get('core', 'rollMode');

                        ChatMessage.create({
                          user: user,
                          speaker: speaker,
                          rollMode: rollMode,
                          content: chatContentMessage
                        });

                        // ----
                        resolve(null);
                    }
                }
            },
            close: () => {
                resolve(null);
            }
        }).render(true);
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
                return insightMessage.concat(game.i18n.format('CTHULHUDARK.InsightChatContent4', {insight: this.getWordInsightWithFormatting(), previousinsight: previousInsight, newnsight: newInsight}));
            case 5:
                return insightMessage.concat(game.i18n.format('CTHULHUDARK.InsightChatContent5', {insight: this.getWordInsightWithFormatting(), previousinsight: previousInsight, newnsight: newInsight, insighttwo: this.getWordInsightWithFormatting()}));
            case 6: 
                return insightMessage.concat(game.i18n.format('CTHULHUDARK.InsightChatContent6', {insight: this.getWordInsightWithFormatting(), previousinsight: previousInsight, newnsight: newInsight}));
            default: {
                console.error("Error in the insightChatContent, bad dice numbers used.");
                return insightMessage;
            }
        }
    } else {
        return insightMessage.concat(game.i18n.format('CTHULHUDARK.InsightChatContent', {insight: this.getWordInsightWithFormatting(), previousinsight: previousInsight}));
    }
  }

  async insightRoll() {
    let insightRoll = await new Roll('1d6').evaluate({ async: true });
    let currentInsightVal = duplicate(this.actor.system.insight.value);
    let newInsightVal = currentInsightVal;

    // console.log("insightRoll.result "+insightRoll.result);
    // console.log("currentInsightVal "+currentInsightVal);
    if (insightRoll.result > currentInsightVal) {
        ++newInsightVal;
        // update insight
        this.actor.system.insight.value = newInsightVal;
        this.actor.update({"system.insight.value": newInsightVal});
        
        // console.log("this.actor.system.insight.value "+this.actor.system.insight.value);
        // console.log("currentInsightVal "+currentInsightVal);
        // console.log("newInsightVal "+newInsightVal);
    }

    const chatContentMessage = this.insightChatContent(this.getDiceForOutput(insightRoll.result, CONFIG.CTHULHUDARK.RiskColor), currentInsightVal, newInsightVal);
    const user = game.user.id;
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');

    ChatMessage.create({
      user: user,
      speaker: speaker,
      rollMode: rollMode,
      content: chatContentMessage
    });
  }

  // -------
  // Failure
  // -------

  failureChatContent(diceOutput) {
    return `
        <p><span style="font-size: 1.5em;">${game.i18n.localize('CTHULHUDARK.FailureRoll')} </span> ${diceOutput}</p>
        <hr>
        ${game.i18n.localize('CTHULHUDARK.FailureRollContent')}
    `;
  }

  async failureRoll() {
    let failureRoll = await new Roll('1d6').evaluate({ async: true });

    const chatContentMessage = this.failureChatContent(this.getDiceForOutput(failureRoll.result, CONFIG.CTHULHUDARK.BaseColor));
    const user = game.user.id;
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');

    ChatMessage.create({
      user: user,
      speaker: speaker,
      rollMode: rollMode,
      content: chatContentMessage
    });
  }
}
