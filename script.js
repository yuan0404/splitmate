let notebooks = JSON.parse(localStorage.getItem("notebooks")) || [];
let currentNotebook = localStorage.getItem("currentNotebook") || "";
let splitData = JSON.parse(localStorage.getItem(currentNotebook)) || [];

function renderNotebookList() {
    if (!notebooks.includes(currentNotebook)) {
        currentNotebook = "";
        localStorage.removeItem("currentNotebook");
    }

    const $list = $("#notebookList");
    $list.empty();

    if (notebooks.length === 0) {
        $list.append("<li>目前沒有帳本</li>");
        return;
    }

    notebooks.forEach((name, index) => {
        const isCurrent = name === currentNotebook;
        if (isCurrent) {
            $list.append(`
            <li class="notebookItem" data-index="${index}" data-name="${name}">
                ${name}
                <div class="notebookMembers">
                
                </div>
                <br>
                <div class="notebookActions">
                    <button class="deleteNotebookBtn" data-index="${index}"> 移除帳本 </button>
                </div>
            </li>
        `);
        }
        else {
            $list.append(`
                <li class="notebookItem" data-index="${index}" data-name="${name}">
                    ${name}
                </li>
            `);
        }
    });
}

function renderTable() {
    const $tbody = $("#dataTable tbody");
    $tbody.empty();

    splitData.forEach((p, i) => {
        $tbody.append(`
            <tr>
                <td>${p.name}</td>
                <td>${p.amount}</td>
                <td><button class="deleteBtn" data-index="${i}">刪除</button></td>
            </tr>
        `);
    });

    $tbody.append(`
        <tr>
            <td><input type="text" id="inputName" placeholder="輸入名字"></td>
            <td><input type="text" id="inputAmount" placeholder="輸入金額"></td>
            <td><button class="addBtn"> 新增 </button></td>
        </tr>
    `);
}

$(document).ready(function () {
    renderNotebookList();
    renderTable();

    $("#notebookList").on("click", ".notebookItem", function () {
        const selected = String($(this).data("name"));
        currentNotebook = selected;
        localStorage.setItem("currentNotebook", currentNotebook);
        renderNotebookList();
        splitData = JSON.parse(localStorage.getItem(currentNotebook)) || [];
        renderTable();
    });

    $("#notebookList").on("click", ".deleteNotebookBtn", function () {
        const index = $(this).closest(".notebookItem").data("index");
        const name = notebooks[index];

        if (confirm(`你確定要刪除帳本「${name}」嗎？`)) {
            notebooks.splice(index, 1);
            localStorage.setItem("notebooks", JSON.stringify(notebooks));
            renderNotebookList();
            splitData = [];
            localStorage.removeItem(name);
            renderTable();
        }
    });


    $("#createNotebookBtn").click(function () {
        const name = $("#notebookInput").val().trim();
        if (!name) {
            alert("請輸入帳本名稱");
            return;
        }
        if (notebooks.includes(name)) {
            alert("帳本名稱已存在！");
            return;
        }

        notebooks.push(name);
        localStorage.setItem("notebooks", JSON.stringify(notebooks));
        currentNotebook = name;
        localStorage.setItem("currentNotebook", currentNotebook);
        $("#notebookInput").val("");
        renderNotebookList();
        splitData = [];
        localStorage.setItem(currentNotebook, JSON.stringify(splitData));
        renderTable();
    });

    $("#dataTable").on("click", ".addBtn", function () {
        if (!currentNotebook) {
            alert("請先選擇或創建一個帳本");
            return;
        }

        const name = $("#inputName").val().trim();
        const amount = $("#inputAmount").val().trim();
        const num = parseFloat(amount);

        if (!name) {
            alert("請輸入名字");
            return;
        }
        if (!amount || isNaN(num) || num <= 0) {
            alert("請輸入正確的金額");
            return;
        }

        splitData.push({ name: name, amount: num });
        localStorage.setItem(currentNotebook, JSON.stringify(splitData));
        renderTable();

        $("#inputName").val("");
        $("#inputAmount").val("");
    });

    $("#dataTable").on("click", ".deleteBtn", function () {
        if (!currentNotebook) {
            alert("請先選擇或創建一個帳本");
            return;
        }

        const index = $(this).data("index");
        splitData.splice(index, 1);
        localStorage.setItem(currentNotebook, JSON.stringify(splitData));
        renderTable();
    });

    $("#clearBtn").click(function () {
        if (!currentNotebook) {
            alert("請先選擇或創建一個帳本");
            return;
        }

        if (confirm("你確定要清除所有分帳資料嗎？這個動作無法復原。")) {
            splitData = [];
            localStorage.setItem(currentNotebook, JSON.stringify(splitData));
            renderTable();
            alert("所有資料已清除！");
        }
    });
});