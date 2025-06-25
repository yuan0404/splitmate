let notebooks = JSON.parse(localStorage.getItem("notebooks")) || [];
let currentNotebook = localStorage.getItem("currentNotebook") || "";
let members = JSON.parse(localStorage.getItem(`M_${currentNotebook}`)) || [];
let data = JSON.parse(localStorage.getItem(`D_${currentNotebook}`)) || [];
let isEditing = false;

function renderNotebookList() {
    if (!notebooks.includes(currentNotebook)) {
        currentNotebook = "";
        localStorage.removeItem("currentNotebook");
    }

    const $list = $("#notebookList");
    $list.empty();

    if (notebooks.length === 0) {
        $list.append("<li>目前沒有帳本</li>");
        $("#inputNotebook").focus();
        return;
    }

    notebooks.forEach((name, index) => {
        const isCurrent = name === currentNotebook;
        members = JSON.parse(localStorage.getItem(`M_${name}`)) || [];

        if (isCurrent) {
            $list.append(`
            <li class="notebookItem" data-index="${index}" data-name="${name}">
                <div>${name} (${members.length})</div>
                <div>
                    <span>${members.length > 0
                    ? members
                        .map((m, i) => `<div>${m} <button class="deleteMemberBtn" data-member="${m}" style="display: ${isEditing ? "inline-block" : "none"};"> 刪除 </button></div>`)
                        .join("")
                    : ""
                }</span>
                </div>
                <div>
                    <input type="text" class="inputMember" placeholder="輸入成員名稱" style="display: ${isEditing ? "inline-block" : "none"};">
                    <button class="addMemberBtn" data-index="${index}" style="display: ${isEditing ? "inline-block" : "none"};">新增</button>
                </div>
                <div>
                    <button class="editNotebookBtn" data-index="${index}"> ${isEditing ? "完成編輯" : "編輯成員"} </button>
                    <button class="deleteNotebookBtn" data-index="${index}"> 移除帳本 </button>
                </div>
            </li>
        `);
        }
        else {
            $list.append(`
                <li class="notebookItem" data-index="${index}" data-name="${name}">
                    <div>${name} (${members.length})</div>
                </li>
            `);
        }
    });
}

function renderTable() {
    const $tbody = $("#dataTable tbody");
    $tbody.empty();

    data.forEach((p, i) => {
        $tbody.append(`
            <tr>
                <td>${p.item}</td>
                <td>${p.total}</td>
                <td>${p.payer}</td>
                <td>${String(p.split).split(",").join("<br>")}</td>
                <td><button class="deleteBtn" data-index="${i}">刪除</button></td>
            </tr>
        `);
    });

    if (!currentNotebook) {
        $tbody.append("<tr><td colspan='7'>請先選擇或創建一個帳本</td></tr>");
        return;
    }

    if (members.length === 0) {
        $tbody.append("<tr><td colspan='7'>目前沒有成員，請先新增成員</td></tr>");
        return;
    }

    $tbody.append(`
        <tr>
            <td><input type="text" id="inputItem" placeholder="輸入項目"></td>
            <td><input type="text" id="inputTotal" placeholder="輸入總額"></td>
            <td>
                <select id="inputPayer">
                    <option value="" selected disabled> 請選擇 </option>
                    ${members.map(m => `<option value="${m}">${m}</option>`).join("")}
                </select>
            </td>
            <td>
                <div id="inputSplit">
                    ${members.map(m => `
                        <label class="splitLabel">
                            <div>${m}: </div> 
                            <input type="text" class="inputAmount" data-member="${m}" placeholder="輸入金額">
                        </label>
                    `).join("")}
                </div>
            </td>
            <td><button class="addBtn"> 新增 </button></td>
        </tr>
    `);
}

$(document).ready(function () {
    renderNotebookList();
    renderTable();

    $("#notebookList").on("click", ".notebookItem", function () {
        const selected = String($(this).data("name"));
        if (selected === currentNotebook) return;
        currentNotebook = selected;
        isEditing = false;
        localStorage.setItem("currentNotebook", currentNotebook);
        renderNotebookList();
        members = JSON.parse(localStorage.getItem(`M_${currentNotebook}`)) || [];
        data = JSON.parse(localStorage.getItem(`D_${currentNotebook}`)) || [];
        renderTable();
    });

    $("#notebookList").on("click", ".deleteMemberBtn", function () {
        const member = $(this).data("member");
        members = JSON.parse(localStorage.getItem(`M_${currentNotebook}`)) || [];
        const index = members.indexOf(member);
        members.splice(index, 1);
        localStorage.setItem(`M_${currentNotebook}`, JSON.stringify(members));
        renderNotebookList();
        renderTable();
        $(".inputMember").focus();
    });

    $("#notebookList").on("click", ".addMemberBtn", function () {
        const member = $(".inputMember").val().trim();
        if (!member) {
            alert("請輸入成員名稱");
            $(".inputMember").focus();
            return;
        }

        members = JSON.parse(localStorage.getItem(`M_${currentNotebook}`)) || [];
        if (members.includes(member)) {
            alert("成員已存在！");
            $(".inputMember").focus();
            return;
        }

        members.push(member);
        localStorage.setItem(`M_${currentNotebook}`, JSON.stringify(members));
        $(".inputMember").val("");
        renderNotebookList();
        renderTable();
        $(".inputMember").focus();
    });

    $("#notebookList").on("click", ".editNotebookBtn", function () {
        $(".inputMember").toggle();
        $(".addMemberBtn").toggle();
        $(".deleteMemberBtn").toggle();

        isEditing = !isEditing;
        if (isEditing) {
            $(this).text("完成編輯");
        } else {
            $(this).text("編輯成員");
        }

        renderNotebookList();
        renderTable();

        if (isEditing) {
            $(".inputMember").focus();
        }
    });

    $("#notebookList").on("click", ".deleteNotebookBtn", function () {
        const index = $(this).closest(".notebookItem").data("index");
        const name = notebooks[index];

        if (confirm(`你確定要刪除帳本「${name}」嗎？`)) {
            notebooks.splice(index, 1);
            localStorage.setItem("notebooks", JSON.stringify(notebooks));
            renderNotebookList();
            members = [];
            localStorage.removeItem(`M_${name}`);
            data = [];
            localStorage.removeItem(`D_${name}`);
            renderTable();
        }
    });

    $("#createNotebookBtn").click(function () {
        const name = $("#inputNotebook").val().trim();
        if (!name) {
            alert("請輸入帳本名稱");
            $("#inputNotebook").focus();
            return;
        }
        if (notebooks.includes(name)) {
            alert("帳本名稱已存在！");
            $("#inputNotebook").focus();
            return;
        }

        notebooks.push(name);
        localStorage.setItem("notebooks", JSON.stringify(notebooks));
        currentNotebook = name;
        localStorage.setItem("currentNotebook", currentNotebook);
        $("#inputNotebook").val("");
        renderNotebookList();
        members = [];
        localStorage.setItem(`M_${currentNotebook}`, JSON.stringify(members));
        data = [];
        localStorage.setItem(`D_${currentNotebook}`, JSON.stringify(data));
        renderTable();
    });

    $("#dataTable").on("click", ".addBtn", function () {
        const item = $("#inputItem").val().trim();
        const totalStr = $("#inputTotal").val().trim();
        const total = parseFloat(totalStr);
        const payer = $("#inputPayer").val();
        const split = [];
        let splitSum = 0;
        $(".inputAmount").each(function () {
            const member = $(this).data("member");
            const amountStr = $(this).val().trim();
            const amount = parseFloat(amountStr);
            if (amount && amount > 0) {
                split.push(`${member}: ${amount}`);
                splitSum += amount;
            }
        });

        if (!item) {
            alert("請輸入項目");
            $("#inputItem").focus();
            return;
        }
        if (!totalStr || isNaN(total) || total <= 0) {
            alert("請輸入正確的總額");
            $("#inputTotal").focus();
            return;
        }
        if (!payer) {
            alert("請選擇付款成員");
            $("#inputPayer").focus();
            return;
        }
        if (split.length === 0) {
            alert("請輸入分帳金額");
            $(".inputAmount").first().focus();
            return;
        }
        if (Math.abs(splitSum - total) > 0.01) {
            alert("分帳金額總和須等於總額");
            $(".inputAmount").first().focus();
            return;
        }

        data.push({ item: item, total: total, payer: payer, split: split });
        localStorage.setItem(`D_${currentNotebook}`, JSON.stringify(data));
        renderTable();

        $("#inputItem").val("");
        $("#inputTotal").val("");
        $("#inputPayer").val("");
        $(".splitCheckbox").prop("checked", false);
    });

    $("#dataTable").on("click", ".deleteBtn", function () {
        const index = $(this).data("index");
        data.splice(index, 1);
        localStorage.setItem(`D_${currentNotebook}`, JSON.stringify(data));
        renderTable();
    });

    $("#clearBtn").click(function () {
        if (confirm("你確定要清除所有分帳資料嗎？這個動作無法復原。")) {
            data = [];
            localStorage.setItem(`D_${currentNotebook}`, JSON.stringify(data));
            renderTable();
            alert("所有資料已清除！");
        }
    });

    $("#inputFile").change(function () {
        const fileName = this.files[0] ? this.files[0].name : "未選擇檔案";
        $("#inputFileDisplay").text(fileName);
    });

    $("#importBtn").click(function () {
        const fileInput = document.getElementById("inputFile");
        const file = fileInput.files[0];
    
        if (!file) {
            alert("請先選擇一個 JSON 檔案！");
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const imported = JSON.parse(e.target.result);
                const { notebook, members: importedMembers, data: importedData } = imported;

                if (!notebook || !Array.isArray(importedMembers) || !Array.isArray(importedData)) {
                    alert("檔案格式錯誤！");
                    return;
                }

                if (!notebooks.includes(notebook)) {
                    notebooks.push(notebook);
                    localStorage.setItem("notebooks", JSON.stringify(notebooks));
                } else {
                    alert("帳本已存在！")
                    return;
                }

                currentNotebook = notebook;
                members = importedMembers;
                data = importedData;
                localStorage.setItem("currentNotebook", currentNotebook);
                localStorage.setItem(`M_${notebook}`, JSON.stringify(importedMembers));
                localStorage.setItem(`D_${notebook}`, JSON.stringify(importedData));
                renderNotebookList();
                renderTable();
            } catch (err) {
                alert("無法解析 JSON 檔案！");
            }
        };
        reader.readAsText(file);
        $("#inputFile").val("");
        $("#inputFileDisplay").text("選擇檔案");
    });

    $("#exportBtn").click(function () {
        const text = data.map(p => {
            return `項目: ${p.item}, 總額: ${p.total}, 付款人: ${p.payer}, 分帳: ${p.split.join(", ")}`;
        }).join("\n");
        if (!text) {
            alert("沒有可匯出的內容。");
            return;
        }

        const jsonString = JSON.stringify({ notebook: currentNotebook, members: members, data: data }, null, 4);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "data.json";
        a.click();
        URL.revokeObjectURL(url);
        alert("分帳資料已匯出！");
    });

    $("#copyBtn").click(function () {
        const text = $("#resultArea").val();
        if (!text) {
            alert("沒有可複製的內容。");
            return;
        }

        navigator.clipboard.writeText(text).then(function () {
            alert("已複製分帳結果！");
        }, function () {
            alert("複製失敗，請手動複製。");
        });
    });

    $("#shareBtn").click(function () {
        const text = $("#resultArea").val();
        if (!text) {
            alert("沒有可分享的內容。");
            return;
        }

        navigator.share({
            title: "分帳結果",
            text: text
        });
    });
});
