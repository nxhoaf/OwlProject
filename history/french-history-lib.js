FrHistoryLib = {};

FrHistoryLib.getFaitPartieDe = function (element) {
	var properties = {};
	var isEmpty = true;

	// get "faitPartieDe" attribute, if any
	var fptNS = OwlLib.nameSpaces["programme_histoire_college_france"];
	var faitPartieDe = element.
			getElementsByTagNameNS(	fptNS, 
									CONSTANT.FAIT_PARTIE_DE)[0];
	if ((faitPartieDe != null) 
			&& (faitPartieDe.
					getAttribute(CONSTANT.RESOURCE) != null)) {
		value = faitPartieDe.getAttribute(CONSTANT.RESOURCE);
		// Found, return
		return value;
	}
	return null;
}

FrHistoryLib.getSubThemesOf = function (theme, subThemes) {
	// get all subthemes
//	var subThemes = OwlLib.getNamedIndividuals(
//			"Programme_Histoire_College_France#soustheme"); 
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
		stProperties[CONSTANT.FAIT_PARTIE_DE] = faitPartieDe;
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
		stProperties[CONSTANT.FAIT_PARTIE_DE] = faitPartieDe;
		// Save it
		
		result.push(stProperties);
	}
	
	return result;
}
