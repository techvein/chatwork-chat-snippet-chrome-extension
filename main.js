(function(){
// document.addEventListener("DOMContentLoaded", function(e){
  console.log('chatwork snippets loaded');
  var chatSendTool = document.querySelector('#_chatSendTool');
  if(!chatSendTool){ return; }

  var code = document.createElement('li');
  code.setAttribute('id', '_techvein_codeIcon');
  code.setAttribute('role', 'button');
  code.setAttribute('class', '_showDescription icoFont');
  code.setAttribute('aria-label', '[code]タグ埋め込み');
  code.appendChild(document.createTextNode('[code]'));
  chatSendTool.appendChild(code);

  code.addEventListener('click', function(){
	    var chatText = document.querySelector('#_chatText');
	    replaceTextArea(chatText,function(text){
		    return '[code]' + text + '[/code]';
		  });
 	});

  var info = document.createElement('li');
  info.setAttribute('id', '_techvein_infoIcon');
  info.setAttribute('role', 'button');
  info.setAttribute('class', '_showDescription icoFont');
  info.setAttribute('aria-label', '[info]タグ埋め込み');
  info.appendChild(document.createTextNode('[info]'));
  chatSendTool.appendChild(info);

  info.addEventListener('click', function(){
    var chatText = document.querySelector('#_chatText');
    replaceTextArea(chatText,function(text){
	    return '[info]' + text + '[/info]';
		});
	});
  function replaceTextArea(textArea, filterSelectedText){
  	if(!textArea){
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
