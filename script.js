let medianChart = null;
let savedSalary = 0;

// 제공해주신 중위소득 데이터 (2024~2026, 1~6인 가구)
const incomeData = {
    median: {
        2024: [2228445, 3682609, 4714657, 5729913, 6695735, 7618369],
        2025: [2392013, 3932658, 5025353, 6097773, 7108192, 8064805],
        2026: [2564238, 4199292, 5359036, 6494738, 7556719, 8555952]
    }
};

function startCalc() {
    const salaryVal = document.getElementById('salary-input').value;
    if (!salaryVal) { alert("연봉을 입력해주세요!"); return; }
    savedSalary = salaryVal;
    document.getElementById('input-screen').style.display = 'none';
    document.getElementById('ad-overlay').style.display = 'flex';
}

function linkClick() {
    setTimeout(() => {
        document.getElementById('ad-overlay').style.display = 'none';
        showResults(savedSalary * 10000);
    }, 1500);
}

function showResults(annual) {
    const monthlyGross = Math.floor(annual / 12);
    const familyCount = parseInt(document.getElementById('family-count').value);
    const childCount = parseInt(document.getElementById('child-count').value);

    // 실수령액 계산 (2026 요율 기준 예시)
    const pensionBase = Math.max(400000, Math.min(monthlyGross, 6370000));
    const pension = Math.floor(pensionBase * 0.0475);
    const health = Math.floor(monthlyGross * 0.03595);
    const care = Math.floor(health * 0.1314);
    const emp = Math.floor(monthlyGross * 0.009);
    
    let incomeTax = 0;
    if (monthlyGross > 1060000) {
        const familyBenefit = (familyCount - 1) * 0.1 + (childCount * 0.15);
        incomeTax = Math.floor(Math.max(0, (monthlyGross - 1000000) * 0.09 * (1 - familyBenefit * 0.5)));
    }
    const localTax = Math.floor(incomeTax * 0.1);
    const netPay = monthlyGross - (pension + health + care + emp + incomeTax + localTax);

    // 가구원수 인덱스 (1인=0, ..., 6인=5)
    const idx = familyCount - 1;
    const median2026 = incomeData.median[2026][idx];

    // 중위소득 대비 % 업데이트
    document.getElementById('percent-title').innerText = `2026년 ${familyCount}인 가구 중위소득 대비`;
    document.getElementById('median-percent').innerText = Math.round((monthlyGross / median2026) * 100) + "%";

    // 데이터 표시
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('net-pay').innerText = netPay.toLocaleString() + '원';
    document.getElementById('gross-pay').innerText = `월 소득액 ${monthlyGross.toLocaleString()}원`;
    document.getElementById('tax-pension').innerText = pension.toLocaleString() + '원';
    document.getElementById('tax-health').innerText = health.toLocaleString() + '원';
    document.getElementById('tax-care').innerText = care.toLocaleString() + '원';
    document.getElementById('tax-emp').innerText = emp.toLocaleString() + '원';
    document.getElementById('tax-income').innerText = incomeTax.toLocaleString() + '원';
    document.getElementById('tax-local').innerText = localTax.toLocaleString() + '원';
    document.getElementById('hourly-wage').innerText = Math.floor(monthlyGross / 209).toLocaleString() + '원';

    renderCharts(idx, familyCount);
    fillTables();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function fillTables() {
    const tbody = document.querySelector('#median-table tbody');
    tbody.innerHTML = '';

    [2024, 2025, 2026].forEach(year => {
        const row = document.createElement('tr');
        let html = `<td>${year}</td>`;
        incomeData.median[year].forEach(val => {
            html += `<td>${val.toLocaleString()}</td>`;
        });
        row.innerHTML = html;
        tbody.appendChild(row);
    });
}

function renderCharts(idx, familyCount) {
    const labels = ['2024년', '2025년', '2026년'];
    const dataPoints = [
        incomeData.median[2024][idx],
        incomeData.median[2025][idx],
        incomeData.median[2026][idx]
    ];

    const ctx = document.getElementById('medianChart').getContext('2d');
    if (medianChart) medianChart.destroy();
    
    medianChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${familyCount}인 가구 중위소득 추이`,
                data: dataPoints,
                borderColor: '#FF7A00',
                backgroundColor: 'rgba(255, 122, 0, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.3,
                pointRadius: 5,
                pointBackgroundColor: '#FF7A00'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: true, labels: { boxWidth: 10, font: { size: 11 } } }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: { callback: value => value.toLocaleString() }
                }
            }
        }
    });
}

function resetCalc() {
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('input-screen').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
