/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */

const riskDieColor = "#bf0000";
const humanDieColor = "#000000";
const wordRisk = `<span style="color: ${riskDieColor}">Insight</span>`;
const riskMoveMessage = `
    <hr>
    <div style="font-size: 18px"><b>
        The situation reveals some horror behind the universe, make an <b><i>${wordRisk}</i></b> roll!
    <div>
`;
const insightDieColor = "#A62424";
const insightTitle = "Insight Roll";
const insightMessage = "If you rolled higher than your Insight, add 1 to your Insight and roleplay your fear."


export class CthulhuDarkActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["cthulhudark", "sheet", "actor"],
      template: "systems/cthulhudark/templates/actor/actor-sheet.html",
      width: 300,
      height: 800,
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
          this.asyncDialog({ title, content, move });
          return;
        }
        case 'compete': { // Compete 3
          const title = this.dialogTitle(3);
          const content = this.dialogContent(3);
          const move = 3;
          this.asyncDialog({ title, content, move });
          return;
        }
        case 'cooperate': { // Cooperate 4
          const title = this.dialogTitle(4);
          const content = this.dialogContent(4);
          const move = 4;
          this.asyncDialog({ title, content, move });
          return;
        }
        case 'insight': { // Insight
          this.insightRoll();
          return;
        }
        case 'doSomethingElse':
        default: { // Do Something Else 2
          const title = this.dialogTitle(2);
          const content = this.dialogContent(2);
          const move = 2;
          this.asyncDialog({ title, content, move });
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
                    <b>When you want to ask a question about someone, something or somewhere, or want Control to reveal something about the situation</b>, roll:
                </p>
                <form class="flexcol">
                    <div class="form-group">
                        <input type="checkbox" id="humanDie" name="humanDie">
                        <label for="humanDie">One die if what you’re doing is within human capabilities.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="occupationalDie" name="occupationalDie">
                        <label for="occupationalDie">One die if it’s within your occupational expertise.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="insightDie" name="insightDie">
                        <label for="insightDie" style="color:#bf0000;">If you will risk your mind to succeed.</label>
                    </div>
                </form>
                </br>
            `;
        case 3: // Compete
            return `
                <p>
                    <b>When you are competing with another player, everyone who is competing rolls their dice. The highest die wins:
                </p>
                <form class="flexcol">
                    <div class="form-group">
                        <input type="checkbox" id="humanDie" name="humanDie">
                        <label for="humanDie">One die if what you’re doing is within human capabilities.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="occupationalDie" name="occupationalDie">
                        <label for="occupationalDie">One die if it’s within your occupational expertise.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="insightDie" name="insightDie">
                        <label for="insightDie" style="color:#bf0000;">If you will risk your mind to succeed.</label>
                    </div>
                </form>
                </br>
            `;
        case 4: // Cooperate
            return `
                <p>
                    <b>When you are cooperating with another player, everyone who is cooperating rolls their dice. Take the highest die, rolled by anyone, as the result:
                </p>
                <form class="flexcol">
                    <div class="form-group">
                        <input type="checkbox" id="humanDie" name="humanDie">
                        <label for="humanDie">One die if what you’re doing is within human capabilities.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="occupationalDie" name="occupationalDie">
                        <label for="occupationalDie">One die if it’s within your occupational expertise.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="insightDie" name="insightDie">
                        <label for="insightDie" style="color:#bf0000;">If you will risk your mind to succeed.</label>
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
                        <label for="humanDie">One die if what you’re doing is within human capabilities.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="occupationalDie" name="occupationalDie">
                        <label for="occupationalDie">One die if it’s within your occupational expertise.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="insightDie" name="insightDie">
                        <label for="insightDie" style="color:#bf0000;">If you will risk your mind to succeed.</label>
                    </div>
                </form>
                </br>
            `;
    }
  }

  getMaxDieMessage(moveNumber, maxDieNumber) {
    // console.log(`moveNumber: ${moveNumber}, maxDieNumber: ${maxDieNumber}`)
    switch (moveNumber) {
        case 1: // Investigate
            {
                switch (maxDieNumber) {
                    case "1":
                    case "2":
                    case "3":
                        return `You get the bare minimum: if you need information to proceed, you get it, but that’s all.`;
                    case "4":
                        return `You get everything a competent investigator would discover.`;
                    case "5":
                        return `You discover everything a competent investigator would discover, plus something more. For example, you might also remember a related folktale, rumour or scientific experiment.`;
                    case "6":
                        return `You discover all of that, plus, in some way, you glimpse beyond human knowledge. This probably means you see something horrific and make an <b><i>${wordRisk} Roll</i></b>.`;
                    default:
                        return `<span style="color:#ff0000">ERROR(getMaxDieMessage.1)</span>`;
                }
            }
        case 3:
        case 4:
            { // Compete & Cooperate
                return `your highest roll was ${maxDieNumber}`;
            }
        case 2: // Do Something Else
        default:
            switch (maxDieNumber) {
                case "1":
                case "2":
                case "3":
                    return `You barely succeed, getting the bare minimum to proceed.`;
                case "4":
                    return `You succeed competently.`;
                case "5":
                    return `You succeed well and may get something extra.`;
                case "6":
                    return `You succeed brilliantly and get something extra, but maybe more than you wanted.`;
                default:
                    return `<span style="color:#ff0000">ERROR(getMaxDieMessage.2)</span>`;
            }
    }
  }

  chatContent(moveNumber, diceOutput, maxDieNumber, riskMessage) {
    const moveName = this.dialogTitle(moveNumber);
    return `
        <p style="font-size: 1.5em;"><b>${moveName}</b> Result:</p>
        <p>${diceOutput}</p>
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

  async asyncDialog({
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
                                dieColor: riskDieColor,
                                isRisk: true,
                                rollVal: idRoll.result
                            });
                        };

                        let diceOutput = ""

                        // TODO add the risk die logic and change it wher risk has to be higher than all other die
                        const maxDie = dice.reduce((a, b) => (a.rollVal > b.rollVal) ? a : b);

                        let riskMessage = "";
                        if (maxDie.isRisk) {
                            riskMessage = riskMoveMessage;
                        }


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

  insightChatContent(diceOutput) {
    return `
        <p><span style="font-size: 1.5em;"><b>${insightTitle}</b> Result: </span> ${diceOutput}</p>
        <hr>
        <span style="font-size: 1.2em;">${insightMessage}</span>
    `;
  }

  async insightRoll() {
    const dice = [];

    let hdRoll = new Roll('1d6').evaluate({ async: true });
    dice.push({
        name: "Base Die",
        dieColor: insightDieColor,
        isStress: false,
        rollVal: hdRoll.result
    });

    let diceOutput = "";

    const maxDieValue = dice.reduce((a, b) => (a.rollVal > b.rollVal) ? a : b).rollVal;
    const setOfMaxDice = dice.filter(obj => {
        return obj.rollVal === maxDieValue
    });

    let maxDie = setOfMaxDice[0];

    console.log("maxDie.name "+maxDie.name);
    console.log("maxDie.rollVal "+maxDie.rollVal);

    const maxDieModified = parseInt(maxDie.rollVal);
    console.log("maxDieModified "+maxDieModified);
    console.log("maxDieModified "+maxDieModified);


    dice.forEach(die => {
        diceOutput = diceOutput.concat(this.getDiceForOutput(die.rollVal, die.dieColor), " ");
    });
    const chatContentMessage = this.insightChatContent(diceOutput);
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
