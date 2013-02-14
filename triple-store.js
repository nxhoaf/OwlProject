var tripleStore = $('#info').rdf();
// alert(tripleStore.dump());

var theBeatles = $('#content')
	.rdf()
	.prefix('dbpedia', 'http://dbpedia.org/resource/')
	.about('dbpedia:The_Beatles');

var books = $.rdf.databank()
	.prefix('foaf', 'http://xmlns.com/foaf/0.1/')
	.prefix('dc', 'http://purl.org/dc/elements/1.1/')
	.prefix('dct', 'http://purl.org/dc/terms/')
	.prefix('xsd', 'http://www.w3.org/2001/XMLSchema#')
	.add('<http://example.com/aReallyGreatBook> dc:title "A Really Great Book" .')
	.add('<http://example.com/aReallyGreatBook> dc:creator _:creator .')
	.add('_:creator a foaf:Person .')
	.add('_:creator foaf:name "John Doe" .')
	.add('<http://example.com/aReallyGreatBook> dct:issued "2004-01-19"^^xsd:date .')

var another_stooge = eval(books.dump());
var name;
for (name in another_stooge) {
	if (typeof another_stooge[name] !== 'function') {
		document.writeln(name + ': ' + another_stooge[name]);
		alert(name + ': ' + another_stooge[name]);
	}
}