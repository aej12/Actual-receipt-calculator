// 2026 기준중위소득 데이터 (요청하신 대로 30/50/80/100% 등으로 재정리)
const medianData = {
    "30%": [769271, 1259788, 1607711, 1948421],
    "50%": [1282119, 2099646, 2679518, 3247369],
    "80%": [2051390, 3359434, 4287229, 5195790],
    "100%": [2564238, 4199292, 5359036, 6494738]
};

function startCalc() {
    if(!document.getElementById('salary-input').value) return alert("연봉을 입력해주세요.");
    document.getElementById('input-screen').style.display = 'none';
    document.getElementById('ad-overlay').style.display = 'flex';
}

function linkClick() {
    setTimeout(() => {
        document.getElementById('ad-overlay').style.display = 'none';
        calculate();
    }, 800);
}

function calculate() {
    const salary = parseInt(document.getElementById('salary-input').value) * 10000;
    const monthly = Math.floor(salary / 12);
    const familyIdx = parseInt(document.getElementById('family-count').value) - 1;
    
    // 간단 세금 계산 (근사치)
    const pension = Math.floor(Math.min(monthly, 6370000) * 0.045);
    const health = Math.floor(monthly * 0.03545);
    const emp = Math.floor(monthly * 0.009);
    const incomeTax = Math.floor(monthly * 0.04); 
    const net = monthly - (pension + health + emp + incomeTax);

    // 상위 % 계산 (100% 기준)
    const m100 = medianData["100"][familyIdx];
    const ratio = monthly / m100;
    let topPer = ratio >= 1 ? Math.max(1, Math.round(50 / ratio)) : Math.min(99, Math.round(100 - (ratio * 50)));

    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('net-pay').innerText = net.toLocaleString() + "원";
    document.getElementById('gross-pay').innerText = `월 소득액 ${monthly.toLocaleString()}원`;
    document.getElementById('median-percent').innerText = `상위 ${topPer}%`;
    document.getElementById('hourly-wage').innerText = Math.floor(monthly / 209).toLocaleString() + "원";
    
    // 상세 내역
    document.getElementById('tax-pension').innerText = pension.toLocaleString() + "원";
    document.getElementById('tax-health').innerText = health.toLocaleString() + "원";
    document.getElementById('tax-emp').innerText = emp.toLocaleString() + "원";
    document.getElementById('tax-income').innerText = incomeTax.toLocaleString() + "원";

    updateTable();
    renderChart(familyIdx);
}

function updateTable() {
    const tbody = document.querySelector('#median-table tbody');
    tbody.innerHTML = '';
    ["30%", "50%", "80%", "100%"].forEach(key => {
        const tr = document.createElement('tr');
        let html = `<td>${key}</td>`;
        medianData[key].forEach(val => html += `<td>${Math.floor(val/10000)}만</td>`);
        tr.innerHTML = html;
        tbody.appendChild(tr);
    });
}

function renderChart(idx) {
    const ctx = document.getElementById('medianChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['30%', '50%', '80%', '100%'],
            datasets: [{
                data: [medianData["30%"][idx], medianData["50%"][idx], medianData["80%"][idx], medianData["100%"][idx]],
                borderColor: '#FF7A00',
                backgroundColor: 'rgba(255, 122, 0, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { plugins: { legend: { display: false } }, scales: { y: { display: false } } }
    });
}

function resetCalc() { location.reload(); }
