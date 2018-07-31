(async function () {
    console.log('chatwork snippets loaded');
    let chatSendTool = null;

    function seekToolBar() {
        return new Promise(function (resolve, reject) {
            let setToolBar = setInterval(function () {
                chatSendTool = document.querySelector('#_chatSendTool');
                console.log(chatSendTool);
                if (chatSendTool) {
                    clearInterval(setToolBar);
                    resolve();
                }
            }, 1000);
        });
    }

    await seekToolBar();

    if (!chatSendTool) {
        return;
    }

    const textArea = document.getElementById("_chatText");

    // textarea の Undo 対応
    // https://mimemo.io/m/mqLXOlJe7ozQ19r
    // ※this.inputElmが対象になるtextarea
    function replaceWithRecoverable(textArea, str, fromIdx, toIdx) {
        let inserted = false;

        if (str) {
            let expectedLen = textArea.value.length - Math.abs(toIdx - fromIdx) + str.length;
            textArea.focus();
            textArea.selectionStart = fromIdx;
            textArea.selectionEnd = toIdx;
            try {
                inserted = document.execCommand('insertText', false, str);
            } catch (e) {
                inserted = false
            }
            if (inserted && (textArea.value.length !== expectedLen || textArea.value.substr(fromIdx, str.length) !== str)) {
                //firefoxでなぜかうまくいってないくせにinsertedがtrueになるので失敗を検知してfalseに…
                inserted = false;
            }
        }

        if (!inserted) {
            try {
                document.execCommand('ms-beginUndoUnit');
            } catch (e) {
            }
            let value = textArea.value;
            textArea.value = '' + value.substring(0, fromIdx) + str + value.substring(toIdx);
            try {
                document.execCommand('ms-endUndoUnit');
            } catch (e) {
            }
        }
    }


    function replaceTextArea(textArea, filter) {
        if (!textArea) {
            console.log('missing textArea');
            return;
        }


        textArea.focus();
        let content = textArea.value;
        let start = textArea.selectionStart;
        let end = textArea.selectionEnd;

        let texts = {
            'preText': content.substr(0, start),
            'postText': content.substr(end),
            'selectedText': content.substr(start, end - start)
        };

        texts.concat = function () {
            return this.preText + this.selectedText + this.postText;
        }.bind(texts);

        if (filter) {
            texts = filter(texts, content);
        }


        let res = texts.concat();
        replaceWithRecoverable(textArea, res, 0, content.length);
        // textArea.value = res;
        // 選択状態・カーソル位置を復元する。
        textArea.selectionStart = texts.preText.length;
        textArea.selectionEnd = texts.preText.length + texts.selectedText.length;

        fireEvent(textArea, "change");

    }

    function createIcon(iconNode, description, filterFunc) {
        let code = document.createElement('li');
        code.setAttribute('id', '_techvein_codeIcon');
        code.setAttribute('role', 'button');
        code.setAttribute('class', '_showDescription icoFont');
        code.setAttribute('aria-label', description);
        code.setAttribute('style', 'font-size:13px;margin-right:6px;cursor: pointer;');
        code.appendChild(iconNode);
        chatSendTool.appendChild(code);

        code.addEventListener('click', function () {
            replaceTextArea(textArea, filterFunc);
        });
    }

    /// utility
    function fireEvent(element, event) {
        if (document.createEventObject) {
            // dispatch for IE
            let evt = document.createEventObject();
            return element.fireEvent('on' + event, evt)
        }
        else {
            // dispatch for firefox + others
            let evt = document.createEvent("HTMLEvents");
            evt.initEvent(event, true, true); // event type,bubbling,cancelable
            return !element.dispatchEvent(evt);
        }
    }

    // execute

    createIcon(
        document.createTextNode('[code]'),
        '[code]タグ埋め込み',
        function (texts) {
            let prefix = '[code]';
            let postfix = '[/code]';

            // 改行を足す(重複チェックあり)
            if (texts.selectedText.substr(0, 1) !== '\n') {
                prefix += '\n'; // codeは１行目の改行をスキップしてくれる。
            }
            if (texts.selectedText.slice(-1) !== '\n') { // last char
                postfix = '\n' + postfix;
            }
            if (texts.postText.substr(0, 1) !== '\n') {
                postfix += '\n';
            }
            texts.preText += prefix;
            texts.postText = postfix + texts.postText;
            return texts;
        });

    createIcon(
        document.createTextNode('[info]'),
        '[info]タグ埋め込み',
        function (texts) {
            let prefix = '[info]';
            let postfix = '[/info]';

            // 改行を足す(重複チェックあり)
            if (texts.selectedText.slice(-1) !== '\n') { // last char
                postfix = '\n' + postfix;
            }
            if (texts.postText.substr(0, 1) !== '\n') {
                postfix += '\n';
            }
            texts.preText += prefix;
            texts.selectedText = '[title][/title]' + texts.selectedText;
            texts.postText = postfix + texts.postText;
            return texts;
        });

    createIcon(
        document.createTextNode('[hr]'),
        '[hr]タグ埋め込み',
        function (texts) {
            texts.preText += '[hr]';
            return texts;
        });

    let img = document.createElement('img');
    img.src = chrome.extension.getURL('images/to_anon.png');
    img.style = "width:40px; height:18px";
    createIcon(
        img,
        '[To:]を短くします',
        function (texts, original) {
            texts.preText = original.replace(/(\[To:\d+\])[^\[]+?((?=\[)|\n|$)/gi, "$1 ");
            texts.selectedText = "";
            texts.postText = "";
            return texts;
        });

    // --------

    /// "@"が入力された時に、"TO"がクリックされる機能をtextAreaに追加する
    function registerAtmarkShortcutEvent(textArea, toListButton, toList) {
        // "@"が入力された時に、"TO"がクリックされる
        textArea.addEventListener("keypress", (event) => {
            if (event.key === '@') {
                toListButton.click();
            }
        });

        // TO(宛先)のリストを選択した場合、"@"があれば"@"を消す
        toList.addEventListener("click", () => {
            const cursorPos = textArea.selectionStart;
            // 埋め込まれたTOを探す
            const content = textArea.value;
            const subContent = content.substr(0, cursorPos);
            const toPos = Math.max(subContent.lastIndexOf("[To:"), subContent.lastIndexOf("[toall]"));

            const targetChar = content.charAt(toPos - 1);
            if (targetChar !== '@') {
                return;
            }
            textArea.value = content.slice(0, toPos - 1) + content.slice(toPos);
        });
    }

    const toList = document.getElementById("_toList");

    // メインのチャット画面
    registerAtmarkShortcutEvent(
        textArea,
        document.getElementById("_to"),
        toList
    );

    // 画像アップロードモーダル
    registerAtmarkShortcutEvent(
        document.getElementById("_fileUploadMessage"),
        document.getElementById("_mentionSelectFileUpload"),
        document.getElementById("_toListFileUpload")
    );

    // 宛先リストが開いている際 ESC を押した時に入力エリアにフォーカスが戻るように
    toList.querySelector("input.tooltip__searchForm").addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            textArea.focus();
        }
    });
})();
