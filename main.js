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
let idTexttoCommand;
let timeout_1;
let timeout_2;
let timeout_3;

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
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}
	async onReady() {
		
		this.setState("info.connection", false, true);

		// Variablen
		alexaState = this.config.alexastate;
		idTexttoCommand = this.config.alexaIdTextToCommand;
		
		let idAddapter = alexaState.slice(0, (alexaState.length - 5))
		
		let idSortActiv ="alexa-shoppinglist.0.shoppingliste_activ_sort";
		let idSortInActiv ="alexa-shoppinglist.0.shoppingliste_inactiv_sort";
		
		let sortListActiv ="time";
		let sortListInActiv ="time";
		let positionToShift = 0;
		let jsonActiv;
		let jsonInactiv;
		
		
		// States auslesen, damit beim ersten Start richtig sortiert wird
		this.getState(idSortActiv,function(err, state){
			
			if (state && state.val && typeof(state.val) == "string"){				
				sortListActiv = state.val
			}		
		})

		this.getState(idSortInActiv,(err, state)=>{			
			if (state && state.val && typeof(state.val) == "string"){				
				sortListInActiv = state.val
			}		
		})
		
		
		
		
		//Funktionen -----------
		/**General Function
		 * @param {string} sortListActiv 
		 * @param {string} sortListInActiv 
		 */
		const runfunction = async (sortListActiv,sortListInActiv)=>{
			let alexaListJson
			try {
				alexaListJson = await this.getForeignStateAsync(alexaState);	
				
			
				if (alexaListJson && alexaListJson.val && typeof(alexaListJson.val) == "string"){
				
				let alexaList = JSON.parse(alexaListJson.val);
				
				jsonActiv = [];
				jsonInactiv = [];
				for(let element of alexaList){
				 	if (element.completed == false){
				 		jsonActiv.push({
				 		"name": firstLetterToUpperCase(element.value),
				 		"time": new Date(element.createdDateTime).toLocaleString(),
				 		"id": element.id});
				 	}else{
				 		jsonInactiv.push({
				 		"name": firstLetterToUpperCase(element.value),
				 		"time": new Date(element.createdDateTime).toLocaleString(),
				 		"id": element.id
				 		});
				 	}
				}
		
		
				sortList(jsonActiv, sortListActiv);
				sortList(jsonInactiv, sortListInActiv);
				addPos(jsonActiv);
				addPos(jsonInactiv);
				writeState(jsonActiv, jsonInactiv);	
			}	
			}catch(e){

			}
			}
	
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
		/**
		 * Einzelne Elemente verschieben
		 * 
		 * @param {number} pos Die Position die verschoben werden soll
		 * @param {any} array Array, in welchem der Artikel sich befindet
		 * @param {string} direction In welche Richtung soll verschoben werden
		 */
		const shiftPosition = (pos, array, direction) =>{
			for(let element of array){
				if (pos == element.pos){
					if(direction == "toActiv"){
						
						this.setForeignStateAsync(idAddapter + ".items." + element.id + ".completed", false, false)
						timeout_2 =	setTimeout(() => {
							this.setState("alexa-shoppinglist.0.position_to_shift", 0 ,true)
						}, 1000);
						
					}else{
						
						this.setForeignStateAsync(idAddapter + ".items." + element.id + ".completed", true, false)
						timeout_3 =	setTimeout(() => {
							this.setState("alexa-shoppinglist.0.position_to_shift", 0 ,true)
						}, 1000);
					}
				}
			}
		}


		/**
		 * Komplette Listen leeren
		 * 
		 * @param {any} array Array, welches bearbeitet werden soll
		 * @param {*} direction Soll zu Inaktiv geschoben werden "toInActiv", oder komplett löschen "delete"
		 */
		const deleteList = (array, direction)=>{
			for (let element of array){
				if (direction == "toInActiv"){
					
					this.setForeignStateAsync(idAddapter + ".items." + element.id + ".completed", true, false)
				}else if (direction == "delete"){
					
					this.setForeignStateAsync(idAddapter + ".items." + element.id + ".#delete", true, false)
				}
			}
			
		};
		/**
		 * 
		 * @param {string} element 
		 */
		const addPosition = (element) =>{
			this.getForeignStateAsync(idTexttoCommand, (err, obj)=>{
				if (err || obj == ""){
					this.log.info("State not found! Please check the ID!")
				}else {
					try{
					this.setForeignStateAsync(idTexttoCommand,`${element} zur Einkaufsliste` , false)
					timeout_1 =setTimeout(() => {
						this.setStateAsync("alexa-shoppinglist.0.add_position", "", false)	
					}, 2000);
					
					}catch (e){

					}

				}
			})
			
			
		}

		/**
		 * Sort List 
		 * @param {string} kindOfSort 
		 * 
		 */
		const sortList = (array, kindOfSort)=>{
			let arraySort
			if (kindOfSort == "time"){
				
				arraySort = array.sort((a ,b) =>{a.time - b.time})
			} else {
			
			arraySort = array.sort((a, b)=> {
				
			if (a.name > b.name ){
			return 1}
			else if(a.name < b.name){
				return -1
			}
			return 0
			})
			}
			
		}

		/**
		 * Jeder Artikelposition eine Positionsnummer hinzufügen
		 * @param {*} array Aktiv oder Inaktiv Array
		 */
		const addPos = (array) => {
			let num = 0;
			for(let element of array){
				num++;
				element.pos = num;
			}
		}

		


		this.getForeignState(alexaState, (err, obj)=>{
			if (err || obj == null){
				this.log.error(`The State ${alexaState} was not found!`);

				
			}else {
				// Datenpunkt wurde gefunden
				this.log.info("Alexa State was found");
				this.setState("info.connection", true, true);
				// Hauptfunktion wird ausgeführt, wenn der State gefunden wird
				runfunction(sortListActiv, sortListInActiv)
				
			}

			// --------------------------------------------------------------------------------------------

			

		this.on("stateChange",async (id,state)=>{			
			try{
				if(id == alexaState){
					runfunction(sortListActiv, sortListInActiv)
					

				// Auf Sortierungs Datenpunkt reagieren
				}
				
				if (state && id == idSortActiv && state.ack == false && typeof(state.val) == "string"){
					sortListActiv = state.val;
					this.log.info(sortListActiv);
					runfunction(sortListActiv, sortListInActiv)
					
					await this.setStateAsync(id, {ack:true});
				}
				
				if (state && id == idSortInActiv && state.ack == false && typeof(state.val) == "string"){
					
					sortListInActiv = state.val;
					this.log.info(sortListInActiv);
					
					runfunction(sortListActiv, sortListInActiv)

					await this.setStateAsync(id, {ack:true});

				}

				// Position hinzufügen
				if (state && state.val && typeof(state.val) == "string" && id == "alexa-shoppinglist.0.add_position" && state.ack == false){
					addPosition(state.val)
				}

				// Inactiv Liste leeren
				if (state && state.val && typeof(state.val) == "boolean" && id == "alexa-shoppinglist.0.delete_inactiv_list"){
					this.log.info("Inactive List deleted")
					deleteList(jsonInactiv, "delete")
				}
				// Activ Liste leeren
				if (state && state.val && typeof(state.val) == "boolean" && id == "alexa-shoppinglist.0.delete_activ_list"){
					this.log.info("Active List deleted")
					deleteList(jsonActiv, "toInActiv")
				}

				// Zu Inactiv Liste verschieben
				if (state && state.val && id == "alexa-shoppinglist.0.to_inactiv_list"){
					this.log.info("Position to Inactive")
					shiftPosition(positionToShift, jsonActiv, "toInActiv")
				}

				// Zu Activ Liste verschieben
				if (state && state.val && typeof(state.val) == "boolean" && id == "alexa-shoppinglist.0.to_activ_list"){
					this.log.info("Position to Active")
					shiftPosition(positionToShift, jsonInactiv, "toActiv")
				}
				// Position die verschoben werden soll
				if (state && state.val && typeof(state.val) == "number" && id == "alexa-shoppinglist.0.position_to_shift"){
					this.log.info("Position")
					positionToShift = state.val;
				}

				
			}
			catch (e){

			}
		})

	})




const writeState =(arrayActiv, arrayInactiv)=>{
	this.setStateChanged("alexa-shoppinglist.0.shoppingliste_activ", JSON.stringify(arrayActiv),true )
	this.setStateChanged("alexa-shoppinglist.0.shoppingliste_inactiv", JSON.stringify(arrayInactiv),true)
}
			
		// this.on("stateChange", (id,state)=>{
			

		// });


		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
		//this.log.info("config alexastate: " + this.config.alexastate);

		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
		// await this.setObjectNotExistsAsync("testVariable", {
		// 	type: "state",
		// 	common: {
		// 		name: "testVariable",
		// 		type: "boolean",
		// 		role: "indicator",
		// 		read: true,
		// 		write: true,
		// 	},
		// 	native: {},
		// });

		// In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
		try {
		this.subscribeForeignStatesAsync(alexaState);
		this.subscribeStatesAsync(idSortActiv);
		this.subscribeStatesAsync(idSortInActiv);
		this.subscribeStatesAsync("alexa-shoppinglist.0.add_position");
		this.subscribeStatesAsync("alexa-shoppinglist.0.to_activ_list");
		this.subscribeStatesAsync("alexa-shoppinglist.0.to_inactiv_list");
		this.subscribeStatesAsync("alexa-shoppinglist.0.delete_inactiv_list");
		this.subscribeStatesAsync("alexa-shoppinglist.0.delete_activ_list");
		this.subscribeStatesAsync("alexa-shoppinglist.0.position_to_shift");

		}
		catch (e){

		}
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
	onStateChange(id, state) {
		// if (state) {
		// 	// The state was changed
		// 	this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		// } else {
		// 	// The state was deleted
		// 	this.log.info(`state ${id} deleted`);
		// }
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }

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