
OwlLib = {};

OwlLib.constant = {
	ABOUT: "rdf:about",
	TYPE : "rdf:type", 
	RESOURCE : "rdf:resource", 
	LABEL : "rdfs:label", 
	FAIT_PARTIE_DE : "programme_histoire_college_france:faitPartieDe", 
	PROGRAM : "programme_histoire_college_france", 
	ORGANIZATION : "organisation-systeme-scolaire-francais"
}

/**
 * Load
 */
OwlLib.loadOwl = function(url) {
	// TODO: Regrex to test url
	var xhr = {}; // XHR object
	var xmlDoc; // result
	
	// Create a new XmlHttpRequest Object
	if (window.XMLHttpRequest) {
		// code for IE7+, Firefox, Chrome, Opera, Safari
		xhr = new XMLHttpRequest();
	} else {// code for IE6, IE5
		xhr = new ActiveXObject("Microsoft.XMLHTTP");
	}
	// use onreadystatechange instead of onload as it's supported by all browser
//	xhr.onreadystatechange=function() {
//		if ((xhr.readyState == 4) && (xhr.status == 200)) {
//			
//		}
//	}
	
	xhr.open("GET", url, false); // using sync
	xhr.send();
	xmlDoc = xhr.response;
	xmlDoc = (new DOMParser()).parseFromString(xmlDoc, 'text/xml');
	OwlLib.xmlDoc = xmlDoc;
	OwlLib.nameSpaces = OwlLib.loadNameSpace();
}

/**
 * Load all namespaces in the owl file, the result it an object contains all 
 * namspaces and its full names.
 * For example, if we have:
 * owl is actually "http://www.w3.org/2002/07/owl#"
 * xsd is actually "http://www.w3.org/2001/XMLSchema#"
 * and so on...
 * then we have an object namspaces where: 
 * namespaces[owl] = "http://www.w3.org/2002/07/owl#"
 * namespaces[xsd] = "http://www.w3.org/2001/XMLSchema#"
 */
OwlLib.loadNameSpace = function() {
	console.log("[OwlLib] [getNameSpace] - begin");
	var result = {}; // store the result
	
//	/**
//	 * Inner function to parse name space
//	 * @param nameSpaceStr the namespaceStr used to parse
//	 * @returns an object contain all namespaces.
//	 */
//	var getNs = function(nameSpaceStr) {
//		var nameSpace = {};
//		var subNameSpace = {};
		
//		// Non trivial case
//		if ((nameSpaceStr != null) || (nameSpaceStr.length == 0)) {
//			
//			// Get the begin and and index to extract the entity's content
//			var begin = nameSpaceStr.indexOf("<!ENTITY");
//			var end = nameSpaceStr.indexOf(">");
//			
//			if ((begin == -1) || (end == -1) || (begin >= end)) { // not found
//				return null;
//			}
//			
//			// Get the content and save it to nameSpace variable
//			begin = begin + "<!ENTITY".length; 
//			var item = nameSpaceStr.substring(begin, end); // ok, get one item
//			item = item.trim();
//			var keyValue = item.split(" ");
//			
//			// Replace all double quote, here I mean first and last double quote
//			nameSpace[keyValue[0]] = keyValue[1].replace(/"/g,'');
//			
//			// Continue searching with the rest
//			var tail = nameSpaceStr.substring(end + 1);
//			if (tail == null) {
//				return nameSpace;
//			}
//			tail = tail.trim();
//			subNameSpace = getNs(tail); // recursive searching
//			
//			// Ok, collect all of data and then return
//			if (subNameSpace != null) {
//				for (var key in subNameSpace) {
//					nameSpace[key] = subNameSpace[key];
//				}
//			}
//			return nameSpace;
//		} else { // Trivial case
//			return null;
//		}
//	}
//	
//	if ((OwlLib.xmlDoc == null) // Don't have xmldoc
//			|| (OwlLib.xmlDoc.doctype == null) // Don't have doctype
//			// Don't have internalSubset
//			|| (OwlLib.xmlDoc.doctype.internalSubset == null)) {
//		return null;
//	}
//
//	// Normalize namespaceStr
//	var nameSpaceStr = OwlLib.xmlDoc.doctype.internalSubset;
//	nameSpaceStr = nameSpaceStr.replace("\n", " ");
//	nameSpaceStr = nameSpaceStr.replace(/\s{2,}/g," ");
//	nameSpaceStr = nameSpaceStr.trim();
//	
//	// Parse it to get the result
//	result = getNs(nameSpaceStr);
//	console.log("*************");
//	for (var key in result) {
//		console.log("key: " + key + " value: " + result[key]);
//	}
//	console.log("[OwlLib] [getNameSpace] - begin");
	var result = {};
	result["programme_histoire_college_france"] = "Programme_Histoire_College_France#";
	result["organisation-systeme-scolaire-francais"] = "http://www.semanticweb.org/deslis/ontologies/2013/1/organisation-systeme-scolaire-francais#";
	
	return result;
}

/**
 * Get all NamedIndividual triples in this owl file
 * @param type type of named individual
 * @param nameSpaceOfType name space of the current type
 * @returns all satisfied NamedIndividual triples
 * ex: themes = getNamedIndividuals("theme", "programme_histoire_college_france");
 * will return all NamedIndividual whose type is "theme" 
 */
OwlLib.getNamedIndividuals = function(type, nameSpaceOfType) {
	console.log("[OwlLib] [getNamedIndidualTriples] - begin");
	
	// Store result
	var namedIndividuals = [];
	// Named Individual elements
	niElements = OwlLib.xmlDoc.getElementsByTagName("owl:NamedIndividual");
	
	/**
	 * Inner function to get NamedIndividual
	 * @niElement : namedIndividual Element
	 * @niType : named Individual Type (full name) 
	 */
	var getNamedIndividual = function(niElement, niType) {
		var item = {};
		var isNull = true; // check if item is null;
		var value; // Store temporary value
		
		
		// Get rdfType, if any
		var rdfType = niElement.
				getElementsByTagName(OwlLib.constant.TYPE)[0];
		if ((rdfType != null) // found type attribute 
				&& (rdfType.getAttribute(OwlLib.constant.RESOURCE) != null)) {
			// current type
			currentType = rdfType.getAttribute(OwlLib.constant.RESOURCE);
			
			// Found a type, but not matched, skip it
			if ((niType != null) && (niType != currentType)) {
				return;
			}
			
			// else (niType == null), just get all type
			item[OwlLib.constant.TYPE] = currentType;
			isNull = false; // marked as not null
		}
		
		
		// get label, if any
		var label = niElement.
				getElementsByTagName(OwlLib.constant.LABEL)[0];
		if (label != null) {
			item[OwlLib.constant.LABEL] = label.textContent;
			isNull = false; // marked as not null
		}
		
		
		// get "faitPartieDe" attribute, if any
		var faitPartieDe = niElement.
				getElementsByTagName(OwlLib.constant.FAIT_PARTIE_DE)[0];
		if ((faitPartieDe != null) 
				&& (faitPartieDe.
						getAttribute(OwlLib.constant.RESOURCE) != null)) {
			value = faitPartieDe.getAttribute(OwlLib.constant.RESOURCE);
			item[OwlLib.constant.FAIT_PARTIE_DE] = value;
			isNull = false; // marked as not null
		}
		
		// Verify and return the result
		if (isNull) {
			return null; 
		} else {
			// Add more details to this item and then return it
			var about = niElement.getAttribute(OwlLib.constant.ABOUT) 
			if (about != null) {
				item[OwlLib.constant.ABOUT] = about; 
			}
			return item;
		}
	}
	
	// Create Named individual type (full name)
	var niType = null;
	if ((type != null) && (nameSpaceOfType != null)) {
		// Named individual name space
		var niNameSpace = OwlLib.nameSpaces[nameSpaceOfType];
		niType = niNameSpace + type;
	}
	
	// Get all Named Individual which match the type
	for (var i = 0; i < niElements.length; i++) {
		var ni = getNamedIndividual(niElements[i], niType);
		if (ni != null) {
			namedIndividuals.push(ni);
		}
		
	}
	
//	for (var i = 0; i < namedIndividuals.length; i++) {
//		var namedIndividual = namedIndividuals[i];
//		console.log(i + "  ------------------------------")
//		for (var key in namedIndividual) {
//			console.log("	key:   " + key);
//			console.log("	value: " + namedIndividual[key]);
//		}
//	}
	
	return namedIndividuals;
}


//OwlLib.getSubThemesOf = function (theme, nameSpaceOfTheme) {
//	var subThemes = OwlLib.getNamedIndividuals("soustheme", 
//			"programme_histoire_college_france"); // get all subthemes
//	
//	// NamedIndividual theme (full name)
//	var fullName = null;
//	if ((theme != null) && (nameSpaceOfTheme != null)) {
//		var namespace = OwlLib.nameSpaces[nameSpaceOfTheme];
//		fullName = namespace + theme;
//	}
//	
//	var result = []; // store result
//	for (var i = 0; i < subThemes.length; i++) {
//		var subTheme = subThemes[i];
//		var faitPartieDe = subTheme[OwlLib.constant.FAIT_PARTIE_DE];
//		if ((faitPartieDe != null) && (faitPartieDe == fullName)) {
//			result.push(subTheme);
//		}
//	}
//	
//	
//	console.log("********************************************");
//	console.log("SubThemes of: " + theme);
//	console.log("********************************************");
//	
//	for (var i = 0; i < result.length; i++) {
//		var subTheme = result[i];
//		console.log(i + "  ------------------------------")
//		for (var key in subTheme) {
//			console.log("	key:   " + key);
//			console.log("	value: " + subTheme[key]);
//		}
//	}
//	
//	return result;
//}

OwlLib.getSubThemesOf = function (theme) {
	var subThemes = OwlLib.getNamedIndividuals("soustheme", 
			"programme_histoire_college_france"); // get all subthemes
	
	var result = []; // store result
	for (var i = 0; i < subThemes.length; i++) {
		var subTheme = subThemes[i];
		var faitPartieDe = subTheme[OwlLib.constant.FAIT_PARTIE_DE];
		if ((faitPartieDe != null) && (faitPartieDe == theme)) {
			result.push(subTheme);
		}
	}
	
	
	console.log("********************************************");
	console.log("SubThemes of: " + theme);
	console.log("********************************************");
	
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



/**
 * Get all themes
 */
OwlLib.getAllThemes = function (namedIndividuals) {
	var themes = [];
	
	// Get name space
	var themeNs = OwlLib.nameSpaces[OwlLib.constant.PROGRAM];
	var themeType = themeNs + "theme";
	// Loop all namedIndividuals
	for (var i = 0; i < namedIndividuals.length; i++) {
		var ni = namedIndividuals[i];
		// If found a namedIndividuals with type = themeType, save it!
		if (ni[OwlLib.constant.TYPE] == themeType) {
			themes.push(ni);
		}
	}
	
	for (var i = 0; i < themes.length; i++) {
		var theme = themes[i];
		console.log(i + "  ------------------------------")
		for (var key in theme) {
			console.log("	key:   " + key);
			console.log("	value: " + theme[key]);
		}
	}
	
	return themes;
	
} 

OwlLib.getAllSubThemes = function (namedIndividuals) {
	var subThemes = [];
	
	// Get name space
	var subThemeNs = OwlLib.nameSpaces[OwlLib.constant.PROGRAM];
	var subThemeType = subThemeNs + "soustheme";
	// Loop all namedIndividuals
	for (var i = 0; i < namedIndividuals.length; i++) {
		var ni = namedIndividuals[i];
		// If found a namedIndividuals with type = themeType, save it!
		if (ni[OwlLib.constant.TYPE] == subThemeType) {
			subThemes.push(ni);
		}
	}
	
	for (var i = 0; i < subThemes.length; i++) {
		var subTheme = subThemes[i];
		console.log(i + "  ------------------------------")
		for (var key in subTheme) {
			console.log("	key:   " + key);
			console.log("	value: " + subTheme[key]);
		}
	}
	
	return subThemes;
}








