var RollingMenu = function (frHistoryLib) {
	rollingMenu = {};
	
	/**
	 * 
	 */
	rollingMenu.display = function () {
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
	
	
	rollingMenu.drawMenu = function(menuData) {
    	for (var i = 0; i < menuData.length; i++) {
			var menuItem = menuData[i];
			
			// Get theme label and display it if not null
			li = document.createElement("li");
			li.setAttribute("class","toggleSubMenu");
			a = document.createElement("a");http://youtu.be/IUiDfJG54fQ
			a.title = "";
			a.textContent = menuItem.label;
			a.name = menuItem.about;
			li.appendChild(a);
			
			var subItems = menuItem.subItems;
			if ((subItems != null) && (subItems.length != 0)) {
				// Has Sub Theme, create list of sub theme
				ul = document.createElement("ul");
				ul.setAttribute("class", "subMenu");
				for (var j = 0; j < subItems.length; j++) {
					var subItem = subItems[j];
					
					subLi = document.createElement("li");
					
					subA = document.createElement("a");
					subA.title = "";
					subA.name = subItem.about;
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
					subA.textContent = subItem.label;
					subLi.appendChild(subA);
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
    	
    	// Ok, now display the menu
    	rollingMenu.display();
	}
	
	return rollingMenu;
}