OwlObject = function () {
	var owlObject = {};
	
	/**
	 * Load Owl file from a specific url
	 * @param url url to load
	 * @returns url content will be load into Owl.loadOwl object
	 */
	owlObject.loadOwl = function(url) {
		console.log("[OwlObject] [loadOwl] - begin");
		
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
		if (xhr.status != 200) {
			owlObject.xmlDoc = null;
			owlObject.nameSpaces = null;
			return;
		}
		xmlDoc = xhr.response;
		xmlDoc = (new DOMParser()).parseFromString(xmlDoc, 'text/xml');
		owlObject.xmlDoc = xmlDoc;
		owlObject.nameSpaces = owlObject.loadNameSpace();
		console.log("[OwlObject] [loadOwl] - end");
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
	owlObject.loadNameSpace = function() {
		console.log("[OwlObject] [loadNameSpace]");
		var result = {}; // store the result
		// Named Individual elements
		var rdfNs = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
		
		if (owlObject.xmlDoc == null) {
			return;
		}
		
		var rdf= owlObject.xmlDoc.
				getElementsByTagNameNS(rdfNs,CONSTANT.RDF)[0];
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
	owlObject.getNamedIndividuals = function(type) {
		// Store result
		var namedIndividuals = [];
		var owlNS = owlObject.nameSpaces["owl"];
		// Named Individual elements
		var niElements = owlObject.xmlDoc.
				getElementsByTagNameNS(owlNS, CONSTANT.NAMED_INVIDUAL);
		// Get all Named Individual which match the type
		for (var i = 0; i < niElements.length; i++) {
			// var ni = getNamedIndividual(niElements[i], type);
			var niElement = niElements[i];
			var typeNS = owlObject.nameSpaces["rdf"];
			var rdfType = niElement.
					getElementsByTagNameNS(typeNS,CONSTANT.TYPE)[0];
//			var rdfType = niElement.getElementsByTagName(CONSTANT.TYPE)[0];
			
			// Get rdfType, if any
			var currentType;
			if (rdfType != null) { // found type attribute
				currentType = rdfType.getAttribute(CONSTANT.RESOURCE); 
			}
			
			// Found a type, but not matched, skip it
			if ((type != null) && (type == currentType)) {
				namedIndividuals.push(niElement);
			}
		}

		if (namedIndividuals.length == 0) {
			return null;
		}
		return namedIndividuals;
	}

	/**
	 * Get metadata of a namedIndividual 
	 * @param namedIndividual the namedIndividual to get attributes.
	 * @returns the metadata data structure if any, otherwise, return null
	 */
	owlObject.getMetaData = function(namedIndividual) {
		var properties = {};
		var isEmpty = true;
		
		// Get element type
		var typeNS = owlObject.nameSpaces["rdf"];
		var rdfType = namedIndividual.
				getElementsByTagNameNS(typeNS, CONSTANT.TYPE)[0];
		var elementType = rdfType.getAttribute(CONSTANT.RESOURCE);
		
		if (elementType != null) {
			properties[CONSTANT.TYPE] = elementType;
			isEmpty = false;
		}
		
		// get label, if any
		var labelNS = owlObject.nameSpaces["rdfs"]; 
		var label = namedIndividual.
				getElementsByTagNameNS(labelNS, CONSTANT.LABEL)[0];
		if (label != null) {
			properties[CONSTANT.LABEL] = label.textContent;
			isEmpty = false;
		}
		
		if (!isEmpty) {
			// Add more details to this item and then return it
			var about = namedIndividual.getAttribute(CONSTANT.ABOUT) 
			if (about != null) {
				properties[CONSTANT.ABOUT] = about; 
			}
			return properties; 
		} else {
			return null;
		}
	}
	return owlObject;
};

