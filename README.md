## OwlProject

## RdfaParser using rdf-lib.js
In this part, we describle how to use rdf-lib.js to retrieve all rdfa attribute of
an HTML page.

Consider this simple HTML page below (say person.js)
```
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

This library depends on jQuery, so we must include jQuery in order to use it:
```
<head>
	<meta charset="UTF-8" />
    <title>Nxhoaf's Home Page</title>
	<script src="http://code.jquery.com/jquery-latest.js"></script>
    <script src="./rdf-lib.js"></script>
</head>
```

Now that we have jQuery, we use is to listen to the "ready" event. Whenever the page 
is ready, we initialize our library: 

```js
<script>
	$(document).ready(function () {
		RdfLib.init();
	});
</script>
```
From now, we can retrieve some data structure:

### Retrieve all rdfa prefixes
From now, we can retrieve all rdfa prefixes via:
`var prefixes = RdfLib.prefixes;`
The result is an object contain all rdfa prefixes in the page. In our example page, 
we should have
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

### Retrieve all rdfa attributes

After calling `RdfLib.init()`, we can get all rdfa attributes located in the page via 
`RdfLib.rdfa` attribute. This is an object containing all rdfa in the page. 
This object is a triple-like {subject, predicate, object} data structure:
```
rdfa[subject] = [predicate_1, predicate_2, ......, predicate_n]
predicate 	= [object_1, object_2, ............., object_n]
```
or briefly, for a given subject and predicate, we have an array of object. (Note that 
the term 'object' here is the **object** in the triple, not an JavaScript object): 
```
rdfa[subject][predicate] = [object_1, object_2, ............., object_n]
```
Here is an example of how to loop over our rdfa for displaying all triple. Assume that we have a 'div'
element in our page whose id is "#log":
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
This library provide us the possibility of getting an rdfa triple in a clicked HTML element. Here we have 
two cases: 

1. The clicked element doesn't have a subject. For example `<span property="dc:creator">Joshua Bloch</span>`  
in our example
2. The clicked element has a subject, for example `<span resource="urn:ISBN:978-0321356680">`

#### The clicked element has a subject

#### The clicked element doesn't have a subject
First, we get the triple 

### Blacklist a 'face triple'

Black list a face triple


See [person.html](./history/menu.html) to view full source code.
## OwlParser using owl-lib.js











