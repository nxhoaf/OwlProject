var databank = $.rdf.databank([
    '<photo1.jpg> dc:creator <http://www.blogger.com/profile/1109404> .',
    '<http://www.blogger.com/profile/1109404> foaf:img <photo1.jpg> .'
  ], 
  { base: 'http://www.example.org/',
    namespaces: { 
      dc: 'http://purl.org/dc/elements/1.1/', 
      foaf: 'http://xmlns.com/foaf/0.1/' } });

var triples = databank.triples();
      
  
alert(triples(0));