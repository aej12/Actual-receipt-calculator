let medianChart = null;
let savedSalary = 0;

// [수정] 요청하신 80%, 50%, 30% 기준으로 데이터 재정의
const incomeData = {
    "80": [2051390, 3359434, 4287229, 5195790, 6045375, 6844762],
    "50": [1282119, 2099646, 2679518, 3247369, 3778360, 4277976],
    "30": [769271, 1259788, 1607711, 1948421, 2267015, 2566785],
    "100": [2564238, 4199292, 5359036, 6494738, 7556719, 8555952] // 상위% 계산용 기준값
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
    }, 1000);
}

function showResults(annual) {
    const monthlyGross = Math.floor(annual / 12);
    const familyCount = parseInt(document.getElementById('family-count').value);
    const idx = familyCount - 1;
    const m100 = incomeData["100"][idx];

    // 공제액 계산 (요율 보정)
    const pension = Math.floor(Math.min(monthlyGross, 6370000) * 0.045);
    const health = Math.floor(monthlyGross * 0.03545);
    const care = Math.floor(health * 0.1295);
    const emp = Math.floor(monthlyGross * 0.009);
    
    // 간이세액표 기준 근사치 (소득에 따라 차등 적용 필요하나 평균 5%~15% 적용)
    let taxRate = 0.05;
    if (monthlyGross > 6000000) taxRate = 0.12;
    else if (monthlyGross > 4000000) taxRate = 0.08;
    
    const incomeTax = Math.floor(monthlyGross * taxRate); 
    const localTax = Math.floor(incomeTax * 0.1);
    
    const totalTax = pension + health + care + emp + incomeTax + localTax;
    const netPay = monthlyGross - totalTax;
    const hourlyWage = Math.floor(monthlyGross / 209);

    // 상위 % 계산
    const ratio = monthlyGross / m100;
    let topPercent = ratio >= 1 ? Math.max(1, Math.round(50 / ratio)) : Math.min(99, Math.round(100 - (ratio * 50)));

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
    if(!tbody) return;
    tbody.innerHTML = '';
    
    // [수정] 표 순서를 80 -> 50 -> 30 순으로 출력
    const labels = ["80%", "50%", "30%"];
    const keys = ["80", "50", "30"];
    
    keys.forEach((key, i) => {
        const tr = document.createElement('tr');
        let html = `<td>${labels[i]}</td>`;
        // 1인~4인 가구까지만 표에 표시 (가로 폭 문제 해결)
        for(let j=0; j<4; j++) {
            html += `<td>${Math.floor(incomeData[key][j]/10000).toLocaleString()}만</td>`;
        }
        tr.innerHTML = html;
        tbody.appendChild(tr);
    });
}

function renderChart(idx) {
    const canvas = document.getElementById('medianChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (medianChart) medianChart.destroy();
    
    // 그래프는 전체적인 흐름을 보여주기 위해 100% 기준 1~4인 가구 추이 표시
    const chartData = [incomeData["100"][0], incomeData["100"][1], incomeData["100"][2], incomeData["100"][3]];

    medianChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1인', '2인', '3인', '4인'],
            datasets: [{
                label: '2026 기준중위소득(100%)',
                data: chartData,
                borderColor: '#FF7A00',
                borderWidth: 3,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#FF7A00',
                pointRadius: 4,
                tension: 0.2,
                fill: true,
                backgroundColor: 'rgba(255, 122, 0, 0.1)'
            }]
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { 
                y: { 
                    beginAtZero: false,
                    ticks: { callback: function(value) { return value / 10000 + '만'; } }
                } 
            }
        }
    });
}

function resetCalc() {
    location.reload();
}
