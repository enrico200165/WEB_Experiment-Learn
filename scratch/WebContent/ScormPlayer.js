
/**
 * /lcms_scorm_player/js/ScormPlayer.js, Player
 *
 * @author Luca Sigalini <luca.sigalini@megaitaliamedia.it>
 * @company Mega Italia Media S.r.l.
 * @version 1.0.042 (2011-09-21)
 * @package DynDevice ECM
 */

/** 
 * ScormPlayer l'oggetto che gestisce le informazioni dello stato
 * del player: tree, LO successivo, LO precedente etc...
 */

function ScormPlayer() {
	this.xmlTree = null; 			// xml dell'albero		
	this.api = null;				// api scorm
	this.listeners = new Object();	// lista dei listeners
	this.actionQueue = new Array(); // lista delle actions -- non usato ora
	this.nextScoId = null;			// id dello sco successivo
	this.basePath = '';				// il path da cui partire per cercare altri file
	this.blankPage = '/?sDo=wrapper&sFile=scorm_page_body.php';
	this.lmsBase = '';
}


ScormPlayer.prototype.onInitialize = function() {
	this._fireEvent( 'Initialize', this.api.getIdscorm_item() );
}

ScormPlayer.prototype.onFinish = function() {
	this._fireEvent( 'Finish', this.api.getIdscorm_item() );
}

ScormPlayer.prototype.onCommit = function() {
	this._fireEvent( 'Commit', this.api.getIdscorm_item() );
}

ScormPlayer.prototype.onGetValue = function() {
	this._fireEvent( 'GetValue', this.api.getIdscorm_item() );
}

ScormPlayer.prototype.onSetValue = function() {
	this._fireEvent( 'SetValue', this.api.getIdscorm_item() );
}


ScormPlayer.prototype.setTree = function(xmldoc)
{
	this.xmlTree = xmldoc;
}

ScormPlayer.prototype.setPath = function( basePath, lmsBase ) {
	this.basePath = basePath;
	this.lmsBase = lmsBase;
}

ScormPlayer.prototype.setAPI = function( api ) {
	this.api = api;
	
	// set call backs
	window._sp = this;
	this.api.initialize_cb = function() { window._sp.onInitialize(); };
	this.api.finish_cb = function() { window._sp.onFinish(); };
	this.api.commit_cb = function() { window._sp.onCommit(); };
	this.api.getValue_cb = function() { window._sp.onGetValue(); };
	this.api.setValue_cb = function() { window._sp.onSetValue(); };
}

/**
 * getTitleCP torna il titolo del content package
 **/
ScormPlayer.prototype.getTitleCP = function() {
	var title = this.xmlTree.selectSingleNode( "/item/title/text()");
	return title.nodeValue;
}

ScormPlayer.prototype.getPackage = function() {
	var sco_package = this.xmlTree.selectSingleNode( "/item/@package");
	return sco_package.nodeValue;
}

// return the discplay name of 'scoid' 
ScormPlayer.prototype.getScoName = function( scoid ) {

	var item = this.xmlTree.selectSingleNode('//item[@id="'+scoid+'"]');
	if( item != null ) {
		return item.firstChild.firstChild.nodeValue;
	} else {
		return null;
	}
}

// get the scoid of the current sco played
ScormPlayer.prototype.getCurrScoId = function() {
	var item = this.xmlTree.selectSingleNode('//item[@uniqueid="'+this.api.getIdscorm_item()+'"]');
	if( item != null ) {
		return item.getAttribute('id');
	} else {
		return null;
	}
}

// fint the first sco of the organization
ScormPlayer.prototype.getFirstScoId = function()
{
	var item = this.xmlTree.selectSingleNode('//item[@resource!="" and @controlmodeflow="true" and @completeByMeasure="false" and @availablebyrules="true"]');

	if(item != null)
	{
		return item.getAttribute('id');
	}
	else
	{
		return null;
	}
}

// --------------------------------------------------------------------------------------------

/**
 * Cerca il primo SCO avviabile prima di "scoid".
 */

ScormPlayer.prototype.getPrevScoId = function(scoid)
{
	// Aggiorno l'XML relativo all'albero delle SCO.

	this.updateXMLTree();

	// Eventualmente restituisce il precedente fornito via PHP.

	if(window.sPreviousByPHP != undefined && window.sPreviousByPHP != "")
	{
		return window.sPreviousByPHP;
	}

	// Eseguo il calcolo via JS per il recupero del precedente.

	var item = this.xmlTree.selectSingleNode('//item[@id="' + scoid + '"]');

	item = item.selectNodes('preceding::item[@isLeaf="1" and @controlmodeflow="true" and @completeByMeasure="false" and @father="' + item.getAttribute('father') + '" and @availablebyrules="true"]');

	if(item.length > 0)
	{
		return item[item.length - 1].getAttribute('id');
	}
	else
	{
		return null;
	} 
}

// --------------------------------------------------------------------------------------------

/**
 * Cerca il primo SCO avviabile dopo "scoid".
 */

ScormPlayer.prototype.getSuccScoId = function(scoid)
{
	// Aggiorno l'XML relativo all'albero delle SCO.
	this.updateXMLTree();

	// Recupero il nome reale dello SCO in esecuzione
	// (perchÃ© lo SCO in esecuzione dichiara di non essere foglia).

	if(!this.verifyScoId(scoid))
	{
		scoid = this.findFirstChildLeaf(scoid);
	}

	var item = this.xmlTree.selectSingleNode('//item[@id="' + scoid + '"]');
	item = item.selectSingleNode('following::item[@isLeaf="1" and @controlmodeflow="true" and @completeByMeasure="false" and @availablebyrules="true" and @availablebystatus="true"]');

	if(item != null)
	{
		// Recupera il valore da assegnare a continue calcolato via PHP.

		sURL = "?sAjaxCall=true&sAction=verify_continue&sFrom=" + this.getCurrScoId() + "&sTo=" + item.getAttribute('id') + "&iOrganization=" + playerConfig.idscorm_organization;

		var xmlhttp = new Ajax.Request(sURL, {
				method: 'get',
				asynchronous: false
			}
		);

		if(xmlhttp.transport.responseText != "")
		{
			return xmlhttp.transport.responseText;
		}

		return item.getAttribute('id');
	}
	else
	{
		// Verifica con PHP che effettivamente non ci sia un continue.

		sURL = "?sAjaxCall=true&sAction=confirm_no_continue&sFrom=" + this.getCurrScoId() + "&iOrganization=" + playerConfig.idscorm_organization;

		var xmlhttp = new Ajax.Request(sURL, {
				method: 'get',
				asynchronous: false
			}
		);

		if(xmlhttp.transport.responseText != "")
		{
			sPHPContinue = "";

			eval(xmlhttp.transport.responseText);

			if(sPHPContinue != "")
			{
				return sPHPContinue;
			}
		}

		return null;
	}
}

// --------------------------------------------------------------------------------------------

/**
 * Cerca il primo SCO avviabile dopo "scoid" (stesso ramo).
 */

ScormPlayer.prototype.getContinueScoId = function(scoid)
{
	// Aggiorno l'XML relativo all'albero delle SCO.
	this.updateXMLTree();

	var item = this.xmlTree.selectSingleNode('//item[@id="' + scoid + '"]');
	item = item.selectSingleNode('following::item[@isLeaf="1" and @controlmodeflow="true" and @completeByMeasure="false" and @father="' + item.getAttribute('father') + '" and @availablebyrules="true"]');

	if(item)
	{
		return item.getAttribute('id');
	}
	else
	{
		return null;
	} 
}

// --------------------------------------------------------------------------------------------

/**
 * Restituisce il primo ScoId incompleto lanciabile.
 */

ScormPlayer.prototype.getFirstIncompleteScoId = function(scoid)
{
	// Verifica se c'Ã¨ settato un item di partenza e, nel caso, restituisce quello.
	// In caso contrario, recupera il primo incompleto lanciabile.

	sURL = "?sAjaxCall=true&sAction=get_starter&idscorm_organization=" + window.API_1484_11.idscorm_organization + "&iUserId=" + window.API_1484_11.idUser;

	var xmlhttp = new Ajax.Request(sURL, {
			method: 'get',
			asynchronous: false
		}
	);

	if(xmlhttp.transport.responseText != '')
	{
		return xmlhttp.transport.responseText;
	}

	// Non c'Ã¨ nessun item "prestabilito" per l'organization. Cerca il primo incompleto.

	var item = this.xmlTree.selectSingleNode('//item[@resource!="" and (@status="incomplete" or @status="neverstarted" or @status="not attempted" or @status="failed" or @status="unknown") and @controlmodeflow="true" and @completeByMeasure="false" and @availablebyrules="true"]');

	if(item != null)
	{
		sURL = "?sAjaxCall=true&sAction=verify_starter&idscorm_organization=" + window.API_1484_11.idscorm_organization + "&sPropose=" + item.getAttribute('id');

		var xmlhttp = new Ajax.Request(sURL, {
				method: 'get',
				asynchronous: false
			}
		);

		if(xmlhttp.transport.responseText != '')
		{
			return xmlhttp.transport.responseText;
		}

		return item.getAttribute('id');
	}
	else
	{
		return null;
	}
}

// --------------------------------------------------------------------------------------------

/**
 * Cerca il primo SCO avviabile dopo 'scoid' e mai eseguito.
 */

ScormPlayer.prototype.getNextScoId = function(scoid)
{
	//document.getElementById("consoleText").value = document.getElementById("consoleText").value + "\n" + "[getNextScoId] - Chiamato con: " + scoid;

	var currentitem = this.xmlTree.selectSingleNode('//item[@id="' + scoid + '"]');

	if(currentitem)
	{
		//document.getElementById("consoleText").value = document.getElementById("consoleText").value + "\n" + "[getNextScoId] - Trovato l'item per: " + scoid;
	}

	var item = currentitem.selectSingleNode('following::item[@isLeaf="1" and @controlmodeflow="true" and @completeByMeasure="false" and @nevertracked="true" and @availablebyrules="true"]');

	if(item)
	{
		//document.getElementById("consoleText").value = document.getElementById("consoleText").value + "\n" + "[getNextScoId] - NEXT-Id: " + item.getAttribute('id');
		//document.getElementById("consoleText").value = document.getElementById("consoleText").value + "\n" + "[getNextScoId] - NEXT-Param: " + item.getAttribute('parameters');

		sURL = "?sAjaxCall=true&sAction=get_nextscoid&sFrom=" + this.getCurrScoId() + "&sTo=" + item.getAttribute('id');

		var xmlhttp = new Ajax.Request(sURL, {
				method: 'get',
				asynchronous: false
			}
		);

		if(xmlhttp.transport.responseText == "KO")
		{
			return null;
		}
	}

	// Ritorno normale.

	if(item != null)
	{
		//document.getElementById("consoleText").value = document.getElementById("consoleText").value + "\n" + "[getNextScoId] - Ritorno: " + item.getAttribute('id');

		return item.getAttribute('id');
	}
	else
	{
		return null;
	}
}

// --------------------------------------------------------------------------------------------

/**
 * Verifica che lo scoid esista e che sia una foglia.
 */

ScormPlayer.prototype.verifyScoId = function(scoid)
{
	var item = this.xmlTree.selectSingleNode('//item[@id="' + scoid + '" and @isLeaf="1"]');

	if(item != null)
	{
		return true;
	}
	else
	{
		return false;
	}
}

// --------------------------------------------------------------------------------------------

/**
 * Cerca il primo figlio foglia dello SCO passato in parametro.
 */

ScormPlayer.prototype.findFirstChildLeaf = function(scoid)
{
	sURL = "?sAjaxCall=true&sAction=find_1st_child_leaf&iFrom=" + scoid + "&iOrganization=" + this.api.idscorm_organization + "&iUserId=" + window.API_1484_11.idUser;

	var xmlhttp = new Ajax.Request(sURL, {
			method: 'get',
			asynchronous: false
		}
	);

	return xmlhttp.transport.responseText;
}

// --------------------------------------------------------------------------------------------

/**
 * Recupera ed aggiorna l'XML relativo all'albero degli SCO.
 */

ScormPlayer.prototype.updateXMLTree = function()
{
	sURLXML = playerConfig.xmlTreeUrl + "&sActivity=" + this.nextScoId;

	var xmlhttp = new Ajax.Request(sURLXML, {
			method: 'get',
			asynchronous: false
		}
	);

	if(window.ActiveXObject)
	{
		if(xmlhttp.transport.status == 200)
		{
			// Browser Internet Explorer.

			var xmldom = new ActiveXObject("Microsoft.XMLDOM");
			xmldom.async = false;
			xmldom.loadXML(xmlhttp.transport.responseText);

			if(xmldom.parseError.errorCode != 0)
			{
				alert("xml parser error:"
						+ "\n code = " + xmldom.parseError.errorCode
						+ "\n reason = " + xmldom.parseError.reason
						+ "\n line = " + xmldom.parseError.line
						+ "\n srcText = " + xmldom.parseError.srcText
						+ "\n xml_file = " + xmlhttp.transport.responseText);

				return null;
			}

			xmldom.setProperty("SelectionLanguage", "XPath");

			window.scormPlayer.setTree(xmldom);
		}
	}
	else
	{
		if(xmlhttp.transport.status == 200)
		{
			try
			{
				window.scormPlayer.setTree(xmlhttp.transport.responseXML);
			}
			catch(ex)
			{
				alert( 'Load from xml error: ' + xmlhttp.transport.responseText );
			}
		}
		else
		{
			alert( 'Load from xml error: ' + xmlhttp.transport.responseText);
		}
	}
}

// --------------------------------------------------------------------------------------------

/* = prev of current ======================== */

// check if there is a sco that precede the current ones
ScormPlayer.prototype.prevScoExists = function () {

	if(!this.nextScoId) var cur_sco = this.getCurrScoId();
	else var cur_sco = this.nextScoId;
	if(!cur_sco) return false;
	
	var prev_sco = this.getPrevScoId(cur_sco);
	if(prev_sco != null) return true;
	else return false;
}

// find the name of the sco that follow the current played
ScormPlayer.prototype.getPrevScoName = function( ) {
	
	if(!this.nextScoId) var cur_sco = this.getCurrScoId();
	else var cur_sco = this.nextScoId;
	if(!cur_sco) return false;
	
	var prev_sco = this.getPrevScoId(cur_sco);
	if(prev_sco == null) return false;
	
	return this.getScoName(prev_sco);
}

// play the sco that precede the current one
ScormPlayer.prototype.playPrevSco = function () {
	var cur_sco = this.getCurrScoId();
	if(!cur_sco) return false;
	var prev_sco = this.getPrevScoId(cur_sco);
	if(prev_sco != null) this.play( prev_sco, window.uiPlayer.cntSco );
}

/* = next of current ======================== */

// find the sco that follow the current played
ScormPlayer.prototype.nextScoExists = function () {

	if(!this.nextScoId) var cur_sco = this.getCurrScoId();
	else var cur_sco = this.nextScoId;
	if(!cur_sco) return true;
	
	var next_sco = this.getNextScoId(cur_sco);
	if(next_sco != null) return true;
	else return false;
}

// find the name of the sco that follow the current played
ScormPlayer.prototype.getNextScoName = function( ) {

	if(!this.nextScoId) var cur_sco = this.getCurrScoId();
	else var cur_sco = this.nextScoId;
	
	if(!cur_sco) var next_sco = this.getFirstScoId();
	else {
		var next_sco = this.getNextScoId(cur_sco);
		if(next_sco == null) return false;
	}
	return this.getScoName(next_sco);
}

// play the sco next to the current one
ScormPlayer.prototype.playNextSco = function ()
{
	var cur_sco = this.getCurrScoId();

	if(!cur_sco)
	{
		var next_sco = this.getFirstScoId();
	}
	else
	{
		var next_sco = this.getNextScoId(cur_sco);
	}

	if(next_sco != null)
	{
		this.play( next_sco, window.uiPlayer.cntSco );
	}
}

/**
 * getProgress torna un oggetto con le seguenti proprieta':
 *  - completed numero di completati/passati
 *	- incomplete numero di incompleti
 *	- notAttempted numero di non iniziati
 **/
ScormPlayer.prototype.getProgress = function() {
	var icompleted 	= this.xmlTree.selectNodes('//item[@status="completed" and @isLeaf="1"]');
	var ipassed 	= this.xmlTree.selectNodes('//item[@status="passed" and @isLeaf="1"]');
	var iall 		= this.xmlTree.selectNodes('//item[@isLeaf="1"]');
	return 	{	completed: (icompleted.length + ipassed.length), 
				all: iall.length
			};
}

// --------------------------------------------------------------------------------------------

/**
 * Lancia il parsing ricorsivo dell'XML che rappresenta il tree.
 */

ScormPlayer.prototype.parseTree = function(obj)
{
	var doc = this.xmlTree.documentElement;
	this._parseTree(this.xmlTree, 0, obj);
}

// --------------------------------------------------------------------------------------------

/** 
 * Funzione interna ricorsiva per il parsing dell'albero. Richiama i metodi dell'oggetto
 * passato in parametro utili al disegno e controllo del tree.
 */

ScormPlayer.prototype._parseTree = function(node, level, obj)
{
	//alert("Parso il tree...");

	var items = node.childNodes;
	var item = null;
	var objItem = null;
	var titleList = null;

	for( var i = 0; i < items.length; i++ )
	{
		item = items.item(i);

		if(item.tagName == 'item')
		{
			objItem = new Object();
			objItem.id = item.getAttribute('id');
			titleList = item.getElementsByTagName('title');
			objItem.title = titleList.item(0).firstChild.nodeValue;
			objItem.prerequisites = item.getAttribute('prerequisites');
			objItem.visited = item.getAttribute('visited');
			objItem.complete = item.getAttribute('complete');
			objItem.status = item.getAttribute('status');
			objItem.isLeaf = item.getAttribute('isLeaf');
			objItem.resource = item.getAttribute('resource');
			objItem.idscorm_item = item.getAttribute('uniqueid');

			obj.startItem( objItem, level );
			this._parseTree(item, level + 1, obj);
			obj.stopItem(objItem, level);
		}
	}
}

// --------------------------------------------------------------------------------------------

/**
 * addListener aggiunge un oggetto alla lista dei listeners
 * un listener e' un oggetto che implementa il metodo
 * scormPlayerActionPerfomer( evType, evValue )
 **/
ScormPlayer.prototype.addListener = function( id, obj ) {
	this.listeners[id] = obj;
}

/**
 * removeListener rimuove un listener dalla lista dei listeners
 **/
ScormPlayer.prototype.removeListener = function( id ) {
	this.listeners[id] = null;
}

/** 
 * _fireEvent e' il metodo privato utilizzato per lanciare degli eventi
 * ai listeners
 **/
ScormPlayer.prototype._fireEvent = function( evType, evValue ) {
	for( objid in this.listeners ) {
		this.listeners[objid].scormPlayerActionPerformer( evType, evValue);
	}
}

/**
 * playItem esegue il LO con l'id passato come parametro
 * nella window passata in win
 * Il play non puï¿½ essere eseguito immediatamente se c'e' giï¿½ uno sco caricato
 *  e che ha fatto l'initialize.Deve attendere che il precedente sco sia stato
 *  scaricato. Crea quindi una action e la pone nella coda delle actions. Tale
 *  coda viene elaborata quando arriva un evento di finish.
 * 
 * @param String id id del LO da mandare in play
 * @param Object win window in cui caricare lo sco
 */

ScormPlayer.prototype.play = function(id, win)
{
	if(undefined != window.sExitFuture)
	{
		exitSco();
		return;
	}

	// Recupera l'eventuale objectiveMeasureWeight dell'item.

	sURL = "?sAjaxCall=true&sAction=get_measure_weight&iUserId=" + window.API_1484_11.idUser + "&sItem=" + id + "&iOrganization=" + window.API_1484_11.idscorm_organization;

	var xmlhttp = new Ajax.Request(sURL, {
			method: 'get',
			asynchronous: false
		}
	);

	fMeasureWeight = xmlhttp.transport.responseText;

	// Se objectiveMeasureWeight Ã¨ definito a livello globale, recupera ed eventualemente
	// esegue le post-rules del parent.

	if(fMeasureWeight != "0.00")
	{
		if(fMeasureWeight == "0.00")
		{
			fMeasureWeight = "1.00";
		}

		aData = fMeasureWeight.split(",");

		sURL = "?sAjaxCall=true&sAction=post_rules&iIdScormItem=" + aData[1] + "&idUser=" + window.API_1484_11.idUser + "&fMeasureWeight=" + aData[0];

		var xmlhttp = new Ajax.Request(sURL, {
				method: 'get',
				asynchronous: false
			}
		);

		if(xmlhttp.transport.responseText != "")
		{
			aPostActions = xmlhttp.transport.responseText.split("#");

			iCounter = 0;
			while(iCounter < aPostActions.length)
			{
				if(aPostActions[iCounter] != "")
				{
					if(aPostActions[iCounter] == "previous")
					{
						sTargetNext = window.scormPlayer.getPrevScoId(aData[2]);
						uiPlayer.scormPlayerForceScoId(sTargetNext, false);

						return;
					}
					else
					{
						alert("Regola del padre per fMeasureWeight non implementata:" + aPostActions[iCounter]);
					}
				}

				iCounter ++;
			}
		}
	}

	// Esecuzione delle azioni delle regole postFatherActionRules.

	aPostActions = window.API_1484_11.postFatherActionRules.split("#");
	window.API_1484_11.postFatherActionRules = "";

	iCounter = 0;
	while(iCounter < aPostActions.length)
	{
		if(aPostActions[iCounter] != "")
		{
			if(aPostActions[iCounter] == "previous")
			{
				// Pulisce l'ADL Nav e forza il previous.
				window.API_1484_11.SetValue("adl.nav.request", "force_stop");

				sTargetNext = window.scormPlayer.getPrevScoId(window.API_1484_11.iFather);
				uiPlayer.scormPlayerForceScoId(sTargetNext, false);

				return;
			}
			else if(aPostActions[iCounter] == "continue")
			{
				sTargetNext = window.scormPlayer.getContinueScoId(window.API_1484_11.iFather);
				uiPlayer.scormPlayerForceScoId(sTargetNext, false);

				return;
			}
			else if(aPostActions[iCounter] == "retry")
			{
				sURL = "?sAjaxCall=true&sAction=verify_retry&sFrom=" + window.scormPlayer.getCurrScoId() + "&iOrganization=" + window.playerConfig.idscorm_organization;

				var xmlhttp = new Ajax.Request(sURL, {
						method: 'get',
						asynchronous: false
					}
				);

				if(xmlhttp.transport.responseText != "")
				{
					eval(xmlhttp.transport.responseText);
				}
				else
				{
					sTargetNext = window.scormPlayer.getSuccScoId(window.API_1484_11.iFather);
					uiPlayer.scormPlayerForceScoId(sTargetNext, false);
				}

				return;
			}
			else if(aPostActions[iCounter] == "exitParent")
			{
				sURL = "?sAjaxCall=true&sAction=verify_exitParent&sFrom=" + window.scormPlayer.getCurrScoId() + "&iOrganization=" + window.playerConfig.idscorm_organization;

				var xmlhttp = new Ajax.Request(sURL, {
						method: 'get',
						asynchronous: false
					}
				);

				if(xmlhttp.transport.responseText != "")
				{
					eval(xmlhttp.transport.responseText);
				}

				return;
			}
			else
			{
				alert("Regola del padre non implementata: " + aPostActions[iCounter]);

				// Pulisce l'ADL Nav e forza il previous.
				window.API_1484_11.SetValue("adl.nav.request", "force_stop");

				sTargetNext = window.scormPlayer.getPrevScoId(window.API_1484_11.iFather);
				uiPlayer.scormPlayerForceScoId(sTargetNext, false);

				return;
			}
		}

		iCounter ++;
	}

	// Esecuzione delle azioni delle regole postRules.

	aPostActions = window.API_1484_11.postActionRules.split("#");
	// window.API_1484_11.postActionRules = ""; FORSE E' DA ATTIVARE ANCHE QUESTA!

	if(window.API_1484_11.postActionRules != "")
	{
		window.API_1484_11.postActionRules = "";
	}

	iCounter = 0;
	while(iCounter < aPostActions.length)
	{
		if(aPostActions[iCounter] != "")
		{
			if(aPostActions[iCounter] == "exitAll")
			{
				sURL = "?sAjaxCall=true&sAction=verify_exitAll&sFrom=" + window.scormPlayer.getCurrScoId() + "&iOrganization=" + window.playerConfig.idscorm_organization;

				var xmlhttp = new Ajax.Request(sURL, {
						method: 'get',
						asynchronous: false
					}
				);

				if(xmlhttp.transport.responseText != "" && xmlhttp.transport.responseText == "exit_future")
				{
					window.sExitFuture = "exit_future";
				}
				else
				{
					window.setTimeout(exitSco, 2000);
				}

				return;
			}
			else if(aPostActions[iCounter] == "continue")
			{
				sTargetNext = window.scormPlayer.getSuccScoId(window.scormPlayer.getCurrScoId());
				uiPlayer.scormPlayerForceScoId(sTargetNext, false);

				return;
			}
			else if(aPostActions[iCounter] == "retry")
			{
				uiPlayer.scormPlayerForceScoId(window.scormPlayer.getCurrScoId(), false);

				return;
			}
			else if(aPostActions[iCounter] == "previous")
			{
				sTargetNext = window.scormPlayer.getPrevScoId(window.scormPlayer.getCurrScoId());
				uiPlayer.scormPlayerForceScoId(sTargetNext, false);

				return;
			}
			else
			{
				alert("Regola non implementata: " + aPostActions[iCounter]);
			}
		}

		iCounter ++;
	}

	// Processa il play.

	if(id === null)
	{
		// Non fa nulla: lascia caricata la pagina dello SCO in esecuzione.
		// win.location.replace(this.basePath + this.blankPage);
	}
	else
	{
		this.setNextToPlay(id, win);
		win.location.replace(this.basePath + this.blankPage);
	}
}

// --------------------------------------------------------------------------------------------

ScormPlayer.prototype.setNextToPlay = function(id, win)
{
	this.nextScoId = id;
	this.cntWin = win;
}

// --------------------------------------------------------------------------------------------

/**
 * Esegue lo sco successivo impostato nel membro nextScoId
 */

ScormPlayer.prototype.playNext = function()
{
	if(this.nextScoId === null)
	{
		// do nothing -- this.cntWin.location.replace( '' );
	}
	else
	{
		window.setTimeout('window.scormPlayer.startPlayNext()', 300);
	}
}

ScormPlayer.prototype.startPlayNext = function()
{
	//document.getElementById("consoleText").value = document.getElementById("consoleText").value + "\n" + "[startPlayNext] Activity: " + this.nextScoId + " - Continue: " + currentitem.getAttribute('sContinue') + " - Previous: " + currentitem.getAttribute('sPrevious');

	// Recupera le activity che devono essere disabilitate o nascoste e le disabilita o
	// nasconde. Sistema quindi i puntamenti di Continue e Previous (se non ci sono puntamenti
	// li disabilita).

	this.disableActivityAndButtons();

	// Recupera i valori da assegnare a previous calcolati via PHP.

	sURL = "?sAjaxCall=true&sAction=get_previous&sFrom=" + this.nextScoId + "&iOrganization=" + playerConfig.idscorm_organization;

	var xmlhttp = new Ajax.Request(sURL, {
			method: 'get',
			asynchronous: false
		}
	);

	if(xmlhttp.transport.responseText != "")
	{
		window.sPreviousByPHP = xmlhttp.transport.responseText;
	}
	else
	{
		window.sPreviousByPHP = "";
	}

	// Recupera il codice JS Speed per velocizzare le operazioni in LMSGetValue().

	sURL = "?sAjaxCall=true&sAction=get_speedlmsgetvalue&sFrom=" + this.nextScoId + "&iOrganization=" + playerConfig.idscorm_organization;

	var xmlhttp = new Ajax.Request(sURL, {
			method: 'get',
			asynchronous: false
		}
	);

	if(xmlhttp.transport.responseText != "")
	{
		window.sSpeedLMSGetValueByPHP = xmlhttp.transport.responseText;
	}
	else
	{
		window.sSpeedLMSGetValueByPHP = "";
	}

	// Recupera il codice JS Speed per velocizzare le operazioni in LMSGetValue().

	sURL = "?sAjaxCall=true&sAction=get_speedlmsgetvalue_ifempty&sFrom=" + this.nextScoId + "&iOrganization=" + playerConfig.idscorm_organization;

	var xmlhttp = new Ajax.Request(sURL, {
			method: 'get',
			asynchronous: false
		}
	);

	if(xmlhttp.transport.responseText != "")
	{
		window.sSpeedLMSGetValueIfEmptyByPHP = xmlhttp.transport.responseText;
	}
	else
	{
		window.sSpeedLMSGetValueIfEmptyByPHP = "";
	}

	// Recupera il codice JS Speed per velocizzare le operazioni in LMSGetValue().

	sURL = "?sAjaxCall=true&sAction=get_speedlmsgetvalue_finalcontrol&sFrom=" + this.nextScoId + "&iOrganization=" + playerConfig.idscorm_organization;

	var xmlhttp = new Ajax.Request(sURL, {
			method: 'get',
			asynchronous: false
		}
	);

	if(xmlhttp.transport.responseText != "")
	{
		window.sSpeedLMSGetValueFinalControlByPHP = xmlhttp.transport.responseText;
	}
	else
	{
		window.sSpeedLMSGetValueFinalControlByPHP = "";
	}

	// Recupera il codice JS Speed per velocizzare le operazioni in LMSSetValue().

	sURL = "?sAjaxCall=true&sAction=get_speedlmssetvalue&sFrom=" + this.nextScoId + "&iOrganization=" + playerConfig.idscorm_organization;

	var xmlhttp = new Ajax.Request(sURL, {
			method: 'get',
			asynchronous: false
		}
	);

	if(xmlhttp.transport.responseText != "")
	{
		window.sSpeedLMSSetValueByPHP = xmlhttp.transport.responseText;
	}
	else
	{
		window.sSpeedLMSSetValueByPHP = "";
	}

	// Abilita o disabilita i pulsanti Continue e Previous.

	var currentitem = this.xmlTree.selectSingleNode('//item[@id="' + this.nextScoId + '"]');

	if(currentitem && currentitem.getAttribute('sContinue') == "hide")
	{
		document.getElementById("UIbutton_sContinue").disabled = true;
	}
	else
	{
		// document.getElementById("UIbutton_sContinue").disabled = false;
	}
	
	if(currentitem && currentitem.getAttribute('sPrevious') == "hide")
	{
		document.getElementById("UIbutton_sPrevious").disabled = true;
	}
	else
	{
		/*
		if(undefined === window.firstAccess)
		{
		}
		else
		{
			document.getElementById("UIbutton_sPrevious").disabled = false;
		}

		if(window.firstSCO && this.nextScoId == window.firstSCO)
		{
			document.getElementById("UIbutton_sPrevious").disabled = true;
		}
		*/
	}

	if(undefined === window.firstAccess)
	{
		window.firstAccess = false;
		window.firstSCO = this.nextScoId;
	}

	// Esegue il play.

	var item = this.xmlTree.selectSingleNode('//item[@id="' + this.nextScoId + '"]');
	var prerequisites = item.getAttribute('prerequisites');
	if(prerequisites == "")
	{
		if(this.cntWin.msgPrereqNotSatisfied) 
		{
			this.cntWin.msgPrereqNotSatisfied(this.getScoName(this.nextScoId));
		}
		return;
	}
	this.api.setIdscorm_item(item.getAttribute('uniqueid'));
	this.api.setIdscorm_organization(playerConfig.idscorm_organization);

	sURL = this.lmsBase + 'soaplms.php&modname=scorm&op=scoload'
							+ '&idReference=' + playerConfig.idReference
							+ '&idUser=' + playerConfig.idUser
							+ '&idscorm_resource=' + item.getAttribute('resource')
							+ '&idscorm_item=' + item.getAttribute('uniqueid')
							+ '&idscorm_organization=' + playerConfig.idscorm_organization
							+ '&idscorm_package=' + this.getPackage();

	this.cntWin.location.replace(sURL);

	this._fireEvent('BeforeScoLoad', this.nextScoId);

	this.nextScoId = null;
}

// --------------------------------------------------------------------------------------------

ScormPlayer.prototype.blankPageLoaded = function() {
	if(window.close_player) {
		var url = window.top.location.href;
		url = url.slice(0, url.lastIndexOf("/"));
		window.top.location.href = url + "/" + playerConfig.backurl;
	} else {
		this.playNext();
	}
}

ScormPlayer.prototype.addActionQueue = function( action ) {
	this.actionQueue.push(action);
}

ScormPlayer.prototype.processActionQueue = function() {
	var action = null;
	var func = null;
	var params = null;
	while( this.actionQueue.length > 0 ) {
		action = this.actionQueue.shift();
		func = action.func;
		params = action.params;
		func.apply(this, params);
	}
}

/* Special xpath */
if( document.implementation.hasFeature("XPath", "3.0") ) { 
	// prototying the XMLDocument 
	XMLDocument.prototype.selectNodes = function(cXPathString, xNode) { 
		if( !xNode ) { xNode = this; }
		try {

			var oNSResolver = this.createNSResolver(this.documentElement)
		} catch(e) {
			alert( "Property not found: "+e);
		}
		var aItems = this.evaluate(	cXPathString, xNode, oNSResolver,
									XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null) 
		var aResult = [];
		for( var i = 0; i < aItems.snapshotLength; i++) { 
			aResult[i] = aItems.snapshotItem(i);
		}
		aResult.item = function( index ) {
			return this[index];
		}
		return aResult;
	} 
	XMLDocument.prototype.selectSingleNode = function(cXPathString, xNode) { 
		if( !xNode ) { xNode = this; }
		var xItems = this.selectNodes(cXPathString, xNode);
		if( xItems.length > 0 ) { 
			return xItems[0];
		} else { 
			return null;
		} 
	}

	// prototying the Element 
	Element.prototype.selectNodes = function(cXPathString) { 
		if(this.ownerDocument.selectNodes) { 
			return this.ownerDocument.selectNodes(cXPathString, this);
		} else { 
			throw "For XML Elements Only"; 
		} 
	}
	Element.prototype.selectSingleNode = function(cXPathString) {
		if(this.ownerDocument.selectSingleNode) { 
			return this.ownerDocument.selectSingleNode(cXPathString, this);
		} else{
			throw "For XML Elements Only";
		} 
	} 
}

// --------------------------------------------------------------------------------------------

/**
 * Esegue la chiamata AJAX per il recupero delle activity da disabilitare e quelle da
 * nascondere.
 * Sistema quindi puntamenti di Continue e Previous e, se non ci sono puntamenti per questi
 * pulsanti, li disabilita.
 */

ScormPlayer.prototype.disableActivityAndButtons = function(sFromTerminate)
{
	if(sFromTerminate == undefined)
	{
		window.uiPlayer.drawTree();	
		sCallerActivity = this.nextScoId;
	}

	// Recupera le activity che devono essere disabilitate e le disabilita.

	sURL = "?sAjaxCall=true&sAction=get_disabled&iFrom=" + sCallerActivity + "&iOrganization=" + playerConfig.idscorm_organization + "&iUser=" + window.API_1484_11.idUser;

	var xmlhttp = new Ajax.Request(sURL, {
			method: 'get',
			asynchronous: false
		}
	);

	if(xmlhttp.transport.responseText != "")
	{
		aData = xmlhttp.transport.responseText.split("\n");

		window.sPreviousTarget = aData[0];
		window.sContinueTarget = aData[1];

		if(window.sPreviousTarget == "undefined")
		{
			document.getElementById("UIbutton_sPrevious").disabled = true;
		}
		else
		{
			document.getElementById("UIbutton_sPrevious").disabled = false;
		}

		if(window.sContinueTarget == "undefined")
		{
			document.getElementById("UIbutton_sContinue").disabled = true;
		}
		else
		{
			document.getElementById("UIbutton_sContinue").disabled = false;
		}

		iCounter = 2;
		while(aData[iCounter])
		{
			document.getElementById(aData[iCounter]).style.textDecoration = "none";
			document.getElementById(aData[iCounter]).style.color = "#AEAEAE";
			document.getElementById(aData[iCounter]).onclick = "";
			document.getElementById(aData[iCounter]).href = "#";

			if(aData[iCounter] == "activity_1")
			{
				document.getElementById("root_lo_4_package").style.textDecoration = "none";
				document.getElementById("root_lo_4_package").style.color = "#AEAEAE";
				document.getElementById("root_lo_4_package").onclick = "";
				document.getElementById("root_lo_4_package").href = "#";
			}

			iCounter ++;
		}
	}

	// Recupera le activity che devono essere nascoste e le nasconde.

	sURL = "?sAjaxCall=true&sAction=get_hidden&iFrom=" + sCallerActivity + "&iOrganization=" + playerConfig.idscorm_organization;

	var xmlhttp = new Ajax.Request(sURL, {
			method: 'get',
			asynchronous: false
		}
	);

	if(xmlhttp.transport.responseText != "")
	{
		aData = xmlhttp.transport.responseText.split("\n");

		iCounter = 0;
		while(aData[iCounter])
		{
			document.getElementById("cnt_" + aData[iCounter]).style.display = "none";

			iCounter ++;
		}
	}

	// Recupera i valori da assegnare a Previous e Continue. Se non ci sono, disabilita
	// i pulsanti.

	// .
	// . Occhio a get_previous
	// .
}

// --------------------------------------------------------------------------------------------