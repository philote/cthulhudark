/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

export class CthulhuDarkActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cthulhudark", "sheet", "actor"],
      width: 310,
      height: 820,
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "rules",
        },
      ],
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

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Rollable.
    html.find(".rollable").click(this._onRoll.bind(this));
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
        case "toggle-insight": {
          this._onToggleInsight(dataset.pos);
          return;
        }
        case "clear-insight": {
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
        dialogTitleDesc = game.i18n.localize(
          "CTHULHUDARK.InvestigateDialogDesc"
        );
        break;
      case 2: // Do Something Else
      default:
        dialogTitleDesc = game.i18n.localize(
          "CTHULHUDARK.DoSomethingElseDialogDesc"
        );
    }

    const template_file =
      "systems/cthulhudark/templates/dialog/roll-content-template.html";
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
            return game.i18n.localize(
              "CTHULHUDARK.InvestigateMaxDieMessage123"
            );
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
            return game.i18n.localize(
              "CTHULHUDARK.DoSomethingElseMaxDieMessage123"
            );
          case "4":
            return game.i18n.localize(
              "CTHULHUDARK.DoSomethingElseMaxDieMessage4"
            );
          case "5":
            return game.i18n.localize(
              "CTHULHUDARK.DoSomethingElseMaxDieMessage5"
            );
          case "6":
            return game.i18n.format(
              "CTHULHUDARK.DoSomethingElseMaxDieMessage6",
              { insightroll: this.getWordInsightRollWithFormatting() }
            );
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
      new Dialog({
        title: this.dialogTitle(move),
        content: await this.dialogContent(move),
        buttons: {
          button1: {
            icon: '<i class="fa-solid fa-dice"></i>',
            label: game.i18n.localize("CTHULHUDARK.Roll"),
            callback: async (html) => {
              // get and roll selected dice
              const dice = [];
              if (document.getElementById("humanDie").checked) {
                let hdRoll = await new Roll("1d6").evaluate({ async: true });
                dice.push({
                  dieColor: CONFIG.CTHULHUDARK.BaseColor,
                  isRisk: false,
                  rollVal: hdRoll.result,
                });
              }

              if (document.getElementById("occupationalDie").checked) {
                let odRoll = await new Roll("1d6").evaluate({ async: true });
                dice.push({
                  dieColor: CONFIG.CTHULHUDARK.BaseColor,
                  isRisk: false,
                  rollVal: odRoll.result,
                });
              }

              if (document.getElementById("insightDie").checked) {
                let idRoll = await new Roll("1d6").evaluate({ async: true });
                dice.push({
                  dieColor: CONFIG.CTHULHUDARK.RiskColor,
                  isRisk: true,
                  rollVal: idRoll.result,
                });
              }

              const maxDie = dice.reduce((a, b) =>
                a.rollVal > b.rollVal ? a : b
              );

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
                speaker: speaker,
                rollMode: rollMode,
                content: chatContentMessage,
              });

              // ----
              resolve(null);
            },
          },
        },
        close: () => {
          resolve(null);
        },
      }, {
        // THIS ADDS A CLASS TO THE WINDOW
        classes: ["cd-roll-dialog"],
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
          console.error(
            "Error in the insightChatContent, bad dice numbers used."
          );
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
      // update insight
      this.actor.system.insight.value = newInsightVal;
      this.actor.update({ "system.insight.value": newInsightVal });
    }

    const chatContentMessage = this.insightChatContent(
      this.getDiceForOutput(insightRoll.result, CONFIG.CTHULHUDARK.RiskColor),
      currentInsightVal,
      newInsightVal
    );
    const user = game.user.id;
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get("core", "rollMode");

    ChatMessage.create({
      user: user,
      speaker: speaker,
      rollMode: rollMode,
      content: chatContentMessage,
      flags: { cthulhudark: { chatID: "cthulhudark" }}
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

    ChatMessage.create({
      user: user,
      speaker: speaker,
      rollMode: rollMode,
      content: chatContentMessage,
    });
  }
}
