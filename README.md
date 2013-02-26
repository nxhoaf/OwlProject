## OwlProject

## RdfaParser using rdf-lib.js
In this part, we describle how to use rdf-lib.js to retrieve all rdfa attributes
in an HTML page.

Examples based on this simple HTML page (say person.js)
``` html
<!DOCTYPE html>
<html prefix="dc: http://purl.org/dc/terms/ schema: http://schema.org/">
  <head>
	<meta charset="UTF-8" />
    <title>Nxhoaf's Home Page</title>
  </head>
  <body about="http://example.org/nxhoaf/#me" 
  		prefix="foaf: http://xmlns.com/foaf/0.1/">
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

First of all, as this library depends on jQuery, we must include jQuery in order
to use it:
``` html
<head>
	<meta charset="UTF-8" />
    <title>Nxhoaf's Home Page</title>
	<script src="http://code.jquery.com/jquery-latest.js"></script>
    <script src="./rdf-lib.js"></script>
</head>
```

Now that we have jQuery, we use it to listen to the "ready" event. Whenever the
page is ready, we can perform these following actions:

- Retrieve rdfa prefixes. 
- Retrieve rdfa attributes.
- Get triples in clicked HTML element.
- Blacklist wrong triples.

### Retrieve rdfa prefixes
All rdfa prefixes can be retrieved via:
`var prefixes = RdfLib.getAllPrefixes();`
The result is an object containing all rdfa prefixes in the page. 
In our example, we should have:

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

With this library, we can also get all rdfa attributes located in the page via 
`var triples = RdfLib.getAllTriples(html);` attribute. `triples` is an array of 
triple. Each triple is a data structure which has three fields: 

```
triple.subject
triple.predicate
triple.object
```

in which each of `{subject, predicate, object}` is a `{key, value}` data
structure: 

`subject.key` is the title of the subject
`subject.key` is the real value of the subject

For `predicate` and `object`, it's exactely the same.
 

Here is an example of how to loop over the rdfa data structure to display all 
triples. Suppose that we have a 'div' element in our page whose id is "#log":
```
html = document.getElementsByTagName("html")[0];
	var triples = RdfLib.getAllTriples(html);
	output += "<b>All attributes: </b><br>";
	for (var i = 0; i < triples.length; i++) {
		triple = triples[i];
		if (triple.subject != null) {
			output += "subject: " + triple.subject.key + ":" + triple.subject.value;
			output += "<br>";	
		}
		
		if (triple.predicate != null) {
			output += "predicate: " +  triple.predicate.key + ":" + triple.predicate.value;
			output += "<br>";
		} else {
			output += "predicate: null";
			output += "<br>";
		}
		
		if (triple.object != null) {
			output += "object: " +  triple.object.key + ":" + triple.object.value;
			output += "<br>";
		}	
		output += "------------------------------<br>";
	}
	var log = document.createElement("div");
	log.id = "log";
	$('body').append(log);
	$("#log").html(output);
```
Here is a small part of the result while applying this function to our example
html:

```
subject: about:http://localhost:8888/OwlProject/rdfa/person.html
predicate: property:profile
object: href:http://www.w3.org/1999/xhtml/vocab
------------------------------
subject: about:http://localhost:8888/OwlProject/rdfa/person.html
predicate: property:dc:creator
object: content:Hoa Nguyen
------------------------------
subject: about:http://localhost:8888/OwlProject/rdfa/person.html
predicate: rel:foaf:primaryTopic
object: undefined:#me
------------------------------
subject: about:http://example.org/nxhoaf/#me
predicate: property:foaf:nick
object: literal:nxhoaf
------------------------------
subject: about:http://example.org/nxhoaf/#me
predicate: property:foaf:interest
object: href:http://www.amazon.com/
------------------------------
```
### Get triples in clicked HTML element
This library provide us a way to get rdfa triples in a clicked HTML element. 
We have two possibilities: 

1. The clicked element doesn't have a subject. For example 
`<span property="dc:creator">Joshua Bloch</span>`
2. The clicked element has a subject, for example 
`<span resource="urn:ISBN:978-0321356680">`


First (for both cases), we try to get the triple in the clicked area: 
`var triple = RdfLib.getTriple(event.target);` If the clicked area doesn't 
contain any triple, nothing happens:

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
`RdfLib.getSubjectTriple()` is a recursive function, it'll go up the DOM tree to 
find out the subject triple. If it arrives at root without finding out the 
subject, it will use the current page's url as the default one. That's why in 
the previous example, we have the following subject for some triples:

```
subject: about:http://localhost:8888/OwlProject/rdfa/person.html
```

Now that we have the subject, we display it. The code for dipslaying the result
is exactly the same as in the section **Retrieve rdfa attributes**

Consider an example, when you click on 
`<span property="dc:creator">Joshua Bloch</span>`, `RdfLib.getSubjectTriple()`
it will go up and then find out that `<span resource="urn:ISBN:978-0321356680">` 
is the subject of the current triple: 

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
When the clicked element is already a "subjectTriple", we **go down** the DOM 
tree to get all of its childrenTriples using 
`RdfLib.getAllTriples(event.target);` function.  
Suppose that `<span resource="urn:ISBN:978-0321356680">` is clicked, and 
the displaying code is as below: 
```
var triples = RdfLib.getAllTriples(event.target);
for (var i = 0; i < triples.length; i++) {
	triple = triples[i];
	if (triple.subject != null) {
		output += "subject: " + triple.subject.key + ":" + triple.subject.value;
		output += "<br>";	
	}
	
	if (triple.predicate != null) {
		output += "predicate: " +  triple.predicate.key + ":" + 
				triple.predicate.value;
		output += "<br>";
	}
	
	if (triple.object != null) {
		output += "object: " +  triple.object.key + ":" + triple.object.value;
		output += "<br>";
	}	
	output += "------------------------------<br>";
}
``` 
then the result should be: 
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
Note that when used with the top <html> element, 
`RdfLib.getAllTriples(event.target);` will list all the rdfa in the page.  

### Blacklist wrong triples
The [RDFa prime specification](http://www.w3.org/TR/xhtml-rdfa-primer/) say that 
when we have a tag containing 'rel' and 
'href' attribute at the same time, the 'rel' should be considered as 
**predicate** and the 'href' should be considered as
**object**. However, this definition is somehow inconsistent. The declaration of 
external css matches perfectly this definition:
```
<link rel="stylesheet" type="text/css" href="http://link/to/file.css">
```
Obviously, this is not what we want. The library provide us a way to avoid such 
situations. All we need to do is declare an array containing all 
'ignore element' like this:

```
var ignoreArray = [
	"stylesheet",
	"an element with space",
	"other-element",
	"yetAnotherElement",
];
```  

where **"stylesheet"**, **"an element with space"** are the value of the
'predicate' which will be ignored.  With this `ignoreArray`, we pass it to the 
function `RdfLib.addToIgnoreArray(ignoreArray);` This function should be called 
before using any other functions.  

See [person.html](./rdfa/person.html) to view full source code.
## OwlParser using owl-lib.js











