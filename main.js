/* eslint-disable no-empty */
"use strict";

/*
 * Created with @iobroker/create-adapter v2.0.1
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");

// Load your modules here, e.g.:
// const fs = require("fs");
let alexaState;
let checkBox;
let idTexttoCommand;
let timeout_1;
let timeout_2;
let timeout_3;
let idInstanze;


class AlexaShoppinglist extends utils.Adapter {

	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "alexa-shoppinglist",
		});
		this.on("ready", this.onReady.bind(this));
		// this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	async onReady() {

		this.setState("info.connection", false, true);

		// Variablen
		alexaState = this.config.shoppinglist;
		idTexttoCommand = this.config.device;
		checkBox = this.config.doNotMovetoInactiv;

		this.log.info("Checkbox: " + JSON.stringify(checkBox));


		const alexaStateArray = alexaState.split(".");
		idInstanze = {
			"adapter": alexaStateArray[0],
			"instanz": alexaStateArray[1],
			"channel_history": alexaStateArray[2],
			"list": alexaStateArray[3]
		};
		let list;
		if (alexaState != "") {
			list = idInstanze.list.replace("_", " ").toLowerCase().replace("list", " ");
		}

		this.log.info(idTexttoCommand);
		this.log.info(alexaState);


		const idAddapter = alexaState.slice(0, (alexaState.length - 5));

		const idSortActiv = `alexa-shoppinglist.${this.instance}.list_activ_sort`;
		const idSortInActiv = `alexa-shoppinglist.${this.instance}.list_inactiv_sort`;

		let sortListActiv = "1";
		let sortListInActiv = "1";
		let positionToShift = 0;
		let jsonActiv;
		let jsonInactiv;


		// States auslesen, damit beim ersten Start richtig sortiert wird
		const idSortActivState = await this.getStateAsync(idSortActiv);
		if (idSortActivState && idSortActivState.val && typeof (idSortActivState.val) == "string") {
			sortListActiv = idSortActivState.val;
		}
		// this.getState(idSortActiv,function(err, state){

		// 	if (state && state.val && typeof(state.val) == "string"){
		// 		sortListActiv = state.val;
		// 	}
		// });

		const idSortInActivState = await this.getStateAsync(idSortInActiv);
		if (idSortInActivState && idSortInActivState.val && typeof (idSortInActivState.val) == "string") {
			sortListInActiv = idSortInActivState.val;
		}
		// this.getState(idSortInActiv,(err, state)=>{
		// 	if (state && state.val && typeof(state.val) == "string"){
		// 		sortListInActiv = state.val;
		// 	}
		// });




		//Funktionen -----------


		/**General Function
		 * @param {string} sortListActiv
		 * @param {string} sortListInActiv
		 */
		const runfunction = async (sortListActiv, sortListInActiv) => {
			let alexaListJson;
			try {
				alexaListJson = await this.getForeignStateAsync(alexaState);


				if (alexaListJson && alexaListJson.val && typeof (alexaListJson.val) == "string") {

					const alexaList = JSON.parse(alexaListJson.val);

					jsonActiv = [];
					jsonInactiv = [];
					for (const element of alexaList) {
						if (element.completed == false) {
							jsonActiv.push({
								"name": firstLetterToUpperCase(element.value),
								"time": new Date(element.createdDateTime).toLocaleString(),
								"id": element.id
							});
						} else {
							jsonInactiv.push({
								"name": firstLetterToUpperCase(element.value),
								"time": new Date(element.createdDateTime).toLocaleString(),
								"id": element.id
							});
						}
					}


					jsonActiv = sortList(jsonActiv, sortListActiv);
					jsonInactiv = sortList(jsonInactiv, sortListInActiv);
					addPos(jsonActiv, "activ");
					addPos(jsonInactiv, "inactiv");
					writeState(jsonActiv, jsonInactiv);
				}
			} catch (e) {
				this.log.error(e);
			}

		};


		// ANCHOR firstLetterToUpperCase
		/**
		 * Ersetzt den ersten Buchstaben des eingegebenen Wortes durch den selbigen Großbuchstaben
		 * @param {string} name "w"ort wo der erste Buchstabe groß geschrieben werden soll
		 * @return {string} Rückgabewert mit "W"ort
		 */
		const firstLetterToUpperCase = (name) => {
			const firstLetter = name.slice(0, 1); // Ersten Buchstaben selektieren
			const leftoverLetters = name.slice(1); // Restliche Buchstaben selektieren
			name = firstLetter.toUpperCase() + leftoverLetters; // Erster Buchstabe in Groß + Rest

			return name;
		};

		// ANCHOR shift Position
		/**
		 * Einzelne Elemente verschieben
		 *
		 * @param {number} pos Die Position die verschoben werden soll
		 * @param {any} array Array, in welchem der Artikel sich befindet
		 * @param {string} direction In welche Richtung soll verschoben werden
		 */
		const shiftPosition = (pos, array, direction) => {
			for (const element of array) {
				if (pos == element.pos) {
					if (direction == "toActiv") {

						this.setForeignStateAsync(idAddapter + ".items." + element.id + ".completed", false, false);
						timeout_2 = setTimeout(() => {
							this.setState(`alexa-shoppinglist.${this.instance}.position_to_shift`, 0, true);
						}, 1000);

					} else {

						this.setForeignStateAsync(idAddapter + ".items." + element.id + ".completed", true, false);
						timeout_3 = setTimeout(() => {
							this.setState(`alexa-shoppinglist.${this.instance}.position_to_shift`, 0, true);
						}, 1000);
					}
				}
			}
		};

		// ANCHOR deleteList
		/**
		 * Komplette Listen leeren
		 *
		 * @param {any} array Array, welches bearbeitet werden soll
		 * @param {*} direction Soll zu Inaktiv geschoben werden "toInActiv", oder komplett löschen "delete"
		 */
		const deleteList = async (array, direction) => {
			// this.log.debug(JSON.stringify(array));
			for (const element of array) {
				try {
					if (direction == "toInActiv") {

						this.setForeignStateAsync(idAddapter + ".items." + element.id + ".completed", true, false);
					} else if (direction == "delete") {

						// }
						await this.setForeignStateAsync(idAddapter + ".items." + element.id + ".#delete", true, false);
						// this.log.info(JSON.stringify(element.id) + " deleted");
					}
				}
				catch (e) { }

			}

		};

		// ANCHOR addPosition
		/**
		 * Fügt einen Artikel zur Liste hinzu
		 * @param {string} element
		 */
		const addPosition = (element) => {
			this.getForeignStateAsync(idTexttoCommand, (err, obj) => {
				if (err || obj == "") {
					this.log.info("State not found! Please check the ID!");
				} else {
					try {
						this.setForeignStateAsync(idTexttoCommand, `${element} zur ${list} liste`, false);
						timeout_1 = setTimeout(() => {
							this.setStateAsync(`alexa-shoppinglist.${this.instance}.add_position`, "", false);
						}, 2000);

					} catch (e) {
						this.log.error(e);
					}

				}
			});


		};

		// ANCHOR Sort List
		/**
		 * Sort List
		 * @param {string} kindOfSort
		 *
		 */
		const sortList = (array, kindOfSort) => {

			let arraySort;
			if (kindOfSort == "1") {

				arraySort = array.sort((a, b) => { a.time - b.time; });
			} else {


				arraySort = array.sort((a, b) => {

					if (a.name > b.name) {
						return 1;
					}
					else if (a.name < b.name) {
						return -1;
					}
					return 0;
				});
			}
			return arraySort;

		};



		// ANCHOR AddPos
		/**
		 * Jeder Artikelposition eine Positionsnummer hinzufügen,
		 * @param {*} array Aktiv oder Inaktiv Array
		 * @param {string} list Aktiv oder inactiv as String
		 */
		const addPos = (array, list) => {
			let num = 0;
			// Button
			const symbolLink = "❌";
			const symbolMoveToInactiv = "↪";
			const symbolMoveToActiv = "↩";
			const farbeSchalterON = "green";

			for (const element of array) {
				// Positionsnummern eintragen
				num++;
				element.pos = num;

				// Button Delete
				const valButtonDelete = `alexa2.0.Lists.SHOPPING_LIST.items.${element.id}.#delete`;

				// Button Completed
				const valButtonMove = `alexa2.0.Lists.SHOPPING_LIST.items.${element.id}.completed`;

				// Der Button delete
				// eslint-disable-next-line no-useless-escape
				const val1JSON = "<button style\=\"border:none\; cursor\:pointer; background-color\:transparent\; color\:white\; font\-size\:1em\; text\-align:center\" value=\"toggle\" onclick=\"setOnDblClickCustomShop\(\'" + valButtonDelete + "," + true + "\')\">" + symbolLink + "</button> <font color=\"" + farbeSchalterON + "\">";
				if (list == "activ") {
					// eslint-disable-next-line no-useless-escape
					const val2JSON = "<button style\=\"border:none\; cursor\:pointer; background-color\:transparent\; color\:white\; font\-size\:1em\; text\-align:center\" value=\"toggle\" onclick=\"setOnDblClickCustomShop\(\'" + valButtonMove + "," + true + "\')\">" + symbolMoveToInactiv + "</button> <font color=\"" + farbeSchalterON + "\">";
					element.buttonmove = val2JSON;
				}
				if (list == "inactiv") {
					// eslint-disable-next-line no-useless-escape
					const val2JSON = "<button style\=\"border:none\; cursor\:pointer; background-color\:transparent\; color\:white\; font\-size\:1em\; text\-align:center\" value=\"toggle\" onclick=\"setOnDblClickCustomShop\(\'" + valButtonMove + "," + false + "\')\">" + symbolMoveToActiv + "</button> <font color=\"" + farbeSchalterON + "\">";
					element.buttonmove = val2JSON;
				}

				element.buttondelete = val1JSON;

			}
		};




		this.getForeignState(alexaState, (err, obj) => {
			if (err || obj == null) {
				this.log.error(`The State ${alexaState} was not found!`);


			} else {
				// Datenpunkt wurde gefunden
				this.log.info("Alexa State was found");
				this.setState("info.connection", true, true);
				// Hauptfunktion wird ausgeführt, wenn der State gefunden wird
				runfunction(sortListActiv, sortListInActiv);

			}

			// --------------------------------------------------------------------------------------------

			let valueOld = null;
			// ANCHOR onStateChange
			this.on("stateChange", async (id, state) => {
				if (state && state.val != valueOld) {
					valueOld = state.val;
					try {
						if (id == alexaState) {
							runfunction(sortListActiv, sortListInActiv).then(() => {
								//TODO
								if (checkBox && jsonInactiv[0]) {
									this.log.info("Inaktiven Artikel löschen");
									deleteListJsonInactiv(`alexa-shoppinglist.${this.instance}.delete_inactiv_list`);
								}
							});


						}

						// Auf Sortierungs Datenpunkt reagieren
						if (state && state.ack == false && typeof (state.val) == "string" && (id == idSortActiv || id == idSortInActiv)) {
							if (id == idSortActiv) {
								sortListActiv = state.val;
								this.log.info("Active Liste sortieren");
							}
							else {
								sortListInActiv = state.val;
								this.log.info("Inactive Liste sortieren");
							}

							this.log.info(sortListActiv);
							runfunction(sortListActiv, sortListInActiv);

							await this.setStateAsync(id, { ack: true });
						}

						// Position hinzufügen
						if (state && state.val && typeof (state.val) == "string" && id == `alexa-shoppinglist.${this.instance}.add_position` && state.ack == false) {
							addPosition(state.val);

							await this.setStateAsync(id, { ack: true });
						}

						// Inactiv Liste leeren, oder Grundsätzlich wenn Artikel von Activ gelöscht werden und Checkbox aktiv ist
						if ((state && state.val && typeof (state.val) == "boolean" && id == `alexa-shoppinglist.${this.instance}.delete_inactiv_list` && state.ack == false)) {

							deleteListJsonInactiv(id);

						}
						// Activ Liste leeren
						if (state && state.val && typeof (state.val) == "boolean" && id == `alexa-shoppinglist.${this.instance}.delete_activ_list` && state.ack == false) {
							this.log.info("Active List deleted");
							deleteList(jsonActiv, "toInActiv");

							await this.setStateAsync(id, { ack: true });
						}

						// Zu Inactiv Liste verschieben
						if (state && state.val && id == `alexa-shoppinglist.${this.instance}.to_inactiv_list` && state.ack == false) {
							this.log.info("Position to Inactive");
							shiftPosition(positionToShift, jsonActiv, "toInActiv");

							await this.setStateAsync(id, { ack: true });
						}

						// Zu Activ Liste verschieben
						if (state && state.val && typeof (state.val) == "boolean" && id == `alexa-shoppinglist.${this.instance}.to_activ_list` && state.ack == false) {
							this.log.info("Position to Active");
							shiftPosition(positionToShift, jsonInactiv, "toActiv");

							await this.setStateAsync(id, { ack: true });
						}
						// Position die verschoben werden soll
						if (state && state.val && typeof (state.val) == "number" && id == `alexa-shoppinglist.${this.instance}.position_to_shift` && state.ack == false) {
							this.log.info("Position");
							positionToShift = state.val;

							await this.setStateAsync(id, { ack: true });
						}



					}
					catch (e) {
						this.log.error(e);
					}
				}
			});

		});

		// ANCHOR deleteListJsonInactive

		const deleteListJsonInactiv = async (id) => {
			this.log.info("Inactive List deleted");
			deleteList(jsonInactiv, "delete");

			// Button ack setzen
			await this.setStateAsync(id, { ack: true });
		};



		// ANCHOR writeState
		/**
		 *
		 * @param {[]} arrayActiv
		 * @param {[]} arrayInactiv
		 */
		const writeState = (arrayActiv, arrayInactiv) => {
			this.setStateChanged(`alexa-shoppinglist.${this.instance}.list_activ`, JSON.stringify(arrayActiv), true);
			this.setStateChanged(`alexa-shoppinglist.${this.instance}.list_inactiv`, JSON.stringify(arrayInactiv), true);
		};


		// ANCHOR subscribeStates
		// Alexa2 State
		this.subscribeForeignStatesAsync(alexaState);

		// Adapter States
		this.subscribeStatesAsync(idSortActiv);
		this.subscribeStatesAsync(idSortInActiv);
		this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.add_position`);
		this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.to_activ_list`);
		this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.to_inactiv_list`);
		this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.delete_inactiv_list`);
		this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.delete_activ_list`);
		this.subscribeStatesAsync(`alexa-shoppinglist.${this.instance}.position_to_shift`);



		// You can also add a subscription for multiple states. The following line watches all states starting with "lights."
		// this.subscribeStates("lights.*");
		// Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
		// this.subscribeStates("*");

		/*
			setState examples
			you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		// await this.setStateAsync("testVariable", true);

		// // same thing, but the value is flagged "ack"
		// // ack should be always set to true if the value is received from or acknowledged from the target system
		// await this.setStateAsync("testVariable", { val: true, ack: true });

		// // same thing, but the state is deleted after 30s (getState will return null afterwards)
		// await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });


	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			clearTimeout(timeout_1);
			clearTimeout(timeout_2);
			clearTimeout(timeout_3);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			this.log.error(e);
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	// eslint-disable-next-line no-unused-vars
	onStateChange(id, state) {
		// if (state) {
		// 	// The state was changed
		// 	this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		// } else {
		// 	// The state was deleted
		// 	this.log.info(`state ${id} deleted`);
		// }
		// }

		// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
		// /**
		//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
		//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
		//  * @param {ioBroker.Message} obj
		//  */
		// this.onMessage(obj) {
		//  	if (typeof obj === "object" && obj.message) {
		//  		if (obj.command === "send") {
		//  			// e.g. send email or pushover or whatever
		//  			this.log.info("send command");

		// 		// Send response in callback if required
		// 		if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
		// 	}
		// }
	}

	async onMessage(obj) {
		// this.log.info("Test " + JSON.stringify(obj));
		if (obj) {
			// this.log.info("Test " + JSON.stringify(obj));
			switch (obj.command) {
				case "getDevices": {
					const devices = await this.getObjectViewAsync("system", "device", {
						startkey: `${obj.message.alexa}.Echo-Devices.`,
						endkey: `${obj.message.alexa}.Echo-Devices.\u9999`
					});
					const result = [];
					for (let i = 0; i < devices.rows.length; i++) {
						const a = devices.rows[i];
						if (a.value && a.value.common.name !== "Timer" && a.value.common.name !== "Reminder" && a.value.common.name !== "Alarm") {

							result.push({ "label": a.value.common.name, "value": `${a.id}.Commands.textCommand` });
						}
					}
					obj.callback && this.sendTo(obj.from, obj.command, result, obj.callback);
					break;
				}
				case "getShoppinglist": {
					const result = [];
					const lists = await this.getObjectViewAsync("system", "channel", {
						startkey: `${obj.message.alexa}.Lists.`,
						endkey: `${obj.message.alexa}.Lists.\u9999`
					});
					for (let i = 0; i < lists.rows.length; i++) {
						const a = lists.rows[i];
						if (a.value && a.id.split(".").length === 4) {
							result.push({ "label": `${a.value.common.name}`, "value": `${a.id}.json` });
						}
					}
					obj.callback && this.sendTo(obj.from, obj.command, result, obj.callback);
					break;
				}
			}
		}
	}

}

if (require.main !== module) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<utils.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new AlexaShoppinglist(options);
} else {
	// otherwise start the instance directly
	new AlexaShoppinglist();
}