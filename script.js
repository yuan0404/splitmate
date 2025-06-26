let currentNotebook = localStorage.getItem("currentNotebook") || "";
let notebooks = JSON.parse(localStorage.getItem("notebooks")) || [];
let members = JSON.parse(localStorage.getItem(`M_${currentNotebook}`)) || [];
let data = JSON.parse(localStorage.getItem(`D_${currentNotebook}`)) || [];
let isEditing = false;

function notebookList() {
    const $list = $("#notebookList");
    $list.empty();

    notebooks = JSON.parse(localStorage.getItem("notebooks")) || [];
    currentNotebook = localStorage.getItem("currentNotebook") || "";
    if (!notebooks.includes(currentNotebook)) {
        currentNotebook = "";
        localStorage.removeItem("currentNotebook");
    }

    if (!notebooks || notebooks.length === 0) {
        $list.append("<li> 目前沒有帳本 </li>");
        $("#notebookInput").focus();
        return;
    }
    
    notebooks.forEach((n, i) => {
        members = JSON.parse(localStorage.getItem(`M_${n}`)) || [];
        if (n === currentNotebook) {
            $list.append(`
                <li class="notebookItem" data-name="${n}" data-index="${i}">
                    <strong class="notebookName"> ${n} (${members.length}) </strong>
                    <div>
                        ${members.map((m) => `
                            <div class="memberRow">
                                <span class="memberName"> ${m} </span>
                                <button class="deleteMemberBtn" data-member="${m}" style="display: ${isEditing ? "inline-block" : "none"};"> 刪除 </button></div>
                        `).join("")}
                        <input type="text" class="memberInput" placeholder="輸入成員名稱" style="display: ${isEditing ? "inline-block" : "none"};">
                        <button class="addMemberBtn" data-index="${i}" style="display: ${isEditing ? "inline-block" : "none"};"> 新增 </button>
                    </div>
                    <button class="editNotebookBtn" data-index="${i}"> ${isEditing ? "完成編輯" : "編輯成員"} </button>
                    <button class="deleteNotebookBtn" data-index="${i}"> 移除帳本 </button>
                </li>
            `);
        }
        else {
            $list.append(`
                <li class="notebookItem" data-name="${n}" data-index="${i}"> 
                    <div class="notebookName"> ${n} (${members.length}) </div>
                </li>
            `);
        }
    });
}

function dataTable() {
    const $tbody = $("#dataTable tbody");
    $tbody.empty();

    currentNotebook = localStorage.getItem("currentNotebook") || "";
    if (!currentNotebook) {
        $tbody.append("<tr><td colspan='5'> 請先選擇或創建一個帳本 </td></tr>");
        $("#resultArea").val("");
        return;
    }

    members = JSON.parse(localStorage.getItem(`M_${currentNotebook}`)) || [];
    if (members.length === 0) {
        $tbody.append("<tr><td colspan='5'> 目前沒有成員，請先新增成員 </td></tr>");
        $("#resultArea").val("");
        return;
    }

    data = JSON.parse(localStorage.getItem(`D_${currentNotebook}`)) || [];
    data.forEach((d, i) => {
        $tbody.append(`
            <tr>
                <td> ${d.item} </td>
                <td> ${d.total} </td>
                <td> ${d.payer} </td>
                <td> ${String(d.split).split(",").join("<br>")} </td>
                <td><button class="deleteDataBtn" data-index="${i}"> 刪除 </button></td>
            </tr>
        `);
    });

    $tbody.append(`
        <tr>
            <td><input type="text" id="itemInput" placeholder="輸入項目"></td>
            <td><input type="text" id="totalInput" placeholder="輸入總額"></td>
            <td>
                <select id="payerInput">
                    <option value="" selected disabled> 選擇 </option>
                    ${members.map(m => `<option value="${m}">${m}</option>`).join("")}
                </select>
            </td>
            <td>
                <div id="splitInput">
                    ${members.map(m => `
                        <label class="splitLabel">
                            <span class="memberName"> ${m}: </span>
                            <input type="text" class="amountInput" data-member="${m}" placeholder="輸入金額">
                        </label>
                    `).join("")}
                </div>
            </td>
            <td><button class="addDataBtn"> 新增 </button></td>
        </tr>
    `);
}

function resultArea() {
    const paid = {};
    const toPay = {};

    members.forEach(m => {
        paid[m] = 0;
        toPay[m] = 0;
    });

    data.forEach(d => {
        paid[d.payer] += parseFloat(d.total);
        d.split.forEach(s => {
            const [name, amount] = s.split(":").map(x => x.trim());
            toPay[name] += parseFloat(amount);
        });
    });

    const balances = members.map(m => ({
        name: m,
        balance: +(paid[m] - toPay[m]).toFixed(2)
    }));
    const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
    const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
    const maxNameLength = Math.max(
        ...[...debtors, ...creditors].map(p => p.name.length)
    );

    const lines = [];

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];
        const amount = Math.min(-debtor.balance, creditor.balance);

        if (amount > 0.01) {
            const from = debtor.name.padEnd(maxNameLength, " ");
            const to = creditor.name.padEnd(maxNameLength, " ");
            const amt = `$${amount.toFixed(2)}`.padStart(6, " ");
            lines.push(`${from} → ${to}: ${amt}`);
        }

        debtor.balance += amount;
        creditor.balance -= amount;

        if (Math.abs(debtor.balance) < 0.01) i++;
        if (creditor.balance < 0.01) j++;
    }

    if (lines.length === 0) {
        $("#resultArea").val("無需進行轉帳！");
    } else {
        $("#resultArea").val(lines.join("\n"));
    }
}

function refresh() {
    notebookList();
    dataTable();
    resultArea();
}

$(document).ready(function () {
    refresh();
});
