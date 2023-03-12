/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

const insightDieColor = "#2ba624";
const humanDieColor = "#000000";
const wordInsight = `<span style="color: ${insightDieColor}">Insight</span>`;
const riskMoveMessage = `
    <hr>
    <div style="font-size: 18px"><b>
        The situation reveals some horror behind the universe, make an <b><i>${wordInsight}</i></b> roll!
    <div>
`;

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

    // Rollable abilities.
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

    // Handle item rolls.
    if (dataset.rollType) {
      switch (dataset.rollType) {
        case 'investigate': { // Investigate
          const title = this.dialogTitle(1);
          const content = this.dialogContent(1);
          const move = 1;
          this.asyncCDMoveDialog({ title, content, move });
          return;
        }
        case 'compete': { // Compete 3
          const title = this.dialogTitle(3);
          const content = this.dialogContent(3);
          const move = 3;
          this.asyncCDMoveDialog({ title, content, move });
          return;
        }
        case 'cooperate': { // Cooperate 4
          const title = this.dialogTitle(4);
          const content = this.dialogContent(4);
          const move = 4;
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

  dialogTitle(moveNumber) {
    switch (moveNumber) {
        case 1:
            return `Investigate`;
        case 3:
            return `Compete`
        case 4:
            return `Cooperate`
        case 2:
        default:
            return `Do Something Else`;
    }
  }

  dialogContent(moveNumber) {
    switch (moveNumber) {
        case 1: // Investigate
            return `
                <p>
                    <b>When you investigate</b>, roll:
                </p>
                <form class="flexcol">
                    <div class="form-group">
                        <input type="checkbox" id="humanDie" name="humanDie">
                        <label for="humanDie"><i class="fa-solid fa-dice-five"></i>&#8194;If the task is within human capabilities.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="occupationalDie" name="occupationalDie">
                        <label for="occupationalDie"><i class="fa-solid fa-dice-five"></i>&#8194;If it’s within your occupational expertise.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="insightDie" name="insightDie">
                        <label for="insightDie" style="color: ${insightDieColor}"><i class="fa-solid fa-dice-five"></i>&#8194;<b>If you will risk your mind to succeed.</b></label>
                    </div>
                </form>
                </br>
            `;
        case 3: // Compete
            return `
                <p>
                    <b>To compete:</b> everyone who is competing rolls their dice. Whoever gets highest wins:
                </p>
                <form class="flexcol">
                    <div class="form-group">
                        <input type="checkbox" id="humanDie" name="humanDie">
                        <label for="humanDie"><i class="fa-solid fa-dice-five"></i>&#8194;If the task is within human capabilities.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="occupationalDie" name="occupationalDie">
                        <label for="occupationalDie"><i class="fa-solid fa-dice-five"></i>&#8194;If it’s within your occupational expertise.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="insightDie" name="insightDie">
                        <label for="insightDie" style="color: ${insightDieColor}"><i class="fa-solid fa-dice-five"></i>&#8194;<b>If you will risk your mind to succeed.</b></label>
                    </div>
                </form>
                </br>
            `;
        case 4: // Cooperate
            return `
                <p>
                    <b>To cooperate:</b> everyone who is cooperating rolls their dice. The highest die, rolled by anyone, determines the outcome:
                </p>
                <form class="flexcol">
                    <div class="form-group">
                        <input type="checkbox" id="humanDie" name="humanDie">
                        <label for="humanDie"><i class="fa-solid fa-dice-five"></i>&#8194;If the task is within human capabilities.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="occupationalDie" name="occupationalDie">
                        <label for="occupationalDie"><i class="fa-solid fa-dice-five"></i>&#8194;If it’s within your occupational expertise.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="insightDie" name="insightDie">
                        <label for="insightDie" style="color: ${insightDieColor}"><i class="fa-solid fa-dice-five"></i>&#8194;<b>If you will risk your mind to succeed.</b></label>
                    </div>
                </form>
                </br>
            `;
        case 2: // Do Something Else
        default:
            return `
                <p>
                    <b>When you do something other than investigating:
                </p>
                <form class="flexcol">
                    <div class="form-group">
                        <input type="checkbox" id="humanDie" name="humanDie">
                        <label for="humanDie"><i class="fa-solid fa-dice-five"></i>&#8194;If the task is within human capabilities.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="occupationalDie" name="occupationalDie">
                        <label for="occupationalDie"><i class="fa-solid fa-dice-five"></i>&#8194;If it’s within your occupational expertise.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="insightDie" name="insightDie">
                        <label for="insightDie" style="color: ${insightDieColor}"><i class="fa-solid fa-dice-five"></i>&#8194;<b>If you will risk your mind to succeed.</b></label>
                    </div>
                </form>
                </br>
            `;
    }
  }

  getMaxDieMessage(moveNumber, maxDieNumber) {
    switch (moveNumber) {
        case 1: // Investigate
            {
                switch (maxDieNumber) {
                    case "1":
                    case "2":
                    case "3":
                        return `You get the bare minimum: if you need information to proceed with the scenario, you get it, but that’s all you get`;
                    case "4":
                        return `You get whatever a competent investigator would discover.`;
                    case "5":
                        return `You discover everything humanly possible.`;
                    case "6":
                        return `You may glimpse beyond human knowledge (and probably make an <b><i>${wordInsight} Roll</i></b>).`;
                    default: {
                        console.error("ERROR(getMaxDieMessage.1)");
                        return `<span style="color:#ff0000">ERROR(getMaxDieMessage.1)</span>`;
                    }
                }
            }
        case 3:
        case 4:
            { // Compete & Cooperate
                return `Your highest roll was ${maxDieNumber}`;
            }
        case 2: // Do Something Else
        default:
            switch (maxDieNumber) {
                case "1":
                case "2":
                case "3":
                    return `You get the bare minimum: if you need information to proceed with the scenario, you get it, but that’s all you get`;
                case "4":
                    return `You succeed competently.`;
                case "5":
                    return `You succeed well and may get something extra.`;
                case "6":
                    return `You succeed brilliantly and get something extra, but maybe more than you wanted (and probably make an <b><i>${wordInsight} Roll</i></b>).`;
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
                                name: "Human Die",
                                dieColor: humanDieColor,
                                isRisk: false,
                                rollVal: hdRoll.result
                            });
                        };

                        if (document.getElementById("occupationalDie").checked) {
                            let odRoll = await new Roll('1d6').evaluate({ async: true });
                            dice.push({
                                name: "Occupational Die",
                                dieColor: humanDieColor,
                                isRisk: false,
                                rollVal: odRoll.result
                            });
                        };

                        if (document.getElementById("insightDie").checked) {
                            let idRoll = await new Roll('1d6').evaluate({ async: true });
                            dice.push({
                                name: "Insight Die",
                                dieColor: insightDieColor,
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
                            riskMessage = riskMoveMessage;
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
    let insightMessage = `<p><span style="font-size: 1.5em;"><b><i>${wordInsight}</i> Roll</b>: </span>${diceOutput}</p>
    <hr>
    `;

    if (newInsight > previousInsight) {
        switch (newInsight) {
            case 1:
            case 2:
            case 3:
            case 4: 
                return insightMessage.concat(`Your previous <b><i>${wordInsight}</i></b> was <b>${previousInsight}</b>. You rolled higher, so your insight is now  <b>${newInsight}</b>. Roleplay your fear.`);
            case 5: 
                return insightMessage.concat(`Your previous <b><i>${wordInsight}</i></b> was <b>${previousInsight}</b>. You rolled higher, so your insight is now  <b>${newInsight}</b>. Roleplay your fear. <hr><b><i>Note:</i></b> You may now reduce your <b><i>${wordInsight}</i></b> by suppressing Mythos knowledge.`);
            case 6: 
                return insightMessage.concat(`Your previous <b><i>${wordInsight}</i></b> was <b>${previousInsight}</b>. You rolled higher, so your insight is now  <b>${newInsight}</b>. <hr><b style="color:#bf0000;"><i>You go incurably insane.</i></b> This is a special moment: everyone focusses on your character’s last moments as their mind breaks. Go out however you want: fight, scream, run or collapse.`);
            default: {
                console.error("Error in the insightChatContent, bad dice numbers used.");
                return insightMessage;
            }
        }
    } else {
        return insightMessage.concat(`Your current <b><i>${wordInsight}</i></b> is <b>${previousInsight}</b>. You keep it together, just barely...`);
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
        
        console.log("this.actor.system.insight.value "+this.actor.system.insight.value);
        console.log("currentInsightVal "+currentInsightVal);
        console.log("newInsightVal "+newInsightVal);
    }

    const chatContentMessage = this.insightChatContent(this.getDiceForOutput(insightRoll.result, insightDieColor), currentInsightVal, newInsightVal);
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
        <p><span style="font-size: 1.5em;"><b>Failure Roll</b>: </span> ${diceOutput}</p>
        <hr>
        <span>If your roll is higher than the other <b><i>Investigator's</i></b> highest die, they fail, just as you described. If not, they succeed as before.</span>
    `;
  }

  async failureRoll() {
    let failureRoll = await new Roll('1d6').evaluate({ async: true });

    const chatContentMessage = this.failureChatContent(this.getDiceForOutput(failureRoll.result, humanDieColor));
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
