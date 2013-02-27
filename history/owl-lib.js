OwlLib = {};
OwlLib.constant = {};


/**
 * Helper function: Get browser info
 * http://stackoverflow.com/questions/5916900/detect-version-of-browser
 */
OwlLib.getBrowserInfo = function() {
	var N = navigator.appName, ua = navigator.userAgent, tem;
	var M = ua
			.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
	if (M && (tem = ua.match(/version\/([\.\d]+)/i)) != null)
		M[2] = tem[1];
	M = M ? [ M[1], M[2] ] : [ N, navigator.appVersion, '-?' ];
	
	return M;
};
// For now, our library works only with chrome and firefox
OwlLib.constant = {
	ABOUT			: "rdf:about",
	LABEL 			: "label",
	NAMED_INVIDUAL 	: "NamedIndividual",
	RDF				: "RDF", 
	RESOURCE 		: "rdf:resource", 
	TYPE 			: "type",  
}

/**
 * Load Owl file
 */
OwlLib.loadOwl = function(url) {
	console.log("[OwlLib] [loadOwl] - begin");
	
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
	
	xhr.open("GET", url, false); // using sync
	xhr.send();
	xmlDoc = xhr.response;
	xmlDoc = (new DOMParser()).parseFromString(xmlDoc, 'text/xml');
	OwlLib.xmlDoc = xmlDoc;
	OwlLib.nameSpaces = OwlLib.loadNameSpace();
	
	console.log("[OwlLib] [loadOwl] - end");
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
	console.log("[OwlLib] [loadNameSpace]");
	var result = {}; // store the result
	// Named Individual elements
	var rdfNs = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
	var rdf= OwlLib.xmlDoc.
			getElementsByTagNameNS(rdfNs,OwlLib.constant.RDF)[0];
	var attributes = rdf.attributes;
	for (var i = 0; i < attributes.length; i++) {
		attribute = attributes[i];
		
		// Must be not null
		if ((attribute == 'undefined') && (attribute == null) ) {
			continue;
		}
		
		var attName = attribute.nodeName;
		attName = attName.replace("xmlns:", ""); // remove default namespace
		
		result[attName] = attribute.nodeValue;
	}
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
OwlLib.getNamedIndividuals = function(type) {
	// Store result
	var namedIndividuals = [];
	var owlNS = OwlLib.nameSpaces["owl"];
	// Named Individual elements
	var niElements = OwlLib.xmlDoc.
			getElementsByTagNameNS(owlNS, OwlLib.constant.NAMED_INVIDUAL);
	// Get all Named Individual which match the type
	for (var i = 0; i < niElements.length; i++) {
		// var ni = getNamedIndividual(niElements[i], type);
		var niElement = niElements[i];
		var typeNS = OwlLib.nameSpaces["rdf"];
		var rdfType = niElement.
				getElementsByTagNameNS(typeNS,OwlLib.constant.TYPE)[0];
//		var rdfType = niElement.getElementsByTagName(OwlLib.constant.TYPE)[0];
		
		// Get rdfType, if any
		if (rdfType != null) { // found type attribute
			var currentType = rdfType.getAttribute(OwlLib.constant.RESOURCE); 
		}
		
		// Found a type, but not matched, skip it
		if ((type != null) && (type == currentType)) {
			namedIndividuals.push(niElement);
		}
	}
	return namedIndividuals;
}

OwlLib.getMetaData = function(namedIndividual) {
	var properties = {};
	var isEmpty = true;
	
	// Get element type
	var typeNS = OwlLib.nameSpaces["rdf"];
	var rdfType = namedIndividual.
			getElementsByTagNameNS(typeNS, OwlLib.constant.TYPE)[0];
	var elementType = rdfType.getAttribute(OwlLib.constant.RESOURCE);
	
	if (elementType != null) {
		properties[OwlLib.constant.TYPE] = elementType;
		isEmpty = false;
	}
	
	
	// get label, if any
	var labelNS = OwlLib.nameSpaces["rdfs"]; // 
	var label = namedIndividual.
			getElementsByTagNameNS(labelNS, OwlLib.constant.LABEL)[0];
	if (label != null) {
		properties[OwlLib.constant.LABEL] = label.textContent;
		isEmpty = false;
	}
	
	if (!isEmpty) {
		// Add more details to this item and then return it
		var about = namedIndividual.getAttribute(OwlLib.constant.ABOUT) 
		if (about != null) {
			properties[OwlLib.constant.ABOUT] = about; 
		}
		return properties; 
	} else {
		return null;
	}
}

