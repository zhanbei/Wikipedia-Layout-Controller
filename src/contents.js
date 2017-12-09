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

function getDomStyle(id) {
	return document.getElementById(id) ? document.getElementById(id).style : {};
}

function fnSetMaxWidth(isSet, id, value) {
	getDomStyle(id).maxWidth = isSet ? value : '';
}

function fnSetMargin(isSet, id, value) {
	getDomStyle(id).margin = isSet ? value : '';
}

function fnHideDom(isHide, id) {
	getDomStyle(id).display = isHide ? 'none' : '';
}

function fnModifyDoms(pref) {
	// Limit content width.
	fnSetMaxWidth(pref.isLimitContentWidth, 'firstHeading', pref.contentMaxWidth);
	fnSetMaxWidth(pref.isLimitContentWidth, 'bodyContent', pref.contentMaxWidth);
	fnSetMaxWidth(pref.isLimitContentWidth, 'footer', pref.contentMaxWidth);
	// Centralize main content.
	fnSetMargin(pref.isCentralizeContent, 'firstHeading', pref.contentMargin);
	fnSetMargin(pref.isCentralizeContent, 'bodyContent', pref.contentMargin);
	fnSetMargin(pref.isCentralizeContent, 'footer', pref.contentMargin);
	// Hide header.
	fnHideDom(pref.isHideHeader, 'mw-head');
	fnHideDom(pref.isHideHeader, 'mw-page-base');
	fnHideDom(pref.isHideHeader, 'mw-head-base');
	// Hide logo.
	fnHideDom(pref.isHideLogo, 'p-logo');
	// Hide side-bar navigation.
	const navigation = document.getElementsByClassName('portal');
	for (let i = 0; i < navigation.length; i++) {
		navigation[i].style.display = pref.isHideNavigation ? 'none' : '';
	}
	const content = getDomStyle("content");
	const footer = getDomStyle("footer");
	if (pref.isHideLogo && pref.isHideNavigation) {
		// Set margin left to 0.
		content.marginLeft = '0';
		footer.marginLeft = '0';
	} else {
		// Reset left margin of content.
		content.marginLeft = '11em';
		footer.marginLeft = '11em';
	}
}

let isWideMonitor = true;
let isFirstRender = true;
let widthBreakpoint;

function fnRearrangeLayout() {
	if (!isFirstRender) {
		let t = window.innerWidth > widthBreakpoint;
		if (t === isWideMonitor) {
			return;
		}
		isWideMonitor = t;
	}
	/** @namespace chrome.storage.sync */
	chrome.storage.sync.get(storageKey, function (preferences) {
		preferences = getPreferences(preferences[storageKey]);
		if (!preferences.isEnabled) {return;}
		widthBreakpoint = preferences.widthBreakpoint;
		isWideMonitor = window.innerWidth > widthBreakpoint;
		if (isWideMonitor) {
			fnModifyDoms(preferences.wideMonitor);
		} else {
			fnModifyDoms(preferences.narrowMonitor);
		}
		isFirstRender = false;
	});
}

fnRearrangeLayout();

window.addEventListener("resize", fnRearrangeLayout);

/** @namespace chrome.storage.onChanged */
chrome.storage.onChanged.addListener(function () {
	// Force to refresh on data changes.
	isFirstRender = true;
	fnRearrangeLayout();
});
