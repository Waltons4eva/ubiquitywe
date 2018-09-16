
$(onDocumentLoad);

function onDocumentLoad() {

    let commandList = $("#context-menu-commands");
    
    for (let cmd of CmdUtils.ContextMenuCommands) {
        commandList.append(`<tr id="${cmd.uuid}">
            <td class="remove-item" title="Remove item">&#xD7;</td>
            <td class="item-icon"><img height="16px" width="16px" src="${cmd.icon}"/></td>
            <td class="item-label"><input type="text" name="label" title="Menu item label" value="${Utils.escapeHtml(cmd.label)}"/></td>
            <td><input type="text" name="command" title="Menu item command" value="${Utils.escapeHtml(cmd.command)}" disabled/></td>
            <td class="execute-item"><input type="checkbox" name="execute" title="Execute" ${cmd.execute ? "checked" : ""}/>
            <img src="icons/execute.png" title="Execute"/></td>
        </tr>`);
    }

    $("#context-menu-commands .remove-item").click((e) => {
        let tr = e.target.parentNode;
        if (confirm("Do you really want to delete \"" + $(tr).find("input[name='label']").val() + "\"?")) {
            let cm = CmdUtils.getContextMenuCommand($(tr).find("input[name='command']").val());
            let i = CmdUtils.ContextMenuCommands.indexOf(cm);
            CmdUtils.ContextMenuCommands.splice(i, 1);
            tr.parentNode.removeChild(tr);
            CmdUtils.createContextMenu();
            Utils.setPref("contextMenuCommands", CmdUtils.ContextMenuCommands);
        }
    });

    $("#context-menu-commands input[name='label']").blur((e) => {
        let tr = e.target.parentNode.parentNode;
        if (e.target.value) {
            let cm = CmdUtils.getContextMenuCommand($(tr).find("input[name='command']").val());
            cm.label = e.target.value;
            CmdUtils.createContextMenu();
            Utils.setPref("contextMenuCommands", CmdUtils.ContextMenuCommands);
        }
    });

    $("#context-menu-commands input[name='execute']").change((e) => {
        let tr = e.target.parentNode.parentNode;
        let cm = CmdUtils.getContextMenuCommand($(tr).find("input[name='command']").val());
        cm.execute = e.target.checked;
        Utils.setPref("contextMenuCommands", CmdUtils.ContextMenuCommands);
    });

    Utils.getPref("rememberContextMenuCommands", rememberContextMenuCommands => {
        let cmHistorySwitch = $("#cm-history-switch");
        cmHistorySwitch.prop("checked", !rememberContextMenuCommands);
        CmdUtils.rememberContextMenuCommands = rememberContextMenuCommands;
        cmHistorySwitch.change((e) => {
            CmdUtils.rememberContextMenuCommands = !e.target.checked;
            Utils.setPref("rememberContextMenuCommands", CmdUtils.rememberContextMenuCommands);
        });
    });

}