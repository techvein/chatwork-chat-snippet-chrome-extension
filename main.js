(function(){
// document.addEventListener("DOMContentLoaded", function(e){
    console.log('chatwork snippets loaded');
    var $chatSendTool = $('#_chatSendTool');
    if($chatSendTool.size() == 0){ return; }

    var $code = $('<li id="_techvein_codeIcon" role="button" class="_showDescription icoFont" aria-label="[code]タグ埋め込み">[code]</li>'
		  );
    $chatSendTool.append($code);

    $code.on('click', function(){
	    var $chatText = $('#_chatText');
	    replaceTextArea($chatText,function(text){ 
		    return '[code]' + text + '[/code]';
		});
	});

    var $info = $('<li id="_techvein_codeIcon" role="button" class="_showDescription icoFont" aria-label="[info]タグ埋め込み">[info]</li>'
		  );
    $chatSendTool.append($code);

    $info.on('click', function(){
	    var $chatText = $('#_chatText');
	    replaceTextArea($chatText,function(text){ 
		    return '[info]' + text + '[/info]';
		});
	});
  
    function replaceTextArea($textArea, filterSelectedText){
	var textArea = $textArea.get(0);
	if(textArea == undefined){ 
	    console.log('missing textArea');
	    return; 
	}
	textArea.focus(); 
	var content = textArea.value;
	var start = textArea.selectionStart;
	var end = textArea.selectionEnd;
	var preText = content.substr(0, start);
	var postText = content.substr(end);
	var selectedText = content.substr(start, end - start);
	var res = preText + filterSelectedText(selectedText) + postText;
	textArea.value = res;
    }
})();
