/**
 * Literal js object, used to hold attributes which are considered subject
 * for more information about which properties are considered "rdfa" property, 
 * see here: http://www.w3.org/TR/xhtml-rdfa-primer/
 */
var SUBJECT = {
	ABOUT: "about",
	RESOURCE: "resource"
};

/**
 * Literal js object, used to hold attributes which are considered predicate
 */
var PREDICATE = {
	REL: "rel",
	PROPERTY: "property",
}

/**
 * Literal js object, used to hold attributes which are considered object
 */
var OBJECT = {
	HREF : "href",
	CONTENT : "content",
	// actually, it isn't an object, we use it to indicate that the object
	// is the text between current tag.
	LITERAL : "literal"  
}

/**
 * Triple constants
 */
var TRIPLE = {
	SUBJECT: "SUBJECT",
	PREDICATE: "PREDICATE",
	OBJECT: "OBJECT"
};

var RdfLib = function() {
	var rdfLib = {};
	
	/**
	 * Add new elements to ignoreArray
	 *
	 * @param ignoreArray an array contain a list of ignore elements
	 * 
	 * The RDFa prime specification say that when we have a tag containing 'rel' 
	 * and 'href' attribute at the same time, the 'rel' should be considered as 
	 * predicate and the 'href' should be considered as object. However, this 
	 * definition is somehow inconsistent. The declaration of external css matches 
	 * perfectly this definition:
	 * <link rel="stylesheet" type="text/css" href="http://link/to/file.css">
	 * Obviously, this is not what we want. The library provide us a way to avoid 
	 * such situations. All we need to do is declare an array containing all 
	 * 'ignore element' like this:
	 * 
	 * var ignoreArray = [
	 *   "stylesheet",
	 *   "an element with space",
	 *   "other-element",
	 *   "yetAnotherElement",
	 * ];
	 * 
	 * The ignoreArray is actually stored in RdfLib.ignoreArray
	 * 
	 */
	rdfLib.addToIgnoreArray = function(ignoreArray) {
		if (rdfLib.ignoreArray == null) {
			rdfLib.ignoreArray = [];
		}
		
		if ((ignoreArray == null) || (ignoreArray.length == 0)) {
			return;
		}
		
		for (var i = 0; i < ignoreArray.length; i++) {
			item = ignoreArray[i];
			rdfLib.ignoreArray.push(item);
		}
	};
	
	
	/**
	 * Get triple of the target (which is clicked event)
	 * @param target the clicked area
	 * @returns triple in clicked area (if any), otherwise, return null. The data
	 * structure is as follow: (actually, key mean type)
	 * triple.subject.key = about
	 * triple.subject.value = "http://example.org/nxhoaf/#me"
	 * 
	 * triple.predicate.key = property
	 * triple.predicate.value = foaf:nick
	 * 
	 * triple.object.key = literal
	 * triple.object.value = nxhoaf
	 */
	rdfLib.getTriple = function(target) {
		
		/**
		 * Inner function, given a set of attributes, return its subject
		 * if any. Otherwise, return null
		 * @returns the subject object in which
		 * subject.key = subject name
		 * subject.value = subject value
		 */
		var getSubject = function(attributes) {
			result = {};
			var i;
			var attribute;
			
			if ((attributes == null) || (attributes.length == 0)) {
				return null;
			}
			
			for (i = 0; i < attributes.length; i++) {
				// Must be not null
				if ((attributes[i] == 'undefined') && (attributes[i] == null) ) {
					continue;
				}
				attribute = attributes[i];
				
				if ((attribute.nodeName == SUBJECT.ABOUT) 
						|| (attribute.nodeName == SUBJECT.RESOURCE)) {
					result.key = attribute.nodeName;
					result.value = attribute.nodeValue;
					return result;
				}
			}
			return null;
		};
		
		/**
		 * Inner function, given a set of attributes, return its predicate 
		 * if any. Otherwise, return null
		 * @returns the predicate object in which
		 * predicate.key = predicate name
		 * predicate.value = predicate value
		 */
		var getPredicate = function(attributes) {
			result = {};
			var i;
			var attribute;
			
			if ((attributes == null) || (attributes.length == 0)) {
				return null;
			}
			
			for (i = 0; i < attributes.length; i++) {
				// Must be not null
				if ((attributes[i] == 'undefined') && (attributes[i] == null) ) {
					continue;
				}
				attribute = attributes[i];
				
				
				if ((attribute.nodeName == PREDICATE.REL)
					|| (attribute.nodeName == PREDICATE.PROPERTY)) {
					result.key = attribute.nodeName;
					result.value = attribute.nodeValue;
					return result;
				}
				
			}
			return null;
		};
		
		/**
		 * Inner function, given a set of attributes, return its object 
		 * any. Otherwise, return null
		 * @returns the object in which
		 * object.key = object name
		 * object.value = object value
		 */
		
		var getObject = function(target, predicateType) {
			result = {};
			var i;
			var attributes = target.attributes;
			if ((attributes == null) || (attributes.length == 0)) {
				return null;
			}
			
			var attribute;
			console.log("______________________ predicateType " + predicateType);

			// if predicate is property (case 2), it has only one object, if it's
			// rel (case 1), it can have many object
			// see 2.2.4 Alternative for setting the property: rel 
			// in http://www.w3.org/TR/xhtml-rdfa-primer/
			// for more info
			
			// case 1
			if (predicateType == PREDICATE.REL) {
				result.value = [];
				
				// Loop over attribute to get all these attributes other than 
				// predicate.rel and save them.
				for (i = 0; i < attributes.length; i++) {
					attribute = attributes[i];
					if ((attribute != null) 
							&& (attribute.nodeName != PREDICATE.REL)) {
						result.value.push(attribute.nodeValue);
						console.log(attribute.nodeValue)
					}
				}
				console.log("______________________ " + attributes[i]);
				return result;
			}
			
			// case 2
			// Get all attribute of predicate
			for (i = 0; i < attributes.length; i++) {
				// Must be not null
				if (attributes[i] == null ) {
					continue;
				}
				attribute = attributes[i];

				// see '2.2.1 Using the content attribute' 
				if ((attribute.nodeName == OBJECT.CONTENT) 
						|| (attribute.nodeName == OBJECT.HREF)) {
					result.key = attribute.nodeName;
					result.value = [];
					result.value.push(attribute.nodeValue);
					return result;
				}
			}
			
			// Not found, attribute is the literal text between the tags.
			result.key = OBJECT.LITERAL;
			var text = target.textContent;
			// Normalize
			text = text.replace("\n", " ");
			text = text.replace(/\s{2,}/g," ");
			result.value = [];
			result.value.push(text);
			return result;
		};
		
		var triple = {}; // Represent the triple in RDF {subject, predicate, object}
		
		triple.subject = null;
		triple.predicate = null;
		triple.object = null;

		// Get subject and predicate
		triple.subject = getSubject(target.attributes);
		triple.predicate = getPredicate(target.attributes);
		
		// Special case, subject becomes object, see 2.2.3 Alternative for setting 
		// the context in http://www.w3.org/TR/xhtml-rdfa-primer/
		// - quote -: 
		// "The role of the resource attribute in the div element is to set the 
		// "context", i.e., the subject for all the subsequent statements. Also, 
		// when combined with the property attribute, resource can be used to set 
		// the "target", i.e., the object for the statement (much as href)". 
		if ((triple.subject != null) &&
				(triple.predicate != null) &&
				(triple.subject.key == SUBJECT.RESOURCE) && 
				(triple.predicate.key == PREDICATE.PROPERTY)) {
			triple.object = triple.subject;
			triple.subject = null;
		} else {
			var predicateType;
			if (triple.predicate == null) {
				predicateType = null;
			} else {
				predicateType = triple.predicate.key;
			}
			
			triple.object = getObject(target, predicateType);
		}
		
		/** 
		 * Inner function, test if a triple is a "temporary triple".
		 * During the parsing process, there're some states when triples aren't
		 * completely constructed, for example: a triple may have subject, but 
		 * may NOT have its predicate, object yet (the predicate and object will
		 * be retrieved in inner tag later). This is considered as "TEMPORARY 
		 * TRIPLE", and it's acceptable. 
		 * 
		 * When the parsing completed, only triples that have all of its subject, 
		 * predicate, object constructed properly pass the rdf.isTriple() test.
		 */
		var isTemporaryTriple = function(triple) {
			// Is Null ? 
			if ((triple.subject == null) && (triple.predicate == null)) {
				return false;
			}
			
			if ((rdfLib.ignoreArray != null) 
					&& (rdfLib.ignoreArray.length != 0)) {
				if (rdfLib.ignoreArray.indexOf(triple.predicate.value) != -1) {
					return false;
				}
			}
			// Passed, return true
			return true;
		};
		
		// Not a real triple
		if (!isTemporaryTriple(triple)) {
			return null;
		} else {
			return triple;
		}
		
	};
	
	/**
	 * Get subject triple (if any) of the current element
	 * @element current element, which has only predicat and subject.
	 * @returns its subject if any, or null
	 */
	rdfLib.getSubjectTriple = function (element) {
		var parent = element.parentNode;
		
		// If parent == null, return null as we dont have subject
		if (parent == null) {
			return null;
		}
		var triple = rdfLib.getTriple(parent);
		
		// If we don't find out subject: 
		// 		((triple == null) || (triple.subject == null))
		// and we still have parent element
		// 		(parent.parentNode != null)
		// then we continue searching (recursive)
		while ((parent.parentNode != document) 
				&& ((triple == null) || (triple.subject == null))) {
			triple = rdfLib.getSubjectTriple(element.parentNode);
		}
		
		// Still not found, return default triple
		if ((triple == null) || (triple.subject == null)) {
			var triple = {};
			var subject = {};
			
			subject.key = "about";
			subject.value = window.location.href;
			triple.subject = subject;
			triple.predicate = null;
			triple.object = null;
		}
		
		// ok
		return triple;
	};

	rdfLib.isTriple = function(triple) {
		
		/**
		 * Check if a value is defined in a constant
		 * @param value value to check
		 * @param constant constant to check
		 * @returns result
		 */
		var hasValue = function (value, constant, type) {
			var hasValue = false;
			
			
			
			for (var item in constant) {
				var value = constant[item];
				if (triple[type].key == value) {
					hasValue = true;
					break;
				}
			}
			return hasValue;
		}
		
		// subject, predicate and object must be not null
		if ((triple.subject == null)
				|| (triple.predicate == null)
				|| (triple.object == null)) {
			return false;
		}
		
		// Subject must be predefined in subject constant
		var key = triple.subject.key;
		if (!hasValue(key, SUBJECT, "subject")) {
			return false;
		}

		// Special case, subject becomes object, see 2.2.3 Alternative for setting 
		// the context in http://www.w3.org/TR/xhtml-rdfa-primer/
		// - quote -: 
		// "The role of the resource attribute in the div element is to set the 
		// "context", i.e., the subject for all the subsequent statements. Also, 
		// when combined with the property attribute, resource can be used to set 
		// the "target", i.e., the object for the statement (much as href)".
		if ((triple.predicate.key == "property")
				&& (triple.object.key == "resource")) {
			return true;
		}
		
		
		var key = triple.predicate.key;
		// Predicate must be predefined in predicate constant
		if (!hasValue(key, PREDICATE, "predicate")) {
			return false;
		}
		
		// Object must be predefined in object constant
		var key = triple.object.key;
		if (!hasValue(key, OBJECT, "object")) {
			return false;
		}
		
		return true;
	}
	
	/**
	 * Get all triples in a specific HTML element
	 * @param the HTML element to get all triples
	 */
	rdfLib.getAllTriples = function(element) {
		console.log("[RdfLib] [getAllAttributeTriples] - begin");
		var result = []; // store all triples
		var children = $(element).children();
		for (var i = 0; i < children.length; i++) {
			var grandChildren = $(children[i]).children();

			// non trivial case, children is a nested node
			if ((grandChildren != null) && (grandChildren.length > 0)) {
				// First, get all triple in a sub node
				var triples = rdfLib.getAllTriples(children[i]);
				result = result.concat(triples);
			} 
			
			// trivial case, only get triple in the current node
			var triple = rdfLib.getTriple(children[i]);
			if (triple != null) {
				if (triple.subject == null) {
					triple.subject =
						rdfLib.getSubjectTriple(children[i]).subject
				}
				
				if (rdfLib.isTriple(triple)) {
					result.push(triple);
				}
			}
		}
		console.log("[RdfLib] [getAllAttributeTriples] - end");
		return result;
	};

	/**
	 * Get all prefixes in the HTML page
	 * 
	 * @returns an object contains all prefix in this HTML page. If the object name 
	 * is prefixes, then we have, for example:
	 * prefixes[dc] = http://purl.org/dc/terms/ schema: http://schema.org/
	 * prefixes[foaf] = http://xmlns.com/foaf/0.1/
	 * 
	 * and so on...
	 */
	rdfLib.getAllPrefixes = function() {
		var prefixes = {}; // All prefixes will be stored here
		console.log("[RdfLib] [getAllPrefixes] - begin");
		
		// Get all elements in the currents documents
		var allElements = document.getElementsByTagName("*");
		for (var i = 0; i < allElements.length; i++) {
			// For each elements, get all of its set of attributes
			var attributes = allElements[i].attributes;
			if (attributes == null || attributes.length == 0) {
				continue;
			} 
			
			// For each set of attribute
			for (var j = 0; j < attributes.length; j++) {
				var attr = attributes.item(j);
				
				// Found a prefix
				if (attr.nodeName == "prefix") {
					var prefix = attr.nodeValue;
					console.log("current prefix: " + prefix);
					// remove double space
					htmlPrefix = prefix.replace(/\s{2,}/g, " ");
					var parsedPrefix = prefix.split(" ") // Then, split by space
					
					// should be in pair {key, value}
					if (parsedPrefix.length % 2 !== 0) {
						console.log("invalid prefix: " + htmlPrefix);
						continue;
					}
					
					for (var k = 0; k < parsedPrefix.length; k+=2) {
						var prefix = parsedPrefix[k];
						var fullName = parsedPrefix[k + 1];
						
						prefixes[prefix] = fullName;
						console.log("prefix: " + parsedPrefix[k] + " fullName: " + 
								parsedPrefix[k+1]);
					}
				}
			}
		}
		console.log("[RdfLib] [getAllPrefixes] - end");
		return prefixes;	
	};
	
	return rdfLib;
};







