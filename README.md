## OwlProject

## RdfaParser using rdf-lib.js
In this part, we describle how to use rdf-lib.js to retrieve all rdfa attributes in
an HTML page.

Examples based on this simple HTML page (say person.js)
``` html
<!DOCTYPE html>
<html prefix="dc: http://purl.org/dc/terms/ schema: http://schema.org/">
  <head>
	<meta charset="UTF-8" />
    <title>Nxhoaf's Home Page</title>
  </head>
  <body about="http://example.org/nxhoaf/#me" prefix="foaf: http://xmlns.com/foaf/0.1/">
    <h1>Nxhoaf's Home Page</h1>
    <p>My name is <span property="foaf:nick">nxhoaf</span> and I like
      <a href="http://www.amazon.com/" property="foaf:interest"
        lang="en">Amazon</a>.
    </p>
    <p>
      My 
      <span property="foaf:interest" resource="urn:ISBN:978-0321356680">
	      favorite <br>
	      <span resource="urn:ISBN:978-0321356680">
	      	  book is the inspiring <br>
		      <cite property="dc:title">Effective Java</cite> by
		      <span property="dc:creator">Joshua Bloch</span>
	      </span>
     </span>
    </p>
  </body>
</html>
```

First of all, as this library depends on jQuery, we must include jQuery in order to use it:
``` html
<head>
	<meta charset="UTF-8" />
    <title>Nxhoaf's Home Page</title>
	<script src="http://code.jquery.com/jquery-latest.js"></script>
    <script src="./rdf-lib.js"></script>
</head>
```

Now that we have jQuery, we use it to listen to the "ready" event. Whenever the page 
is ready, we initialize our library. Note that **it should be the first statement**, 
otherwise, this library may not work properly.

``` html
<script>
	$(document).ready(function () {
		RdfLib.init();
	});
</script>
```
From now, we can:

- Retrieve rdfa prefixes. 
- Retrieve rdfa attributes.
- Get triples in clicked HTML element.
- Blacklist wrong triples.

### Retrieve rdfa prefixes
All rdfa prefixes can be retrieved via:
`var prefixes = RdfLib.prefixes;`
The result is an object containing all rdfa prefixes in the page. In our example, 
we should have:
```
prefixes[dc] = http://purl.org/dc/terms/
prefixes[schema] = http://schema.org/
prefixes[foaf] = http://xmlns.com/foaf/0.1/
```
To loop over all properties, we can use: 
```
for (var prefix in prefixes) {
	console.log(prefix + ": " + prefixes[prefix]);
}
```

### Retrieve rdfa attributes

After calling `RdfLib.init()`, we can also get all rdfa attributes located in the page via 
`RdfLib.rdfa` attribute. This object is a triple-like {subject, predicate, object} data structure:
```
rdfa[subject] = [predicate_1, predicate_2, ......, predicate_n]
predicate 	= [object_1, object_2, ............., object_n]
```
that is, for a given subject and predicate, we have an array of objects. (Note that 
the term 'object' here is actually the **object** in the triple, not an JavaScript object): 
```
rdfa[subject][predicate] = [object_1, object_2, ............., object_n]
```
Here is an example of how to loop over the rdfa data structure to display all triples. 
Suppose that we have a 'div' element in our page whose id is "#log":
```
var output += "<b>All attributes: </b><br>";
for (var subject in rdfa) {
	output += subject + "<br>";
	for (var predicate in rdfa[subject]) {
		output += "&nbsp&nbsp&nbsp&nbsp'" + predicate + "' : '" + rdfa[subject][predicate] + "' <br>";
	}
}
$("#log").html(output);
```

### Get triples in clicked HTML element
This library provide us a way to get rdfa triples in a clicked HTML element. We have 
two possiblities: 

1. The clicked element doesn't have a subject. For example `<span property="dc:creator">Joshua Bloch</span>`  
in our example
2. The clicked element has a subject, for example `<span resource="urn:ISBN:978-0321356680">`


First, we try to get the triple in the clicked area: `var triple = RdfLib.getTriple(event.target);`  
If the clicked area doesn't contain any triple, nothing happens.
``` js
if (triple == null ||  
		((triple.predicate == null) && (triple.subject == null))) {
	return;
}
```
Otherwise, we continue...
#### The clicked element doesn't have a subject


In this case, we get its subject using:
``` js
	var subjectTriple = RdfLib.getSubjectTriple(event.target);
	triple.subject = subjectTriple.subject;
```
`RdfLib.getSubjectTriple()` is a recursive function, it'll go up the DOM tree to find out the subject triple.
If it arrives at root without finding out the subject, it will use the current page's url as the default one.
Now that we have the subject, we display it: 
``` html
	output += "subject: " + triple.subject.key + ":" + triple.subject.value;
	output += "<br>";
	
	output += "predicate: " +  triple.predicate.key + ":" + triple.predicate.value;
	output += "<br>";
	
	output += "object: " +  triple.object.key + ":" + triple.object.value;
	output += "<br>";
	
	$("#log").html(output);
```

Consider an example, when you click on `<span property="dc:creator">Joshua Bloch</span>`, `RdfLib.getSubjectTriple()`  
will go up and the consider `<span resource="urn:ISBN:978-0321356680">` as its subject triple: 
``` html
<span resource="urn:ISBN:978-0321356680">
	  book is the inspiring <br>
	  <cite property="dc:title">Effective Java</cite> by
	  <span property="dc:creator">Joshua Bloch</span>
  </span>
```
As a result, we have: 
```
subject: resource:urn:ISBN:978-0321356681
predicate: property:dc:creator
object: literal:Joshua Bloch
```  
#### The clicked element has a subject
When the clicked element is already a "subjectTriple", we **go down** the DOM tree to get all of its childrenTriples by 
using `RdfLib.getAllTriples(event.target);` function.  
For example, when `<span resource="urn:ISBN:978-0321356680">` is clicked, and here is the displaying code: 
```
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
``` 
the result should be: 
```
-----------------------
subject: resource:urn:ISBN:978-0321356681
predicate: property:dc:title
object: literal:Effective Java
------------------------------
subject: resource:urn:ISBN:978-0321356681
predicate: property:dc:creator
object: literal:Joshua Bloch
------------------------------
```  
Note that when used with the top <html> element, `RdfLib.getAllTriples(event.target);` will list all the rdfa in the page.  

### Blacklist wrong triples
The [RDFa prime specification](http://www.w3.org/TR/xhtml-rdfa-primer/) say that when we have a tag containing 'rel' and 
'href' attribute at the same time, the 'rel' should be considered as **predicate** and the 'href' should be considered as
**object**. However, this definition is somehow inconsistent. The declaration of external css matches perfectly this definition:
```
<link rel="stylesheet" type="text/css" href="http://link/to/file.css">
```
Obviously, this is not what we want. The library provide us a way to avoid such situations. All we need to do is to declare an 
an array containing all 'ignore element' like this:
```
var ignoreArray = [
	"stylesheet",
	"an element with space",
	"other-element",
	"yetAnotherElement",
];
```  
where "stylesheet" "an element with space" is the value of the 'predicate' which will be ignored.  
With this `ignoreArray`, we pass it to the function `RdfLib.addToIgnoreArray(ignoreArray);` 
This function should be called just before the `RdfLib.init();` function.  

See [person.html](./rdfa/person.html) to view full source code.
## OwlParser using owl-lib.js











