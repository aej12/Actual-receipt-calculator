let medianChart = null;
let savedSalary = 0;

// 2024-2026 중위소득 데이터 (1~6인 가구)
const incomeData = {
    "2024": [2228445, 3682609, 4714657, 5729913, 6695735, 7618369],
    "2025": [2392013, 3932658, 5025353, 6097773, 7108192, 8064805],
    "2026": [2564238, 4199292, 5359036, 6494738, 7556719, 8555952]
};

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
    const monthlyGross = Math.floor(annual / 12); // 세전 월 소득
    const familyCount = parseInt(document.getElementById('family-count').value);
    const idx = familyCount - 1;
    const m2026 = incomeData["2026"][idx];

    // --- [핵심] 상위 % 계산 로직 ---
    // 중위소득(100%)을 하위 50%(즉, 상위 50%)로 가정하고 비례 계산
    const ratio = monthlyGross / m2026;
    let topPercent;
    
    if (ratio >= 1) {
        // 중위소득 이상일 때: 상위 50%보다 숫자가 작아짐 (예: 1.5배면 상위 33%)
        topPercent = Math.max(1, Math.round(50 / ratio));
    } else {
        // 중위소득 미만일 때: 상위 50%보다 숫자가 커짐 (예: 0.8배면 상위 62.5% -> 하위 37.5%)
        topPercent = Math.min(99, Math.round(100 - (ratio * 50)));
    }

    // 세금 및 실수령액 계산 (2026 기준 요율 근사치)
    const pension = Math.floor(Math.min(monthlyGross, 6370000) * 0.045);
    const health = Math.floor(monthlyGross * 0.03545);
    const care = Math.floor(health * 0.1295);
    const emp = Math.floor(monthlyGross * 0.009);
    const incomeTax = calculateIncomeTax(monthlyGross, familyCount); // 간이 소득세 함수
    const localTax = Math.floor(incomeTax * 0.1);
    const netPay = monthlyGross - (pension + health + care + emp + incomeTax + localTax);

    // 결과 출력
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('net-pay').innerText = netPay.toLocaleString() + '원';
    document.getElementById('gross-pay').innerText = `세전 월 ${monthlyGross.toLocaleString()}원 기준`;
    
    // 상위 % 표시
    document.getElementById('percent-title').innerText = `2026년 ${familyCount}인 가구 기준`;
    document.getElementById('median-percent').innerHTML = `상위 <b style="color:#3182F6">${topPercent}%</b> 지점`;
    
    // 상세 항목
    document.getElementById('tax-pension').innerText = pension.toLocaleString() + '원';
    document.getElementById('tax-health').innerText = health.toLocaleString() + '원';
    document.getElementById('tax-care').innerText = care.toLocaleString() + '원';
    document.getElementById('tax-emp').innerText = emp.toLocaleString() + '원';
    document.getElementById('tax-income').innerText = incomeTax.toLocaleString() + '원';
    document.getElementById('tax-local').innerText = localTax.toLocaleString() + '원';

    renderTable();
    renderChart(idx, familyCount);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 간이 소득세 계산 함수
function calculateIncomeTax(gross, count) {
    if (gross < 1060000) return 0;
    const base = (gross - 1000000) * 0.15; // 단순화된 로직
    const familyDeduct = (count - 1) * 20000;
    return Math.max(0, Math.floor(base - familyDeduct));
}

function renderTable() {
    const tbody = document.querySelector('#median-table tbody');
    tbody.innerHTML = '';
    ["2024", "2025", "2026"].forEach(year => {
        const tr = document.createElement('tr');
        let html = `<td>${year}</td>`;
        incomeData[year].forEach(v => html += `<td>${v.toLocaleString()}</td>`);
        tr.innerHTML = html;
        tbody.appendChild(tr);
    });
}

function renderChart(idx, count) {
    const ctx = document.getElementById('medianChart').getContext('2d');
    if (medianChart) medianChart.destroy();
    medianChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['24년', '25년', '26년'],
            datasets: [{
                label: `${count}인 가구 중위소득`,
                data: [incomeData["2024"][idx], incomeData["2025"][idx], incomeData["2026"][idx]],
                borderColor: '#FF7A00',
                backgroundColor: 'rgba(255,122,0,0.05)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function resetCalc() {
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('input-screen').style.display = 'block';
}
