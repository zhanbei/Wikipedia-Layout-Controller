'use strict';

const storageKey = 'key';
const defaultPreferences = {
	isEnabled: true,
	widthBreakpoint: 1000,
	narrowMonitor: {
		isLimitContentWidth: false,
		contentMaxWidth: '900px',
		isCentralizeContent: false,
		contentMargin: '0 auto',
		isHideHeader: false,
		isHideLogo: true,
		isHideNavigation: true,
	},
	wideMonitor: {
		isLimitContentWidth: true,
		contentMaxWidth: '900px',
		isCentralizeContent: true,
		contentMargin: '0 auto',
		isHideHeader: false,
		isHideLogo: false,
		isHideNavigation: false,
	}
};

function getPreferences(preferences) {
	try {
		preferences = preferences ? JSON.parse(preferences) : defaultPreferences;
		preferences.narrowMonitor = preferences.narrowMonitor || defaultPreferences.narrowMonitor;
		preferences.wideMonitor = preferences.wideMonitor || defaultPreferences.wideMonitor;
		return preferences;
	} catch (ex) {
		return defaultPreferences;
	}
}

function fnSetValues(form, pref) {
	const inputs = form.getElementsByTagName('input');
	for (let i = 0; i < inputs.length; i++) {
		let input = inputs[i];
		if (input.type === 'checkbox') {
			input.checked = pref[input.name];
		} else {
			input.value = pref[input.name];
		}
	}
}

function fnRestorePreferences() {
	// chrome.storage = {sync: {get: (items, callback) => callback(items)}};
	chrome.storage.sync.get(storageKey, function (preferences) {
		preferences = getPreferences(preferences[storageKey]);
		document.getElementById('isEnabled').checked = preferences.isEnabled;
		document.getElementById('widthBreakpoint').value = preferences.widthBreakpoint;
		fnSetValues(document.getElementById('wide-monitor'), preferences.wideMonitor);
		fnSetValues(document.getElementById('narrow-monitor'), preferences.narrowMonitor);
	});
}

function fnGetValues(form) {
	const pref = {};
	const inputs = form.getElementsByTagName('input');
	for (let i = 0; i < inputs.length; i++) {
		let input = inputs[i];
		pref[input.name] = input.type === 'checkbox' ? input.checked : input.value;
	}
	return pref;
}

function fnSavePreferences() {
	const isEnabled = document.getElementById('isEnabled').checked;
	const widthBreakpoint = document.getElementById('widthBreakpoint').value;
	const wideMonitor = fnGetValues(document.getElementById('wide-monitor'));
	const narrowMonitor = fnGetValues(document.getElementById('narrow-monitor'));
	const preferences = {
		isEnabled: isEnabled,
		widthBreakpoint: widthBreakpoint,
		narrowMonitor: narrowMonitor,
		wideMonitor: wideMonitor
	};
	/** @namespace chrome.storage.sync */
	chrome.storage.sync.set({[storageKey]: JSON.stringify(preferences)}, function () {
		// Update status to let user know options were saved.
		const status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function () {
			status.textContent = '';
		}, 750);
	});
}

function fnResetNarrowMonitor() {
	fnSetValues(document.getElementById('narrow-monitor'), defaultPreferences.narrowMonitor);
}

function fnResetWideMonitor() {
	fnSetValues(document.getElementById('wide-monitor'), defaultPreferences.wideMonitor);
}

document.addEventListener('DOMContentLoaded', fnRestorePreferences);
document.getElementById('save-preferences').addEventListener('click', fnSavePreferences);
document.getElementById('reset-narrow-monitor').addEventListener('click', fnResetNarrowMonitor);
document.getElementById('reset-wide-monitor').addEventListener('click', fnResetWideMonitor);
