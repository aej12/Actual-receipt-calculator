let myChart = null;
let savedSalary = 0;

function startCalc() {
    const salaryVal = document.getElementById('salary-input').value;
    if (!salaryVal) { alert("연봉을 입력해주세요!"); return; }
    
    savedSalary = salaryVal; // 입력 연봉 저장

    // 1. 입력창 숨기고 광고 레이어 표시
    document.getElementById('input-screen').style.display = 'none';
    document.getElementById('ad-overlay').style.display = 'flex';
}

function linkClick() {
    // 버튼 클릭 시 1.5초 후 결과 화면으로 전환
    setTimeout(() => {
        document.getElementById('ad-overlay').style.display = 'none';
        showResults(savedSalary * 10000);
    }, 1500);
}

function showResults(annual) {
    const monthlyGross = Math.floor(annual / 12);
    const familyCount = parseInt(document.getElementById('family-count').value);
    const childCount = parseInt(document.getElementById('child-count').value);

    // 공제항목 계산
    const pensionBase = Math.max(400000, Math.min(monthlyGross, 6370000));
    const pension = Math.floor(pensionBase * 0.0475);
    const health = Math.floor(monthlyGross * 0.03595);
    const care = Math.floor(health * 0.1314);
    const emp = Math.floor(monthlyGross * 0.009);
    
    // 소득세 (간이세액표 근사치 + 부양가족 공제 반영)
    let incomeTax = 0;
    if (monthlyGross > 1060000) {
        const familyBenefit = (familyCount - 1) * 0.1 + (childCount * 0.15);
        const rawTax = (monthlyGross - 1000000) * 0.09; 
        incomeTax = Math.floor(Math.max(0, rawTax * (1 - familyBenefit * 0.5)));
    }
    const localTax = Math.floor(incomeTax * 0.1);
    
    const netPay = monthlyGross - (pension + health + care + emp + incomeTax + localTax);

    // 화면 업데이트
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

    renderChart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderChart() {
    const ctx = document.getElementById('incomeChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1인', '2인', '3인', '4인'],
            datasets: [{
                data: [2564238, 4199292, 5359036, 6494738],
                borderColor: '#FF7A00',
                backgroundColor: 'rgba(255, 122, 0, 0.1)',
                fill: true, tension: 0.4, pointRadius: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: true }, y: { display: false } }
        }
    });
}

function resetCalc() {
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('input-screen').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
