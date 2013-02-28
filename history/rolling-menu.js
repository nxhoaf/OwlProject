var RollingMenu = function () {
	rollingMenu = {};
	
	
	rollingMenu.drawMenu = function () {
        // On cache les sous-menus
        // sauf celui qui porte la classe "open_at_load" :
        $("ul.subMenu:not('.open_at_load')").hide();
        // On selectionne tous les items de liste portant la classe "toggleSubMenu"
    
        // et on remplace l'element span qu'ils contiennent par un lien :
        $("li.toggleSubMenu span").each( function () {
            // On stocke le contenu du span :
            var TexteSpan = $(this).text();
            $(this).replaceWith('<a href="" title="Afficher le sous-menu">' + 
            		TexteSpan + '</a>') ;
        } ) ;
    
        // On modifie l'evenement "click" sur les liens dans les items de liste
        // qui portent la classe "toggleSubMenu" :
        $("li.toggleSubMenu > a").click( function () {
            // Si le sous-menu etait deja ouvert, on le referme :
            if ($(this).next("ul.subMenu:visible").length != 0) {
                $(this).next("ul.subMenu").slideUp("normal", function () { 
                	$(this).parent().removeClass("open") 
            	} );
            }
            // Si le sous-menu est cache, on ferme les autres et on l'affiche :
            else {
                $("ul.subMenu").slideUp("normal", function () { 
                	$(this).parent().removeClass("open") 
            	} );
                
                $(this).next("ul.subMenu").slideDown("normal", function () { 
                	$(this).parent().addClass("open") 
            	} );
            }
            // On empêche le navigateur de suivre le lien :
            return false;
        });
	}
	
	
	rollingMenu.createMenu = function() {
		var owlLib = new OwlLib();
		owlLib.loadOwl("resource/programmeHistoire6emeV2.owl");   
		
    	var frHistoryLib = new FrHistoryLib(owlLib);
		
    	var themes = owlLib.getNamedIndividuals(
    		"Programme_Histoire_College_France#theme");
    	for (var i = 0; i < themes.length; i++) {
			var theme = themes[i];
			var themeMetadata = owlLib.getMetaData(theme);
			
			// Get theme label and display it if not null
			li = document.createElement("li");
			li.setAttribute("class","toggleSubMenu");
			a = document.createElement("a");http://youtu.be/IUiDfJG54fQ
			a.title = "";
			a.textContent = themeMetadata[CONSTANT.LABEL];
			a.name = themeMetadata[CONSTANT.ABOUT];
			li.appendChild(a);
			
			var allSubThemes = owlLib.getNamedIndividuals(
					"Programme_Histoire_College_France#soustheme"); 
			var subThemes = frHistoryLib.
					getSubThemesOf(themeMetadata[CONSTANT.ABOUT], allSubThemes);
			if ((subThemes != null) && (subThemes.length != 0)) {
				// Has Sub Theme, create list of sub theme
				ul = document.createElement("ul");
				ul.setAttribute("class", "subMenu");
				for (var j = 0; j < subThemes.length; j++) {
					var subTheme = subThemes[j];
					
					subLi = document.createElement("li");
					
					subA = document.createElement("a");
					subA.title = "";
					subA.name = subTheme[CONSTANT.ABOUT];
					subA.onclick = function () {
						var knowledge = frHistoryLib.
								getKnowledgeOf(this.name);
								
						var knowledgeList = document.
								getElementById("knowledgeList");
						knowledgeList.innerHTML = ""; // clear content
						var knowledgeLabel = document.
								getElementById("knowledgeLabel");
						knowledgeLabel.style.visibility = 'visible';
						
						for (var k = 0; k < knowledge.length; k++) {
							
							var checkbox = document.createElement('input');
							checkbox.type = "checkbox";
							checkbox.name = "knowledge";
							checkbox.value = knowledge[k];
							checkbox.id = "knowledge_" + k;
							
							var label = document.createElement('label')
							label.htmlFor = "id";
							label.appendChild(document.createTextNode(
									knowledge[k][CONSTANT.LABEL]));
							
							var br = document.createElement("br");
								
							knowledgeList.appendChild(checkbox);
							knowledgeList.appendChild(label);
							knowledgeList.appendChild(br);
						}
					};
					subA.textContent = subTheme[CONSTANT.LABEL];
					subLi.appendChild(subA);
					
					// subLi.textContent = subTheme[CONSTANT.ABOUT];
					
					ul.appendChild(subLi);	
				}
				li.appendChild(ul);
			} else {
				
				a.onclick = function () {
					console.log(a.textContent + " don't have sub elements");
					var knowledge = frHistoryLib.
								getKnowledgeOf(this.name);
					var knowledgeList = document.
							getElementById("knowledgeList");
					knowledgeList.innerHTML = ""; // clear content
					var knowledgeLabel = document.
							getElementById("knowledgeLabel");
					knowledgeLabel.style.visibility = 'visible';
					
					// Knowledge not found
					if ((knowledge == null) || (knowledge.length == 0)) {
						var notFound = document.createTextNode("None");
						knowledgeList.appendChild(notFound);
						
					} else {
						for (var k = 0; k < knowledge.length; k++) {
						
						var checkbox = document.createElement('input');
						checkbox.type = "checkbox";
						checkbox.name = "knowledge";
						checkbox.value = knowledge[k];
						checkbox.id = "knowledge_" + k;
						
						var label = document.createElement('label')
						label.htmlFor = "id";
						label.appendChild(document.createTextNode(
								knowledge[k][CONSTANT.LABEL]));
						
						var br = document.createElement("br");	
						knowledgeList.appendChild(checkbox);
						knowledgeList.appendChild(label);
						knowledgeList.appendChild(br);
						
						}
					}
				}
			
			}
			document.getElementById("navigation").appendChild(li);
		}
	}
	
	return rollingMenu;
}