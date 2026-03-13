let medianChart = null;
let savedSalary = 0;

// 1. 2024-2026 중위소득 데이터
const incomeData = {
    "2024": [2228445, 3682609, 4714657, 5729913, 6695735, 7618369],
    "2025": [2392013, 3932658, 5025353, 6097773, 7108192, 8064805],
    "2026": [2564238, 4199292, 5359036, 6494738, 7556719, 8555952]
};

// 2. 억 단위 표기 함수
function formatMoney(num) {
    if (num >= 100000000) {
        const eok = Math.floor(num / 100000000);
        const man = Math.floor((num % 100000000) / 10000);
        return man > 0 ? `${eok}억 ${man.toLocaleString()}만원` : `${eok}억원`;
    }
    return (Math.floor(num / 10000) * 10000).toLocaleString() + "원";
}

// 3. 계산 시작
function startCalc() {
    const val = document.getElementById('salary-input').value;
    if (!val) {
        alert("연봉을 입력해주세요.");
        return;
    }
    savedSalary = val;
    document.getElementById('input-screen').style.display = 'none';
    document.getElementById('ad-overlay').style.display = 'flex';
}

// 4. 광고 클릭 후 결과 노출
function linkClick() {
    setTimeout(() => {
        document.getElementById('ad-overlay').style.display = 'none';
        showResults(savedSalary * 10000);
    }, 1000);
}

// 5. 메인 결과 로직
function showResults(annual) {
    const monthlyGross = Math.floor(annual / 12);
    const familyCount = parseInt(document.getElementById('family-count').value);
    const idx = familyCount - 1;
    const m2026 = incomeData["2026"][idx];

    // 상위 % 계산 (중위소득 100%를 상위 50%로 가정)
    const ratio = monthlyGross / m2026;
    let topPercent = ratio >= 1 ? Math.max(1, Math.round(50 / ratio)) : Math.min(99, Math.round(100 - (ratio * 50)));

    // 가이드라인 금액 (상위 10%, 20% 타겟)
    const top10Goal = m2026 * 2.5; 
    const top20Goal = m2026 * 1.8;

    // 세금 및 실수령액 계산 (약식)
    const pension = Math.floor(Math.min(monthlyGross, 6370000) * 0.045);
    const health = Math.floor(monthlyGross * 0.03545);
    const care = Math.floor(health * 0.1295);
    const emp = Math.floor(monthlyGross * 0.009);
    const incomeTax = Math.floor(monthlyGross * 0.05);
    const localTax = Math.floor(incomeTax * 0.1);
    const netPay = monthlyGross - (pension + health + care + emp + incomeTax + localTax);

    // UI 업데이트
    document.getElementById('result-screen').style.display = 'block';
    
    // 실수령액
    document.getElementById('net-pay').innerText = netPay.toLocaleString() + '원';
    document.getElementById('gross-pay').innerText = `세전 월 ${formatMoney(monthlyGross)} 기준`;
    
    // 내 위치
    document.getElementById('percent-title').innerText = `2026년 ${familyCount}인 가구 기준`;
    document.getElementById('median-percent').innerText = `상위 ${topPercent}% 지점`;
    const fill = document.getElementById('progress-fill');
    if(fill) fill.style.width = `${100 - topPercent}%`;
    
    // 가이드라인
    document.getElementById('top-10-val').innerText = formatMoney(top10Goal);
    document.getElementById('top-20-val').innerText = formatMoney(top20Goal);

    // 차트 그리기
    renderChart(idx, familyCount);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 6. 차트 렌더링
function renderChart(idx, count) {
    const canvas = document.getElementById('medianChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (medianChart) medianChart.destroy();
    
    medianChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['24년', '25년', '26년'],
            datasets: [{
                label: `${count}인 가구 중위소득`,
                data: [incomeData["2024"][idx], incomeData["2025"][idx], incomeData["2026"][idx]],
                borderColor: '#3182F6',
                backgroundColor: 'rgba(49, 130, 246, 0.05)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { display: false }, x: { grid: { display: false } } }
        }
    });
}

// 7. 초기화
function resetCalc() {
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('input-screen').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
