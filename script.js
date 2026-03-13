let medianChart = null;
let savedSalary = 0;

// 중위소득 데이터 (1인~6인)
const incomeData = {
    "80": [769271, 1259788, 1607711, 1948421, 2267015, 2566785],
    "50": [2564238, 4199292, 5359036, 6494738, 7556719, 8555952],
    "30": [3846357, 6298938, 8038554, 9742107, 11335078, 12833928]
};

function formatMoney(num) {
    if (num >= 100000000) {
        const eok = Math.floor(num / 100000000);
        const man = Math.floor((num % 100000000) / 10000);
        return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
    }
    return (Math.floor(num / 10000) * 10000).toLocaleString() + "원";
}

function startCalc() {
    const val = document.getElementById('salary-input').value;
    if (!val) return alert("연봉을 입력해주세요.");
    savedSalary = val;
    document.getElementById('input-screen').style.display = 'none';
    document.getElementById('ad-overlay').style.display = 'flex';
}

function linkClick() {
    setTimeout(() => {
        document.getElementById('ad-overlay').style.display = 'none';
        showResults(savedSalary * 10000);
    }, 1000); // 1초 뒤 결과화면 표시
}

function showResults(annual) {
    const monthlyGross = Math.floor(annual / 12);
    const familyCount = parseInt(document.getElementById('family-count').value);
    const idx = familyCount - 1;
    const m2026 = incomeData["100"][idx];

    // 공제액 계산
    const pension = Math.floor(Math.min(monthlyGross, 6370000) * 0.045);
    const health = Math.floor(monthlyGross * 0.03545);
    const care = Math.floor(health * 0.1295);
    const emp = Math.floor(monthlyGross * 0.009);
    const incomeTax = Math.floor(monthlyGross * 0.05); 
    const localTax = Math.floor(incomeTax * 0.1);
    
    const totalTax = pension + health + care + emp + incomeTax + localTax;
    const netPay = monthlyGross - totalTax;
    const hourlyWage = Math.floor(monthlyGross / 209); // 시급 계산

    // 상위 % 계산
    const ratio = monthlyGross / m2026;
    let topPercent = ratio >= 1 ? Math.max(1, Math.round(50 / ratio)) : Math.min(99, Math.round(100 - (ratio * 50)));

    // 화면 업데이트
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('net-pay').innerText = netPay.toLocaleString() + '원';
    document.getElementById('gross-pay').innerText = `월 소득액 ${formatMoney(monthlyGross)}`;
    
    document.getElementById('percent-title').innerText = `2026년 ${familyCount}인 가구 중위소득 대비`;
    document.getElementById('median-percent').innerText = `상위 ${topPercent}%`;

    document.getElementById('tax-pension').innerText = pension.toLocaleString() + '원';
    document.getElementById('tax-health').innerText = health.toLocaleString() + '원';
    document.getElementById('tax-care').innerText = care.toLocaleString() + '원';
    document.getElementById('tax-emp').innerText = emp.toLocaleString() + '원';
    document.getElementById('tax-income').innerText = incomeTax.toLocaleString() + '원';
    document.getElementById('tax-local').innerText = localTax.toLocaleString() + '원';
    document.getElementById('hourly-wage').innerText = hourlyWage.toLocaleString() + '원';

    renderTable();
    renderChart(idx);
}

function renderTable() {
    const tbody = document.querySelector('#median-table tbody');
    tbody.innerHTML = '';
    const labels = ["80%", "50%", "30%"];
    const keys = ["80", "50", "30"];
    
    keys.forEach((key, i) => {
        const tr = document.createElement('tr');
        let html = `<td>${labels[i]}</td>`;
        for(let j=0; j<6; j++) {
            html += `<td>${incomeData[key][j].toLocaleString()}</td>`;
        }
        tr.innerHTML = html;
        tbody.appendChild(tr);
    });
}

function renderChart(idx) {
    const ctx = document.getElementById('medianChart').getContext('2d');
    if (medianChart) medianChart.destroy();
    
    // 그래프 데이터 (1인~4인 가구까지만 표시)
    const chartData = [incomeData["100"][0], incomeData["100"][1], incomeData["100"][2], incomeData["100"][3]];

    medianChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1인', '2인', '3인', '4인'],
            datasets: [{
                label: '2026 기준중위소득',
                data: chartData,
                borderColor: '#FF7A00',
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#FF7A00',
                pointRadius: 4,
                tension: 0,
                fill: true,
                backgroundColor: 'rgba(255, 122, 0, 0.1)'
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false } }
        }
    });
}

function resetCalc() {
    location.reload();
}
