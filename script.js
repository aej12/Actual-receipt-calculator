let medianChart = null;

const incomeData = {
    "2024": [2228445, 3682609, 4714657, 5729913],
    "2025": [2392013, 3932658, 5025353, 6097773],
    "2026": [2564238, 4199292, 5359036, 6494738]
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
    if (!document.getElementById('salary-input').value) return alert("연봉을 입력하세요");
    document.getElementById('input-screen').style.display = 'none';
    document.getElementById('ad-overlay').style.display = 'flex';
}

function linkClick() {
    setTimeout(() => {
        document.getElementById('ad-overlay').style.display = 'none';
        const annual = document.getElementById('salary-input').value * 10000;
        showResults(annual);
    }, 1000);
}

function showResults(annual) {
    const monthlyGross = Math.floor(annual / 12);
    const familyCount = parseInt(document.getElementById('family-count').value);
    const m2026 = incomeData["2026"][familyCount - 1];

    // 위치 계산
    const ratio = monthlyGross / m2026;
    let topPercent = ratio >= 1 ? Math.max(1, Math.round(50 / ratio)) : Math.min(99, Math.round(100 - (ratio * 50)));

    // 가이드라인
    const t10 = m2026 * 2.5;
    const t20 = m2026 * 1.8;

    // UI 출력
    document.getElementById('result-screen').style.display = 'block';
    document.getElementById('net-pay').innerText = (monthlyGross * 0.85).toLocaleString() + "원"; // 약식 세후
    document.getElementById('gross-pay').innerText = `세전 월 ${formatMoney(monthlyGross)} 기준`;
    document.getElementById('median-percent').innerText = `상위 ${topPercent}%`;
    document.getElementById('progress-fill').style.width = `${100 - topPercent}%`;
    document.getElementById('top-10-val').innerText = formatMoney(t10);
    document.getElementById('top-20-val').innerText = formatMoney(t20);

    renderChart(familyCount - 1);
}

function renderChart(idx) {
    const ctx = document.getElementById('medianChart').getContext('2d');
    if (medianChart) medianChart.destroy();
    medianChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['24년', '25년', '26년'],
            datasets: [{
                label: '중위소득 추이',
                data: [incomeData["2024"][idx], incomeData["2025"][idx], incomeData["2026"][idx]],
                borderColor: '#3182f6',
                fill: false
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function resetCalc() {
    location.reload(); // 가장 확실한 초기화
}
