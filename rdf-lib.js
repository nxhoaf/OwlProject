/**
 * Literal js object, used to hold attributes which are considered subject
 */
var subject = {
	about: "about",
	resource: "resource"
};

/**
 * Literal js object, used to hold attributes which are considered predicate
 */
var predicate = {
	rel: "rel",
	property: "property",
}

/**
 * Literal js object, used to hold attributes which are considered object
 */
var object = {
	href : "href",
	content : "content",
	// actually, it isn't an object, we use it to indicate that the object
	// is the text between current tag.
	literal : "literal"  
}

/**
 * Triple constants
 */
var triple = {
	SUBJECT: "SUBJECT",
	PREDICATE: "PREDICATE",
	OBJECT: "OBJECT"
};

var RdfLib = function() {};

/**
 * Get triple of the target (clicked event)
 * @param target the clicked tag
 * @returns triple in clicked tag (if any), otherwise, return null
 */
RdfLib.getTriple = function(target) {
	
	/**
	 * Inner function, given a set of attributes, return the subject of RDFa 
	 * if any. Otherwise, return null
	 */
	var getSubject = function(attributes) {
		console.log("[RdfLib][getClickedField][getSubject] ");
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
			
			if ((attribute.nodeName == subject.about) 
					|| (attribute.nodeName == subject.resource)) {
				result.key = attribute.nodeName;
				result.value = attribute.nodeValue;
				return result;
			}
		}
		return null;
	}
	
	/**
	 * Inner function, given a set of attributes, return the predicate of RDFa 
	 * if any. Otherwise, return null
	 */
	var getPredicate = function(attributes) {
		console.log("[RdfLib][getClickedField][getPredicate] ");
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
			
			if ((attribute.nodeName == predicate.rel) 
					|| (attribute.nodeName == predicate.property)) {
				result.key = attribute.nodeName;
				result.value = attribute.nodeValue;
				return result;
			}
		}
		return null;
	}
	
	/**
	 * Inner function, given a set of attributes, return the object of RDFa if 
	 * any. Otherwise, return null
	 */
	var getObject = function(target) {
		console.log("[RdfLib][getClickedField][getObject] ");
		result = {};
		var i;
		var attributes = target.attributes;
		if ((attributes == null) || (attributes.length == 0)) {
			return null;
		}
		var attribute;
		
		for (i = 0; i < attributes.length; i++) {
			// Must be not null
			if ((attributes[i] == 'undefined') && (attributes[i] == null) ) {
				continue;
			}
			attribute = attributes[i];
			
			if ((attribute.nodeName == object.content) 
					|| (attribute.nodeName == object.href)) {
				result.key = attribute.nodeName;
				result.value = attribute.nodeValue;
				return result;
			}
		}
		
		result.key = object.literal;
		var text = target.textContent;
		// Normalize
		text = text.replace("\n", " ");
		text = text.replace(/\s{2,}/g," ");
		result.value = text;
		return result;
	}
	
	console.log("[RdfLib] [getClickedField] - begin");
	var triple = {}; // Represent the triple in RDF {subject, predicate, object}
	
	triple.subject = null;
	triple.predicate = null;
	triple.object = null;

	// Get subject and predicate
	triple.subject = getSubject(target.attributes);
	triple.predicate = getPredicate(target.attributes);
	
	// Special case, subject becomes object
	if ((triple.subject != null) &&
			(triple.predicate != null) &&
			(triple.subject.key == subject.resource) && 
			(triple.predicate.key == predicate.property)) {
		triple.object = triple.subject;
		triple.subject = null;
	} else {
		triple.object = getObject(target);
	}
	
	console.log("[RdfLib] [getClickedField] - end");
	if ((triple.subject == null) 
			&& (triple.predicate == null)) {
		return null;
	}
	return triple;
}

/**
 * Get subject triple (if any) of the current element
 * @element current element, which has only predicat and subject.
 * @returns its subject if any, or null
 */
RdfLib.getSubjectTriple = function (element) {
	var parent = element.parentNode;
	
	// If parent == null, return null as we dont have subject
	if (parent == null) {
		return null;
	}
	var triple = RdfLib.getTriple(parent);
	
	// If we don't find out subject: 
	// 		((triple == null) || (triple.subject == null))
	// and we still have parent element
	// 		(parent.parentNode != null)
	// then we continue searching
	while ((parent.parentNode != document) 
			&& ((triple == null) || (triple.subject == null))) {
		triple = RdfLib.getSubjectTriple(element.parentNode);
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
}

/**
 * Get all triples in a specific HTML element
 * @param the HTML element to get all triples
 */
RdfLib.getAllTriples = function(element) {
	console.log("[RdfLib] [getAllAttributeTriples] - begin");
	var result = []; // store all triples
	var children = $(element).children();
	for (var i = 0; i < children.length; i++) {
		var grandChildren = $(children[i]).children();
		// non trivial case
		if ((grandChildren != null) && (grandChildren.length > 0)) { 
			var triples = RdfLib.getAllTriples(children[i]);
			result = result.concat(triples);
		} else { // trivial case
			var triple = RdfLib.getTriple(children[i]);
			if (triple != null) {
				if (triple.subject == null) {
					triple.subject = 
						RdfLib.getSubjectTriple(children[i]).subject
				}
				result.push(triple);
			}
		}
	}
	console.log("[RdfLib] [getAllAttributeTriples] - end");
	return result;
}

/**
 * Get all prefixes in the HTML page
 */
RdfLib.getAllPrefixes = function() {
	var prefixes = []; // All prefixes will be stored here
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
					var current = {};
					current.prefix = parsedPrefix[k];
					current.fullName = parsedPrefix[k + 1];
					prefixes.push(current);
					console.log("prefix: " + parsedPrefix[k] + " fullName: " + 
							parsedPrefix[k+1]);
				}
			}
		}
	}
	console.log("[RdfLib] [getAllPrefixes] - end");
	return prefixes;	
}

/**
 * Initialization. This function gets called when we first load the page.
 */
RdfLib.init = function () {
	// Get all prefixes
	var prefixes = RdfLib.getAllPrefixes();
	var output = "<b>All Prefixes: </b><br>";
	for (var i = 0; i < prefixes.length; i++) {
		output += "&nbsp&nbsp&nbsp&nbsp" + prefixes[i].prefix + 
		"   " + prefixes[i].fullName + " <br>";
	}
	
	// Get all triples
	var html = document.getElementsByTagName("html")[0];
	var triples = RdfLib.getAllTriples(html);
	var rdfa = {};
	
	if ((triples == null) && (triples.length == 0)) {
		return;
	}

	// Loop over all triples to store them in hash map-like
	// data structure: 
	for (var i = 0; i < triples.length; i++) {
		
		var triple = triples[i]; // Get the current triple
		var property = "";
		
		if (triple.subject == null) {
			continue;
		}
		
		var key = triple.subject.value;				
		// Create a new entry if it doesn't exist
		if (rdfa[key] == null ) {
			rdfa[key] = [];
		}
		
		property += "'" + triple.predicate.value + "' : '" + 
				triple.object.value + "'";
		rdfa[key].push(property);
	}
	
	
	output += "<b>All attributes: </b><br>";
	for (var key in rdfa) {
	    output += key + "<br>";
	    for (var i = 0; i < rdfa[key].length; i++) {
	    	output += "&nbsp&nbsp&nbsp&nbsp" + rdfa[key][i] + " <br>";
	    }
	}
	
	var log = document.createElement("div");
	log.id = "log";
	$('body').append(log);
	$("#log").html(output);
}

RdfLib.enableEventListener = function() {
	var output;
	$("body").click(function(event) {
		var triple = RdfLib.getTriple(event.target);
		var output = "All triples <br>";
		output += "----------------------- <br>"
		if (triple == null ||  
			((triple.predicate == null) && (triple.subject == null))) {
			$("#log").html("this element: " + 
					"<br> name: " + event.target.nodeName +  
					"<br> value: " + event.target.textContent + 
					"<br> doesn't contain any valid triples");
			return;
		}
		
		if (triple.subject == null) {
			triple.subject = RdfLib.getSubjectTriple(event.target).subject;
			output += "subject: " + triple.subject.key + ":" + triple.subject.value;
			output += "<br>";
			
			output += "predicate: " +  triple.predicate.key + ":" + triple.predicate.value;
			output += "<br>";
			
			output += "object: " +  triple.object.key + ":" + triple.object.value;
			output += "<br>";
			
			$("#log").html(output);
		} else {
				var triples = RdfLib.getAllTriples(event.target);
				for (var i = 0; i < triples.length; i++) {
					triple = triples[i];
					if (triple.subject != null) {
						output += "subject: " + triple.subject.key + ":" + triple.subject.value;
						output += "<br>";	
					}
					
					if (triple.predicate != null) {
						output += "predicate: " +  triple.predicate.key + ":" + triple.predicate.value;
						output += "<br>";
					}
					
					if (triple.object != null) {
						output += "object: " +  triple.object.key + ":" + triple.object.value;
						output += "<br>";
					}	
					output += "------------------------------<br>";
				}
				$("#log").html(output);
		}
	});
	
	console.log("[person.html] - end");
}

