/**
 * /lcms_scorm_player/js/ScormUIPlayer.js, Scorm API
 *
 * @author Luca Sigalini <luca.sigalini@megaitaliamedia.it>
 * @company Mega Italia Media S.r.l.
 * @version 1.0.001 (2011-06-24)
 */

/**
 * Costruttore del UI player standard, l'oggetto che gestisce l'interfaccia del
 * player.
 */

function StdUIPlayer() {
	this.cntNAvigation = null; // elemento contenente la progress
	this.cntProgressBar = null; // elemento contenente la progress
	this.cntPrevBtn = null; // elemento contenente il bottone prev
	this.cntNextBtn = null; // elemento contenente il bottone di next
	this.cntTitleCP = null; // elemento contenente il titolo del content package
	this.cntTitleSCO = null; // elemento contenente il titolo dello sco
								// attualmente in esecuzione
	this.cntTree = null; // elemento contenente l'albero di navigazione
	this.cntScoContent = null; // elemento contenente la window con lo sco
	this.cntSco = null; // window che contiene gli sco
	this.cntSeparator = null; // elemento che comanda il show/hide dell'albero

	this.scormPlayer = null; // scorm player
	this.showTree = true;
}

// --------------------------------------------------------------------------------------------

/**
 * Imposta uno dei contenitori degli elementi delle interfacce
 * 
 * @param String
 *            cntName nome del contenitore ('ProgressBar', 'PrevBtn', ...)
 * @param HTMLElement
 *            cntElem puntatore all'elemento contenitore nel documento HTML
 */

StdUIPlayer.prototype.setContainer = function(cntName, cntElem) {
	this['cnt' + cntName] = cntElem;

	if (cntName == 'Separator') {
		// this.cntSeparator.onclick = showhidetree;
	}
}

// --------------------------------------------------------------------------------------------

/**
 * Imposta lo scormPlayer.
 */

StdUIPlayer.prototype.setScormPlayer = function(scormPlayer) {
	this.scormPlayer = scormPlayer;
	this.scormPlayer.addListener('StdUIPlayer', this);
}

// --------------------------------------------------------------------------------------------

StdUIPlayer.prototype.scormPlayerActionPerformer = function(evType, evValue) {
	switch (evType) {
	case 'Initialize':
		if (playerConfig.autoplay == '1') {
			var currScoId = this.scormPlayer.getCurrScoId();
			var nextScoid = this.scormPlayer.getNextScoId(currScoId);
			this.scormPlayer.setNextToPlay(nextScoid, this.cntSco);
		}
		break;

	case 'Finish':
		StdUIPlayer.refresh();
		this.scormPlayer.play(null, this.cntSco);
		break;

	case 'BeforeScoLoad':
		var elem = this.cntTree.ownerDocument.getElementById(evValue);
		if (elem.className.indexOf('RunningSco') == -1) {
			elem.className += ' RunningSco';
		}
		break;
	}
}

// --------------------------------------------------------------------------------------------

/**
 * Richiamata per forzare uno ScoId da mandare in esecuzione.
 */

StdUIPlayer.prototype.scormPlayerForceScoId = function(sTarget, bTryChild) {
	// Verifica l'esistenza dello ScoId passato come target e che sia una
	// foglia.

	var bForced = false;

	if (this.scormPlayer.verifyScoId(sTarget)) {
		nextScoid = sTarget;
		this.scormPlayer.setNextToPlay(nextScoid, this.cntSco);

		// document.getElementById("consoleText").value =
		// document.getElementById("consoleText").value + "\n" + "## Forzato
		// perchÃ© esiste nextScoid: " + nextScoid;

		bForced = true;
	} else {
		if (bTryChild) {
			// PoichÃ© sTarget non Ã¨ una foglia, ricerca il primo figlio
			// foglia.

			nextScoid = this.scormPlayer.findFirstChildLeaf(sTarget);
			this.scormPlayer.setNextToPlay(nextScoid, this.cntSco);

			// document.getElementById("consoleText").value =
			// document.getElementById("consoleText").value + "\n" + "## Forzo
			// il primo figlio: " + nextScoid;

			bForced = true;
		}
	}

	// Forza lo svuotamento dell'area dell'item causando l'esecuzione del next.

	if (bForced) {
		window.uiPlayer.cntSco.location
				.replace('?sDo=wrapper&sFile=scorm_page_body.php');
	}
}

// --------------------------------------------------------------------------------------------

/**
 * Svuota un elemento di tutti i sui contenuti
 */

StdUIPlayer.prototype._removeContents = function(elem) {
	elem.innerHTML = "";
}

/**
 * disegna la progress bar
 */
StdUIPlayer.prototype.drawProgressBar = function() {
	return;
	var doc = this.cntProgressBar.ownerDocument;
	var progress = this.scormPlayer.getProgress();
	this._removeContents(this.cntProgressBar);
	this.cntProgressBar.appendChild(doc.createTextNode('Progress: '
			+ progress.completed + '/' + progress.all));
	var divProgress = doc.createElement('div');
	divProgress.className = 'scorm_progressbarstat';
	this.cntProgressBar.appendChild(divProgress);
	var w = (220 - progress.all) / progress.all;
	var posrel = 2;
	var brick = null;
	for ( var i = 0; i < progress.completed; i++, posrel += w + 1) {
		brick = doc.createElement('div');
		brick.className = 'scorm_complete';
		brick.style.width = w + 'px';
		brick.style.left = posrel + 'px';
		divProgress.appendChild(brick);
	}
	for (; i < progress.all; i++, posrel += w + 1) {
		brick = doc.createElement('div');
		brick.className = 'scorm_incomplete';
		brick.style.width = w + 'px';
		brick.style.left = posrel + 'px';
		divProgress.appendChild(brick);
	}
}

/**
 * disegna il titolo
 */
StdUIPlayer.prototype.drawTitleCP = function() {
	return;
	var doc = this.cntTitleCP.ownerDocument;
	this._removeContents(this.cntTitleCP);
	// this.cntTitleCP.appendChild(
	// doc.createTextNode(this.scormPlayer.getTitleCP()) );
	this.cntTitleCP.innerHTML = this.scormPlayer.getTitleCP();
}

// --------------------------------------------------------------------------------------------

/**
 * Disegna il bottone di prev.
 */

StdUIPlayer.prototype.drawPrevBtn = function() {
}

// --------------------------------------------------------------------------------------------

/**
 * Disegna il menÃ¹ ad albero (tree).
 */

StdUIPlayer.prototype.drawTree = function() {
	var doc = this.cntTree.ownerDocument;
	var tc = document.getElementById('TreeContainer');

	if (!tc) {
		this.cntTree.divContainer = doc.createElement('div');
		this.cntTree.divContainer.id = "TreeContainer";
		this.cntTree.appendChild(this.cntTree.divContainer);
	} else {

		this._removeContents(tc);
	}

	this.scormPlayer.parseTree(this);
}

// --------------------------------------------------------------------------------------------

/**
 * Interfaccia per ScormPlayer.parseTree. Richiamata per produrre l'output di un
 * item.
 */

StdUIPlayer.prototype.startItem = function(objItem, level) {
	if (level == 0) {
		return;
	}

	if (objItem.id == "activity_1") {
		objItem.id = "root_lo_4_package";
		sOldTitle = objItem.title;
		objItem.title = "START";

		this.startItem(objItem, level);

		objItem.id = "activity_1";
		objItem.title = sOldTitle;
	}

	var doc = this.cntTree.ownerDocument;
	var div = doc.createElement('div');
	div.className = objItem.isLeaf ? 'TreeRowClass' : 'TreeRowFolder';

	var elem = doc.createElement('a');

	if (objItem.resource
			&& (objItem.status == 'completed' || objItem.status == 'passed')) {
		var imgStatus = doc.createElement('img');
		imgStatus.className = 'icoStatus icoCompleted';
		imgStatus.title = objItem.status;
		imgStatus.alt = objItem.status;
		imgStatus.src = playerConfig.imagesPath + 'completed.gif';
		elem.appendChild(imgStatus);
		elem.title = "Completed";
	} else if (objItem.resource
			&& (objItem.status == 'incomplete' || objItem.status == 'failed')) {
		var imgStatus = doc.createElement('img');
		imgStatus.className = 'icoStatus icoIncomplete';
		imgStatus.title = objItem.status;
		imgStatus.alt = objItem.status;
		imgStatus.src = playerConfig.imagesPath + 'incomplete.gif';
		elem.appendChild(imgStatus);
	} else if (objItem.resource && objItem.prerequisites == "") {
		var imgStatus = doc.createElement('img');
		imgStatus.className = 'icoStatus icoLoked';
		imgStatus.title = 'loked';
		imgStatus.alt = 'loked';
		imgStatus.src = playerConfig.imagesPath + 'loked.gif';
		elem.appendChild(imgStatus);
	}

	iCounter = 0;
	while (iCounter < (level - 1)) {
		elem.innerHTML = elem.innerHTML
				+ '<div style="float: left; width: 10px; border: 0px;"><img src="'
				+ playerConfig.imagesPath
				+ 'dot.gif" width="1" height="1" border="0" /></div>';

		iCounter++;
	}

	elem.innerHTML = elem.innerHTML + objItem.title;
	elem.id = objItem.id;

	if (objItem.resource) {
		elem.href = '#';
		elem.onclick = treeonclick;
	} else {
		if (objItem.id == "root_lo_4_package") {
			objItem.id = "activity_1";
		}

		sURL = "?sAjaxCall=true&sAction=find_1st_child_leaf&iFrom="
				+ objItem.id + "&iOrganization="
				+ window.API_1484_11.idscorm_organization + "&iUserId="
				+ window.API_1484_11.idUser;

		var xmlhttp = new Ajax.Request(sURL, {
			method : 'get',
			asynchronous : false
		});

		elem.href = "#";
		elem.onclick = function() {
			window.uiPlayer.treeonclick(xmlhttp.transport.responseText);
		}
	}

	div.appendChild(elem);

	div.id = "cnt_" + elem.id;

	this.cntTree.divContainer.appendChild(div);
}

// --------------------------------------------------------------------------------------------

/**
 * Interfaccia per ScormPlayer.parseTree. Richiamata per chiudere l'output di un
 * item.
 */

StdUIPlayer.prototype.stopItem = function(objItem, level) {
}

// --------------------------------------------------------------------------------------------

/**
 * Interfaccia per ScormPlayer.parseTree. Richiamata ogni qualvolta un item
 * viene cliccato.
 */

StdUIPlayer.prototype.treeonclick = function(id) {
	if (disable_chapter_change) {
		return false;
	}

	if (id == "root_lo_4_package") {
		id = "activity_1";
	}

	if (document.getElementById(id).title == "Completed") {
		if (confirm("Si Ã¨ sicuri di accedere a questa sezione giÃ  conclusa?\nPremendo OK si sarÃ  costretti a completarla nuovamente.")) {
			this.scormPlayer.play(id, this.cntSco);
		}
	} else {
		this.scormPlayer.play(id, this.cntSco);
	}

	return true;
}

// --------------------------------------------------------------------------------------------

/**
 * Richiamata quando il menÃ¹ cambia lo stato di visibilitÃ .
 */

StdUIPlayer.prototype.showhidetree = function() {
	if (this.showTree) {
		this.cntTree.className = 'treecontent_hiddentree '
				+ playerConfig.playertemplate + '_menu';
		this.cntScoContent.className = 'scocontent_hiddentree';
		this.cntSeparator.className = 'separator_hiddentree';
		this.showTree = false;
		var a = this.cntSeparator.getElementsByTagName('img');
		a[0].src = playerConfig.imagesPath + '../scorm/bt_dx.png';
	} else {
		this.cntTree.className = 'treecontent ' + playerConfig.playertemplate
				+ '_menu';
		this.cntScoContent.className = 'scocontent';
		this.cntSeparator.className = 'separator';
		var a = this.cntSeparator.getElementsByTagName('img');
		a[0].src = playerConfig.imagesPath + '../scorm/bt_sx.png';
		this.showTree = true;
	}
}

// --------------------------------------------------------------------------------------------

StdUIPlayer.prototype.closePlayer = function() {
	this.scormPlayer.play(null, this.cntSco);
	// window.location.href = playerConfig.backurl;
	window.close_player = true;
}

// --------------------------------------------------------------------------------------------

/**
 * Richiamata all'on-load del frameset base del player SCORM. Inizializza il
 * player JS e le API.
 */

StdUIPlayer.initialize = function() {
	/* Crea lo ui-Player (oggetto che gestisce l'interfaccia del player) */

	window.close_player = false;

	window.uiPlayer = new StdUIPlayer();

	window.uiPlayer.setContainer('Tree', document
			.getElementById(playerConfig.idElemTree));
	window.uiPlayer.setContainer('Sco', window.frames[playerConfig.idElemSco]);
	window.uiPlayer.setContainer('ScoContent', document
			.getElementById(playerConfig.idElemScoContent));
	window.uiPlayer.setContainer('Separator', document
			.getElementById(playerConfig.idElemSeparator));
	// window.uiPlayer.setContainer('Navigation',
	// document.getElementById(playerConfig.idElemNavigation));
	// window.uiPlayer.setContainer('TitleCP',
	// document.getElementById(playerConfig.idElemTitleCP));
	// window.uiPlayer.setContainer('ProgressBar',
	// document.getElementById(playerConfig.idElemProgress));

	/* Crea le Scorm API */

	var scormapi = new ScormApiUI(playerConfig.host, playerConfig.lms_url,
			playerConfig.scormserviceid, playerConfig.idUser,
			playerConfig.idReference, playerConfig.idscorm_organization,
			playerConfig.scormVersion);

	// A seconda della versione SCORM mette a disposizione le API

	if (playerConfig.scormVersion == '1.3') {
		window.API_1484_11 = scormapi;
	} else {
		window.API = scormapi;
		window.API_1484_11 = scormapi;
	}

	scormapi.useWaitDialog(!(playerConfig.useWaitDialog == 'off'));

	/* Crea lo Scorm PLAYER */

	window.scormPlayer = new ScormPlayer();
	window.scormPlayer.setPath(playerConfig.lms_url.substring(0,
			playerConfig.lms_url.lastIndexOf("/")), playerConfig.lms_base_url);
	window.scormPlayer.setAPI(scormapi);

	StdUIPlayer.refresh();

	if (playerConfig.startFromChapter != false) {
		if (window.scormPlayer.getScoName(playerConfig.startFromChapter) != null) {
			window.scormPlayer.play(playerConfig.startFromChapter,
					window.uiPlayer.cntSco);
		}

		window.scormPlayer.play(null, window.uiPlayer.cntSco);
	} else if (playerConfig.autoplay == '1') {
		// Recupera il primo SCO-Id, quindi lo lancia.

		var scoId = this.scormPlayer.getFirstIncompleteScoId();
		window.scormPlayer.play(scoId, window.uiPlayer.cntSco);
	} else {
		window.scormPlayer.play(null, window.uiPlayer.cntSco);
	}

	this.showTree = playerConfig.showTree;

	if (!this.showTree) {
		this.showhidetree();
	}

	if (playerConfig.sSCOForAutoplay != "") {
		uiPlayer.scormPlayerForceScoId(playerConfig.sSCOForAutoplay, false);
	}

	// Esegue il keepalive tra 15 minuti.

	setTimeout("keepalive()", 15 * 60 * 1000);
}

// --------------------------------------------------------------------------------------------

keepalive = function() {
	new Ajax.Request('?sDo=wrapper&sFile=keep_alive.php?sessonly=1', {
		method : 'get',
		requestHeaders : {
			"X-Signature" : playerConfig.auth_request
		}
	});

	setTimeout("keepalive()", 15 * 60 * 1000);
}

trackUnloadOnLms = function() {
	var ajax = new Ajax.Request('?sDo=wrapper&sFile=keep_alive.php', {
		method : 'get',
		requestHeaders : {
			"X-Signature" : playerConfig.auth_request
		}
	});
}

// --------------------------------------------------------------------------------------------

/**
 * Carica il file XML contenente l'albero dei menÃ¹ quindi esegue la seconda
 * parte di inizializzazione del player.
 */

StdUIPlayer.refresh = function() {
	loadFromXml(playerConfig.xmlTreeUrl, StdUIPlayer.initialize2);
}

StdUIPlayer.initialize2 = function(xtree) {
	window.scormPlayer.setTree(xtree);
	window.uiPlayer.setScormPlayer(window.scormPlayer);
	window.uiPlayer.drawTree();
	// window.uiPlayer.drawProgressBar();
	// window.uiPlayer.drawTitleCP();
}

// --------------------------------------------------------------------------------------------

function showhidetree() {
	window.uiPlayer.showhidetree();
}

function treeonclick() {
	window.uiPlayer.treeonclick(this.id);
}

function closeScormPlayer() {
	window.uiPlayer.closePlayer();
}

function nextExist() {
	return window.scormPlayer.nextScoExists();
}

function playnextclick() {
	window.scormPlayer.playNextSco();
}

function prevExist() {
	return window.scormPlayer.prevScoExists();
}

function playprevclick() {
	window.scormPlayer.playPrevSco();
}

// --------------------------------------------------------------------------------------------
