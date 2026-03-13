// 중위소득 데이터
const medianData = {
    2024: [2228445, 3682609, 4714657, 5729613, 6695735, 7618369],
    2025: [2392013, 3932658, 5025353, 6097773, 7108192, 8064805],
    2026: [2564238, 4199292, 5359036, 6494738, 7556719, 8555952]
};

document.getElementById('calc-btn').addEventListener('click', handleCalculate);

function handleCalculate() {
    const salary = parseFloat(document.getElementById('annual-salary').value);
    if (!salary || salary <= 0) {
        alert("연봉을 정확히 입력해 주세요.");
        return;
    }

    // 쿠팡 광고 로직 (sessionStorage 사용)
    const isAdShown = sessionStorage.getItem('isAdShown');

    if (!isAdShown) {
        showAd();
    } else {
        showResult();
    }
}

function showAd() {
    document.getElementById('input-section').classList.add('hidden');
    document.getElementById('ad-section').classList.remove('hidden');

    let timeLeft = 5;
    const timerEl = document.getElementById('timer');
    
    const interval = setInterval(() => {
        timeLeft--;
        timerEl.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(interval);
            sessionStorage.setItem('isAdShown', 'true');
            showResult();
        }
    }, 1000);
}

function showResult() {
    document.getElementById('input-section').classList.add('hidden');
    document.getElementById('ad-section').classList.add('hidden');
    document.getElementById('result-section').classList.remove('hidden');

    calculateSalary();
    renderChart();
    renderTable();
}

function calculateSalary() {
    const grossAnnual = parseFloat(document.getElementById('annual-salary').value);
    const familyCount = parseInt(document.getElementById('family-count').value) || 1;
    
    // 월급 계산
    const monthlyGross = grossAnnual / 12;

    // 2026 예상 요율 (현행 유지/미세조정 가정)
    const pensionRate = 0.045; // 국민연금 4.5%
    const healthRate = 0.03545; // 건강보험 3.545%
    const careRate = 0.1295;    // 장기요양 (건보료의 12.95%)
    const empRate = 0.009;      // 고용보험 0.9%

    // 공제액 계산
    let pension = Math.min(monthlyGross * pensionRate, 265500); // 상한액 대략적 적용
    let health = monthlyGross * healthRate;
    let care = health * careRate;
    let emp = monthlyGross * empRate;

    // 소득세 간이 계산 (매우 간소화된 로직)
    let baseIncomeTax = (monthlyGross * 0.05); // 임의 구간 평균 세율
    if(monthlyGross > 6000000) baseIncomeTax = monthlyGross * 0.15;
    else if(monthlyGross > 4000000) baseIncomeTax = monthlyGross * 0.08;
    
    // 부양가족 할인 반영 (인당 약 5% 감면 가정)
    let incomeTax = baseIncomeTax * (1 - (familyCount - 1) * 0.05);
    if(incomeTax < 0) incomeTax = 0;
    
    let localTax = incomeTax * 0.1;

    const totalDeduction = pension + health + care + emp + incomeTax + localTax;
    const monthlyNet = monthlyGross - totalDeduction;
    const annualNet = monthlyNet * 12;

    // UI 업데이트
    document.getElementById('res-gross').innerText = Math.floor(grossAnnual).toLocaleString() + "원";
    document.getElementById('res-net').innerText = Math.floor(annualNet).toLocaleString() + "원";
    document.getElementById('res-monthly').innerText = "월 " + Math.floor(monthlyNet/10000).toLocaleString() + "만원";

    document.getElementById('ded-pension').innerText = Math.floor(pension).toLocaleString() + "원";
    document.getElementById('ded-health').innerText = Math.floor(health).toLocaleString() + "원";
    document.getElementById('ded-care').innerText = Math.floor(care).toLocaleString() + "원";
    document.getElementById('ded-emp').innerText = Math.floor(emp).toLocaleString() + "원";
    document.getElementById('ded-income').innerText = Math.floor(incomeTax).toLocaleString() + "원";
    document.getElementById('ded-local').innerText = Math.floor(localTax).toLocaleString() + "원";

    // 중위소득 비교
    calculateMedianRank(monthlyGross, familyCount);
}

function calculateMedianRank(monthlyGross, familyCount) {
    let idx = Math.min(familyCount, 6) - 1;
    const median2026 = medianData[2026][idx];
    
    // 중위소득 대비 비율로 상위 백분위 단순 산출 (시뮬레이션 로직)
    const ratio = (monthlyGross / median2026);
    let topPercent;

    if (ratio > 2.0) topPercent = 5;
    else if (ratio > 1.5) topPercent = 15;
    else if (ratio > 1.2) topPercent = 30;
    else if (ratio > 1.0) topPercent = 50;
    else if (ratio > 0.8) topPercent = 65;
    else if (ratio > 0.5) topPercent = 80;
    else topPercent = 95;

    document.getElementById('median-percent').innerText = `상위 ${topPercent}%`;
}

function renderChart() {
    const ctx = document.getElementById('medianChart').getContext('2d');
    
    // 4인가구 기준 트렌드 예시
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['2024년', '2025년', '2026년'],
            datasets: [{
                label: '4인가구 중위소득',
                data: [medianData[2024][3], medianData[2025][3], medianData[2026][3]],
                borderColor: '#ff5f05',
                backgroundColor: 'rgba(255, 95, 5, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false } }
        }
    });
}

function renderTable() {
    const tbody = document.querySelector('#median-table tbody');
    tbody.innerHTML = '';
    [2024, 2025, 2026].forEach(year => {
        const tr = document.createElement('tr');
        let html = `<td>${year}</td>`;
        medianData[year].forEach(val => {
            html += `<td>${Math.floor(val/10000)}만</td>`;
        });
        tr.innerHTML = html;
        tbody.appendChild(tr);
    });
}
