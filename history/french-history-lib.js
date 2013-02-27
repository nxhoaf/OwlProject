FrHistoryLib = {};
FrHistoryLib.constant = {};

//************ INITIALIZATION: create constant based on browser info***********
/**
 * Get browser info
 * http://stackoverflow.com/questions/5916900/detect-version-of-browser
 */
FrHistoryLib.getBrowserInfo = function() {
	var N = navigator.appName, ua = navigator.userAgent, tem;
	var M = ua
			.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
	if (M && (tem = ua.match(/version\/([\.\d]+)/i)) != null)
		M[2] = tem[1];
	M = M ? [ M[1], M[2] ] : [ N, navigator.appVersion, '-?' ];
	
	return M;
};


//For now, our library works only with chrome and firefox
FrHistoryLib.constant.firefox = {
	FAIT_PARTIE_DE 	: "faitPartieDe",
	ORGANIZATION 	: "organisation-systeme-scolaire-francais",
	PROGRAM 		: "programme_histoire_college_france"	
}

FrHistoryLib.constant.chrome = {
	FAIT_PARTIE_DE 	: "faitPartieDe",
	ORGANIZATION 	: "organisation-systeme-scolaire-francais",
	PROGRAM 		: "programme_histoire_college_france"
}

var browserInfo = FrHistoryLib.getBrowserInfo();
var browserName = browserInfo[0];
browserName = browserName.toLowerCase();
var browserVersion = browserInfo[0];
browserVersion = browserVersion.toLowerCase();
// Config constant based on browser type
if ("firefox" === browserName) {
	FrHistoryLib.constant = {
		FAIT_PARTIE_DE 	: FrHistoryLib.constant.firefox.FAIT_PARTIE_DE, 
		ORGANIZATION 	: FrHistoryLib.constant.firefox.ORGANIZATION, 
		PROGRAM 		: FrHistoryLib.constant.firefox.PROGRAM 
	}
} else { // chrome
	FrHistoryLib.constant = {
		FAIT_PARTIE_DE 	: FrHistoryLib.constant.chrome.FAIT_PARTIE_DE, 
		ORGANIZATION 	: FrHistoryLib.constant.chrome.ORGANIZATION, 
		PROGRAM 		: FrHistoryLib.constant.chrome.PROGRAM 
	}
}
//********************** END OF INITIALIZATION *********************************

FrHistoryLib.getFaitPartieDe = function (element) {
	var properties = {};
	var isEmpty = true;

	// get "faitPartieDe" attribute, if any
	var fptNS = OwlLib.nameSpaces["programme_histoire_college_france"];
	var faitPartieDe = element.
			getElementsByTagNameNS(	fptNS, 
									FrHistoryLib.constant.FAIT_PARTIE_DE)[0];
	if ((faitPartieDe != null) 
			&& (faitPartieDe.
					getAttribute(OwlLib.constant.RESOURCE) != null)) {
		value = faitPartieDe.getAttribute(OwlLib.constant.RESOURCE);
		// Found, return
		return value;
	}
	return null;
}

FrHistoryLib.getSubThemesOf = function (theme) {
	// get all subthemes
	var subThemes = OwlLib.getNamedIndividuals(
			"Programme_Histoire_College_France#soustheme"); 
	var result = []; // store result
	for (var i = 0; i < subThemes.length; i++) {
		var subTheme = subThemes[i];
		
		// Get "faitPartieDe" property
		var faitPartieDe = FrHistoryLib.getFaitPartieDe(subTheme);
		// If this sub theme doesn't belong to the theme, we continue
		if (faitPartieDe == null || faitPartieDe != theme) {
			continue;
		}
		
		// Found one, Get other properties
		var stProperties = OwlLib.getMetaData(subTheme);
		stProperties[FrHistoryLib.constant.FAIT_PARTIE_DE] = faitPartieDe;
		// Save it
		result.push(stProperties);
	}
	
	return result;
}

FrHistoryLib.getKnowledgeOf = function (theme) {
	var knowledge = OwlLib.getNamedIndividuals( 
			"Programme_Histoire_College_France#connaissance");
	
	var result = []; // store result
	for (var i = 0; i < knowledge.length; i++) {
		var item = knowledge[i];
		
		// Get "faitPartieDe" property
		var faitPartieDe = FrHistoryLib.getFaitPartieDe(item);
		// If this sub theme doesn't belong to the theme, we continue
		if (faitPartieDe == null || faitPartieDe != theme) {
			continue;
		}
		
		// Found one, Get other properties
		var stProperties = OwlLib.getMetaData(item);
		stProperties[FrHistoryLib.constant.FAIT_PARTIE_DE] = faitPartieDe;
		// Save it
		
		result.push(stProperties);
	}
	
	for (var i = 0; i < result.length; i++) {
		var subTheme = result[i];
		console.log(i + "  ------------------------------")
		for (var key in subTheme) {
			console.log("	key:   " + key);
			console.log("	value: " + subTheme[key]);
		}
	}
	return result;
}
