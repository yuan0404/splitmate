let splitData = [];

$(document).ready(function () {
    $("#loadBtn").click(function () {
        const raw = localStorage.getItem("splitData");
        if (!raw) {
            alert("目前沒有任何分帳資料。");
            return;
        }
        splitData = JSON.parse(raw);
        let msg = "目前的分帳資料：\n";
        splitData.forEach((p, i) => {
            msg += `${i + 1}. ${p.name}：$${p.amount}\n`;
        });
        alert(msg);
    });

    $("#addBtn").click(function () {
        const name = prompt("請輸入名字：");
        if (!name) return;
        const amount = prompt("請輸入金額：");
        const num = parseFloat(amount);
        if (isNaN(num)) {
            alert("請輸入正確的數字！");
            return;
        }
        splitData.push({ name: name, amount: num });
        alert(`已新增：${name}: $${num}`);
    });

    $("#saveBtn").click(function () {
        localStorage.setItem("splitData", JSON.stringify(splitData));
        alert("資料已儲存到瀏覽器！");
    });

    $("#clearBtn").click(function () {
        if (confirm("你確定要清除所有分帳資料嗎？這個動作無法復原。")) {
            localStorage.removeItem("splitData");
            splitData = [];
            alert("所有資料已清除！");
        }
    });
});
