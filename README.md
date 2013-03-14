## 1. RdfaParser using rdf-lib.js
In this part, we describle how to use rdf-lib.js to retrieve all rdfa attributes
in an HTML page.

Examples based on this simple HTML page (say person.js)
``` html
<!DOCTYPE html>
<html prefix="dc: http://purl.org/dc/terms/ schema: http://schema.org/">
  <head>
	<meta charset="UTF-8" />
	<link property="profile" href="http://www.w3.org/1999/xhtml/vocab" />
    <title>Nxhoaf's Home Page</title>
    <base href="http://example.org/nxhoaf/" />
    <meta property="dc:creator" content="Hoa Nguyen" />
    <link rel="foaf:primaryTopic" href="#me" />
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

Let's create a new rdf object before using it: 
```
var rdfLib = new RdfLib();
```

### Retrieve rdfa prefixes
All rdfa prefixes can be retrieved via:
`var prefixes = rdfLib.getAllPrefixes(html);`
As a result, we have an object containing all rdfa prefixes in the page. 
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

Also, we can get all rdfa attributes located in the page via 
`var triples = rdfLib.getAllTriples(html);` attribute. `triples` is an array of 
triples. Each triple is a data structure which has three fields: 

```
triple.subject
triple.predicate
triple.object
```

in which each of `{subject, predicate, object}` has two fields {key, value} 
where key is considered as title and value is the real value:
```
subject.key
subject.value

predicate.key
predicate.value

object.key
object.value
```

Here is an example of how to loop over the rdfa data structure to display all 
triples. Suppose that in our page, we have a 'div' element whose id is "#log":
```
html = document.getElementsByTagName("html")[0];
	var triples = rdfLib.getAllTriples(html);
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
Here is one part of the result while applying this function to our example
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


First of all (for both cases), we try to get the triple in the clicked area: 
`var triple = rdfLib.getTriple(event.target);` If the clicked area doesn't 
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
	var subjectTriple = rdfLib.getSubjectTriple(event.target);
	triple.subject = subjectTriple.subject;
```
`rdfLib.getSubjectTriple()` is a recursive function, it'll go up the DOM tree to 
find out the subject triple. If it arrives at root without finding out the 
subject, it will use the current page's url as the default one. That's why in 
the previous example, we have the following subject for some triples:

```
subject: about:http://localhost:8888/OwlProject/rdfa/person.html
```

Now that we have the subject, we display it. The code for dipslaying the result
is exactly the same as in the section **Retrieve rdfa attributes**

Consider an example, when you click on 
`<span property="dc:creator">Joshua Bloch</span>`, `rdfLib.getSubjectTriple()`
will go up and then find out that `<span resource="urn:ISBN:978-0321356680">` 
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
`rdfLib.getAllTriples(event.target);` function.  
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

### Ignore unwanted triples
The [RDFa prime specification](http://www.w3.org/TR/xhtml-rdfa-primer/) say that 
when we have a tag containing 'rel' and 
'href' attribute at the same time, the 'rel' should be considered as 
**predicate** and the 'href' should be considered as
**object**. Unfortunately, there're some exceptions. For example, the 
declaration of external css matches  this definition:

```
<link rel="stylesheet" type="text/css" href="http://link/to/file.css">
```
Obviously, this is not what we want. The library provides us a way to avoid such 
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
**'predicate'** which will be ignored.  With this `ignoreArray`, we pass it to the 
function `rdfLib.addToIgnoreArray(ignoreArray);` This function should be called 
before using any other functions.  

See [person.html](./rdfa/person.html) for more details.
## 2. Working with owl file
In this section, we will: 

- Use `owl-lib.js` to work with .owl file via some basic funtions.
- Based on `owl-lib.js`, we'll implement the `educ-program-lib.js` to deal 
with a specific ontology file: *The french history*.
- For the displaying part, we'll construct an GUI interface: `rolling-menu.js` 
(which is a rolling menu).
- And finally, the `menu.html` is the container, which is also considered as 
the input point, via a web browser.

### owl-lib.js

First of all, `owl-lib.js` gives us a way to work with .owl file via some basic 
functions. We can create a new owlObject via: `var owlObject = new OwlObject();`
It will be used to load the owl file that we want to work with:
```
owlObject.loadOwl("path/to/file.owl");
```
If succeeded, this function will create two data structures in the original 
owlObject (otherwise, both of these fields are null):

 - `owlObject.xlmDoc` contains all the content of the loaded owl 
 file. For example, if `path/to/file.owl` points to 
 [programmeHistoire6emeV3.owl](./history/resource/programmeHistoire6emeV3.owl), 
 then all contents of this file will be loaded to `owlObject.xlmDoc`.
 - `owlObject.nameSpaces` contains all the nameSpace defined in the 
 owl file. For example, in our owl file, if we have:
	 
	- `owl` is actually "http://www.w3.org/2002/07/owl#"
	- `xsd` is actually "http://www.w3.org/2001/XMLSchema#"
 
then it should be accessible via `owlObject.nameSpaces[owl]`: 
 
 ```
	owlObject.nameSpaces[owl] = "http://www.w3.org/2002/07/owl#"
	owlObject.nameSpaces[xsd] = "http://www.w3.org/2001/XMLSchema#"
 ```

Now that we loaded owl file, we can also: 

- Get a list of NamedIndividual
- Get metadata of a specific NamedIndividual

##### Get a list of NamedIndividual

`NamedIndividual` can be retrieved based on its type via 
`owlObject.getNamedIndividuals(type)`. Consider an example, with the owlObject
well-initialized as above, we can get the NamedIndividual object named
"periode1ere" (from line 512 to 516 in
[programmeHistoire6emeV3.owl](./history/resource/programmeHistoire6emeV3.owl))
 via: 
 ```
	var prefix = owlObject.nameSpaces["organisation-systeme-scolaire-francais"];
	var period1 = owlObject.getNamedIndividuals(prefix + "periode1ere")[0];
 ```
 Note that the returned object is an array. That is, although the `periode1ere`
 object is unique, we still need to get that unique element via `[0]` as above.

##### Get metadata of a specific NamedIndividual
Now that we have period1, we can get its `about` property and `label` via
`owlObject.getMetaData(namedIndividual)`:

 ```
	var metaData = owlObject.getMetaData(period1);
	console.log(metaData[rdf:about]); // &Programme_Histoire_College_France;1ereGenerale
	console.log(metaData[rdfs:label]; // empty, as `period1` doesn't have label
 ```

With these baseline functions, we will implement the `educ-program-lib.js` to 
deal with 
[programmeHistoire6emeV3.owl](./history/resource/programmeHistoire6emeV3.owl), 
a specific ontology describling the history courses in french highschool.  

### educ-program-lib.js
Based on the api provided by owl-lib.js, we'll implement some functions to deal 
with the 
[programmeHistoire6emeV3.owl](./history/resource/programmeHistoire6emeV3.owl)
ontology. What we will to is to get all `NamedIndividual` whose type are 
`theme` or `subtheme`. The implementation is specifically linked to this ontology, 
nevertheless, it can be used as an example for similar situations. 
It has some main functions: 

- `getIsPartOf(element)` get the `isPartOf` attribute of a NamedElement
- `getSubThemeOf(element)` get sub theme of a theme
- `getKnowledgeOf(theme, prefix)` get all knowledge linked to the current theme
- `createProgramMenu(filter, prefix)`

The first three functions are used as their names indicated. The last one, 
`createProgramMenu(filter, prefix)` is the interface between 
[programmeHistoire6emeV3.owl](./history/resource/programmeHistoire6emeV3.owl) 
and `rolling-menu.js`. It'll parse this owl file and return data structures 
used by `rolling-menu.js`.

### rolling-menu.js
RollingMenu object can be instantiated via 
```
var rollingMenu = new RollingMenu(owlObject, eduProgramObject)
```
It's the front-end part, which displays all required information founded in 
[programmeHistoire6emeV3.owl](./history/resource/programmeHistoire6emeV3.owl).
This javascript file contains two functions: 

- `display()`
- `drawMenu(menuData)` where `menuData` is retrieved via 
`eduProgramObject.createProgramMenu(filter, prefix)`

Here, `display()` deals with presentation, css. It will be invoked as soon as 
`drawMenu(menuData)` finishes its works.






See [menu.html](./history/menu.html) for more details.











