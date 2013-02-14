
OwlLib = {};
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
	xhr.onreadystatechange=function() {
		if ((xhr.readyState == 4) && (xhr.status == 200)) {
			xmlDoc = xhr.responseXML
			OwlLib.xmlDoc = xmlDoc;
			
			// OwlLib.getNamedIndividuals();
		}
	}
	
	xhr.open("GET", url, false); // asyn
	xhr.send();
}

/**
 * Get all named individual triples in this file
 */
OwlLib.getNamedIndividuals = function() {
	console.log("[OwlLib] [getNamedIndidualTriples] - begin");
	tags = OwlLib.xmlDoc.getElementsByTagName("owl:NamedIndividual");
	
	// Inner function to get NamedIndividual
	var getNamedIndividual = function(namedIndividual) {
		var item = {};
		
		// Get rdfType predicate and its value
		var rdfType = namedIndividual.getElementsByTagName("rdf:type")[0];
		var value = $(rdfType).attr("rdf:resource");
		if ((value != null) && (value.length != 0)) {
			item["rdf:type"] = value;
		}
		
		var label = namedIndividual.getElementsByTagName("rdf:type")[0];
	}
	
	getNamedIndividual(tags[120]);
}


/**
 * Get all namespaces in the owl file
 */
OwlLib.getNameSpace = function() {
	var result = {}; // store the result
	
	// inner function to get name space
	var getNs = function(nameSpaceStr) {
		var nameSpace = {};
		var subNameSpace = {};
		
		// Non trivial case
		if ((nameSpaceStr != null) || (nameSpaceStr.length == 0)) {
			
			// Get the begin and and index to extract the entity's content
			var begin = nameSpaceStr.indexOf("<!ENTITY");
			var end = nameSpaceStr.indexOf(">");
			
			if ((begin == -1) || (end == -1) || (begin >= end)) { // not found
				return null;
			}
			
			// Get the content and save it to nameSpace variable
			begin = begin + "<!ENTITY".length; 
			var item = nameSpaceStr.substring(begin, end); // ok, get one item*
			item = item.trim();
			var keyValue = item.split(" ");
			nameSpace[keyValue[0]] = keyValue[1];
			
			// Continue searching with the rest
			var tail = nameSpaceStr.substring(end + 1);
			if (tail == null) {
				return nameSpace;
			}
			tail = tail.trim();
			subNameSpace = getNs(tail); // recursive searching
			
			// Ok, collect all of data and then return
			if (subNameSpace != null) {
				for (var key in subNameSpace) {
					nameSpace[key] = subNameSpace[key];
				}
			}
			return nameSpace;
		} else { // Trivial case
			return null;
		}
	}
	
	if ((OwlLib.xmlDoc == null) // Don't have xmldoc
			|| (OwlLib.xmlDoc.doctype == null) // Don't have doctype
			// Don't have internalSubset
			|| (OwlLib.xmlDoc.doctype.internalSubset == null)) {
		return null;
	}

	// Normalize namespaceStr
	var nameSpaceStr = OwlLib.xmlDoc.doctype.internalSubset;
	nameSpaceStr = nameSpaceStr.replace("\n", " ");
	nameSpaceStr = nameSpaceStr.replace(/\s{2,}/g," ");
	nameSpaceStr = nameSpaceStr.trim();
	
	// Parse it to get the result
	result = getNs(nameSpaceStr);
}















