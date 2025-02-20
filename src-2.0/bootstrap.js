// bootstrap.js
var ZoteroClockTimer;

function log(msg) {
	Zotero.debug("Zotero Clock Timer: " + msg);
}

function install() {
	log("Installed 1.0");
}

async function startup({ id, version, rootURI }) {
	log("Starting 1.0");

	Zotero.PreferencePanes.register({
		pluginID: 'zotero-clock-timer@example.com',
		src: rootURI + 'preferences.xhtml',
		scripts: [rootURI + 'preferences.js']
	});

	Services.scriptloader.loadSubScript(rootURI + 'zotero-clock-timer.js');
	ZoteroClockTimer.init({ id, version, rootURI });
	ZoteroClockTimer.addToAllWindows();
}

function onMainWindowLoad({ window }) {
	ZoteroClockTimer.addToWindow(window);
}

function onMainWindowUnload({ window }) {
	ZoteroClockTimer.removeFromWindow(window);
}

function shutdown() {
	log("Shutting down 1.0");
	ZoteroClockTimer.removeFromAllWindows();
	ZoteroClockTimer = undefined;
}

function uninstall() {
	log("Uninstalled 1.0");
}
