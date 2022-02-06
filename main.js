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
		let idSortActiv ="alexa-shoppinglist.0.shoppingliste_activ_sort";
		let idSortInActiv ="alexa-shoppinglist.0.shoppingliste_inactiv_sort";
		
		let sortListActiv ="time";
		let sortListInActiv ="time";
		
		// States auslesen, damit beim ersten Start richtig sortiert wird
		this.getState(idSortActiv,(err, state)=>{
			// @ts-ignore
			if (state.val != null && state.val != "" && state.val != undefined && !err ){
				// @ts-ignore
				sortListActiv = state.val
			}		
		})

		this.getState(idSortInActiv,(err, state)=>{
			// @ts-ignore
			if (state.val != null && state.val != "" && state.val != undefined && !err){
				// @ts-ignore
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
			}catch(e){

			}
				// @ts-ignore
				let alexaList = JSON.parse(alexaListJson.val);
				
				let jsonActiv = [];
				let jsonInactiv = [];
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
		this.log.info("Funktionen werden ausgeführt")
		this.log.info(sortListActiv)
		this.log.info(sortListInActiv)
	sortList(jsonActiv, sortListActiv);
	sortList(jsonInactiv, sortListInActiv);
	addPos(jsonActiv);
	addPos(jsonInactiv);
	writeState(jsonActiv, jsonInactiv);	
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
		 * Sort List 
		 * @param {string} kindOfSort 
		 * 
		 */
		const sortList = (array, kindOfSort)=>{
			let arraySort
			if (kindOfSort == "time"){
				this.log.info("Nach Zeit sortiert")
				arraySort = array.sort((a ,b) =>{a.time - b.time})
			} else {
			arraySort = array.sort((a, b)=> {
				this.log.info("Nach Name sortiert")
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

				// Hauptfunktion wird ausgeführt, wenn der State gefunden wird
				runfunction(sortListActiv, sortListInActiv)
			}else {
				// Datenpunkt wurde gefunden
				this.log.info("Alexa State was found");
				this.setState("info.connection", true, true);
			}

			// --------------------------------------------------------------------------------------------

			

		this.on("stateChange",async (id,state)=>{			
			try{
			if(id == alexaState){
				
				runfunction(sortListActiv, sortListInActiv)
				

			// Auf Sortierungs Datenpunkt reagieren
			}
			// @ts-ignore
			if (id == idSortActiv && state.ack == false){
				// @ts-ignore
				sortListActiv = state.val;
				this.log.info(sortListActiv);
				runfunction(sortListActiv, sortListInActiv)

				await this.setStateAsync(id, {ack:true});
			}
			// @ts-ignore
			if (id == idSortInActiv && state.ack == false){
				// @ts-ignore
				sortListInActiv = state.val;
				this.log.info(sortListInActiv);
				
				runfunction(sortListActiv, sortListInActiv)

				await this.setStateAsync(id, {ack:true});

			}}
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
		this.subscribeForeignStatesAsync(idSortActiv);
		this.subscribeForeignStatesAsync(idSortInActiv);
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
			// clearTimeout(timeout1);
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