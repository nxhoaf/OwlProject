FrHistoryLib = function (owlLib) {
	var frHistoryLib = {};
	
	frHistoryLib.getFaitPartieDe = function (element) {
		var properties = {};
		var isEmpty = true;

		// get "faitPartieDe" attribute, if any
		// var fptNS = OwlLib.nameSpaces["programme_histoire_college_france"];
		
		var fptNS = "Programme_Histoire_College_France#";
		
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

	frHistoryLib.getSubThemesOf = function (theme, subThemes) {
		// get all subthemes
//		var subThemes = OwlLib.getNamedIndividuals(
//				"Programme_Histoire_College_France#soustheme"); 
		var result = []; // store result
		for (var i = 0; i < subThemes.length; i++) {
			var subTheme = subThemes[i];
			
			// Get "faitPartieDe" property
			var faitPartieDe = frHistoryLib.getFaitPartieDe(subTheme);
			// If this sub theme doesn't belong to the theme, we continue
			if (faitPartieDe == null || faitPartieDe != theme) {
				continue;
			}
			
			// Found one, Get other properties
			var stProperties = owlLib.getMetaData(subTheme);
			stProperties[CONSTANT.FAIT_PARTIE_DE] = faitPartieDe;
			// Save it
			result.push(stProperties);
		}
		
		return result;
	}

	frHistoryLib.getKnowledgeOf = function (theme) {
		var knowledge = owlLib.getNamedIndividuals( 
				"Programme_Histoire_College_France#knowledge");
		
		var result = []; // store result
		for (var i = 0; i < knowledge.length; i++) {
			var item = knowledge[i];
			
			// Get "faitPartieDe" property
			var faitPartieDe = frHistoryLib.getFaitPartieDe(item);
			// If this sub theme doesn't belong to the theme, we continue
			if (faitPartieDe == null || faitPartieDe != theme) {
				continue;
			}
			
			// Found one, Get other properties
			var stProperties = owlLib.getMetaData(item);
			stProperties[CONSTANT.FAIT_PARTIE_DE] = faitPartieDe;
			// Save it
			
			result.push(stProperties);
		}
		
		return result;
	}
	
	
	frHistoryLib.getMenuData = function() {
		var menuData = [];
		var themes = owlLib.getNamedIndividuals(
				"file:/C:/Documents/Dvpt/ILOTLeLivreScolaire/Code/ILOT/Programme_Histoire_College_France#subtheme");
		
		
		for (var i = 0; i < themes.length; i++) {
			var theme = themes[i];
			var themeMetadata = owlLib.getMetaData(theme);
			var menuItem = {}; // contain menu item
			menuItem.label = themeMetadata[CONSTANT.LABEL];
			menuItem.about = themeMetadata[CONSTANT.ABOUT];
			
			// Get its sub themes
			var allSubThemes = owlLib.getNamedIndividuals(
					"Programme_Histoire_College_France#subtheme"); 
			var subThemes = frHistoryLib.
					getSubThemesOf(themeMetadata[CONSTANT.ABOUT], allSubThemes);
			
			// Each menuItem may have zero or many sub themes;
			menuItem.subItems = []; 
			if ((subThemes != null) && (subThemes.length != 0)) {
				for (var j = 0; j < subThemes.length; j++) {
					var subTheme = subThemes[j];
					var subThemeItem = {};
					subThemeItem.label = subTheme[CONSTANT.LABEL];
					subThemeItem.about = subTheme[CONSTANT.ABOUT];
					menuItem.subItems.push(subThemeItem);
				}
			} 
			menuData.push(menuItem);
		}
		
		return menuData;
		
	}
	
	return frHistoryLib;
};


