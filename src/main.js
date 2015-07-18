(function(){
// document.addEventListener("DOMContentLoaded", function(e){
  console.log('chatwork snippets loaded');
  var chatSendTool = document.querySelector('#_chatSendTool');
  if(!chatSendTool){ return; }

    function replaceTextArea(textArea, filter){
    	if(!textArea){
    	    console.log('missing textArea');
    	    return;
    	}


    	textArea.focus();
    	var content = textArea.value;
    	var start = textArea.selectionStart;
    	var end = textArea.selectionEnd;

    	var texts = {
        'preText': content.substr(0, start),
    	  'postText': content.substr(end),
    	  'selectedText': content.substr(start, end - start)
      };

      if(filter){
        texts = filter(texts);
      }

    	var res = texts.preText + texts.selectedText + texts.postText;
    	textArea.value = res;
      // 選択状態・カーソル位置を復元する。
      textArea.selectionStart = texts.preText.length;
      textArea.selectionEnd = texts.preText.length + texts.selectedText.length;

    }
    function createIcon(iconNode, description, filterFunc){
      var code = document.createElement('li');
      code.setAttribute('id', '_techvein_codeIcon');
      code.setAttribute('role', 'button');
      code.setAttribute('class', '_showDescription icoFont');
      code.setAttribute('aria-label', description);
      code.appendChild(iconNode);
      chatSendTool.appendChild(code);

      code.addEventListener('click', function(){
        var chatText = document.querySelector('#_chatText');
        replaceTextArea(chatText,filterFunc);
     	});
    }

    createIcon(
      document.createTextNode('[code]'),
      '[code]タグ埋め込み',
      function(texts){
        var prefix = '[code]';
        var postfix = '[/code]';

        // 改行を足す(重複チェックあり)
        if(texts.selectedText.substr(0,1) != '\n'){
          prefix += '\n'; // codeは１行目の改行をスキップしてくれる。
        }
        if(texts.selectedText.slice(-1) != '\n'){ // last char
          postfix = '\n' + postfix;
        }
        if(texts.postText.substr(0,1) != '\n'){
          postfix += '\n';
        }
        texts.preText +=  prefix;
        texts.postText = postfix + texts.postText;
        return texts;
    });

    createIcon(
      document.createTextNode('[info]'),
      '[info]タグ埋め込み',
      function(texts){
        var prefix = '[info]';
        var postfix = '[/info]';

        // 改行を足す(重複チェックあり)
        if(texts.selectedText.slice(-1) != '\n'){ // last char
          postfix = '\n' + postfix;
        }
        if(texts.postText.substr(0,1) != '\n'){
          postfix += '\n';
        }
        texts.preText +=  prefix;
        texts.selectedText = '[title][/title]' + texts.selectedText;
        texts.postText = postfix + texts.postText;
        return texts;
    });

    createIcon(
      document.createTextNode('[hr]'),
      '[hr]タグ埋め込み',
      function(texts){
        texts.preText += '[hr]';
        return texts;
	  });

})();
