EducationProgram = function (owlObject) {
	var educationProgram = {};
	
	/**
	 * Get is 'isPartOf' Property of an element
	 * @param element the element to get property
	 * @returns 'isPartOf' property if any, or null
	 */
	educationProgram.getIsPartOf = function (element) {
		var properties = {};
		var isEmpty = true;
		
		
		
		var isPartOfTag = element.
				getElementsByTagName(CONSTANT.IS_PART_OF)[0];
		
		if (isPartOfTag == null) {
			var isPartOfNS = owlObject.
					nameSpaces["Programme_Histoire_College_France"];
			
			isPartOfTag = element.
					getElementsByTagNameNS(isPartOfNS, CONSTANT.IS_PART_OF)[0];
		}
		
		
		
		
		if ((isPartOfTag != null) 
				&& (isPartOfTag.
						getAttribute(CONSTANT.RESOURCE) != null)) {
			value = isPartOfTag.getAttribute(CONSTANT.RESOURCE);
			// Found, return
			return value;
		}
		return null;
	}

	/**
	 * Find all sub theme of a theme 
	 */
	educationProgram.getSubThemesOf = function (theme, allSubThemes) {
		var result = []; // store result
		console.log("theme: " + theme);
		console.log("allSubtheme: " + allSubThemes.length);
		for (var i = 0; i < allSubThemes.length; i++) {
			var subTheme = allSubThemes[i];
			// Get "isPartOf" property
			var isPartOf = educationProgram.getIsPartOf(subTheme);
			// If this sub theme doesn't belong to the theme, we continue
			if (isPartOf == null || isPartOf != theme) {
				continue;
			}
			
			// Found one, Get other properties
			var stProperties = owlObject.getMetaData(subTheme);
			stProperties[CONSTANT.IS_PART_OF] = isPartOf;
			// Save it
			result.push(stProperties);
		}
		
		return result;
	}

	educationProgram.getKnowledgeOf = function (theme, prefix) {
		var knowledge = 
				owlObject.getNamedIndividuals( prefix + "knowledge");
		console.log("knowledge: " + theme + "***" + prefix);
		console.log("length: " + knowledge.length);
		var result = []; // store result
		for (var i = 0; i < knowledge.length; i++) {
			var item = knowledge[i];
			
			// Get "isPartOf" property
			var isPartOf = educationProgram.getIsPartOf(item);
			console.log("isPartOf: " + isPartOf);
			// If this sub theme doesn't belong to the theme, we continue
			if (isPartOf == null || isPartOf != theme) {
				continue;
			}
			
			// Found one, Get other properties
			var stProperties = owlObject.getMetaData(item);
			stProperties[CONSTANT.IS_PART_OF] = isPartOf;
			// Save it
			
			result.push(stProperties);
		}
		
		return result;
	}
	
	
	educationProgram.createProgramMenu = function(filter, prefix) {
		var programMenu = [];
		var themes = owlObject.getNamedIndividuals(prefix + "subtheme");
		
		for (var i = 0; i < themes.length; i++) {
			var theme = themes[i];
			if (educationProgram.getIsPartOf(theme) != filter) {
				continue;
			}
			
			
			var themeMetadata = owlObject.getMetaData(theme);
			var menuItem = {}; // contain menu item
			menuItem.label = themeMetadata[CONSTANT.LABEL];
			menuItem.about = themeMetadata[CONSTANT.ABOUT];
			var subThemes = educationProgram.
					getSubThemesOf(themeMetadata[CONSTANT.ABOUT], themes);
			
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
			programMenu.push(menuItem);
		}
		
		return programMenu;
		
	}
	
	return educationProgram;
};


