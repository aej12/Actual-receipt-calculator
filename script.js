let myChart = null;

function startCalc() {
    const salaryInput = document.getElementById('salary-input').value;
    if (!salaryInput) { alert("연봉을 입력해주세요!"); return; }

    const viewedAd = sessionStorage.getItem('viewedAd_2026');
    if (!viewedAd) {
        document.getElementById('input-screen').style.display = 'none';
        document.getElementById('ad-overlay').style.display = 'flex';
        setTimeout(() => {
            sessionStorage.setItem('viewedAd_2026', 'true');
            document.getElementById('ad-overlay').style.display = 'none';
            showResults(salaryInput * 10000);
        }, 5000);
    } else {
        document.getElementById('input-screen').style.display = 'none';
        showResults(salaryInput * 10000);
    }
}

function showResults(annual) {
    const monthlyGross = Math.floor(annual / 12);
    const familyCount = parseInt(document.getElementById('family-count').value);
    const childCount = parseInt(document.getElementById('child-count').value);

    // 사회보험료 (2026 예상 요율)
    const pensionBase = Math.max(400000, Math.min(monthlyGross, 6370000));
    const pension = Math.floor(pensionBase * 0.0475);
    const health = Math.floor(monthlyGross * 0.03595);
    const care = Math.floor(health * 0.1314);
    const emp = Math.floor(monthlyGross * 0.009);
    
    // 근로소득세 (부양가족 반영 간이 계산 로직)
    let incomeTax = 0;
    if (monthlyGross > 1060000) {
        // 부양가족 1인당 소득공제 효과를 반영한 가중치
        const deductionWeight = (familyCount - 1) * 0.15 + (childCount * 0.2);
        const baseTax = (monthlyGross - 1000000) * 0.08; 
        incomeTax = Math.floor(Math.max(0, baseTax * (1 - deductionWeight * 0.5)));
    }
    const localTax = Math.floor(incomeTax * 0.1);
    
    const netPay = monthlyGross - (pension + health + care + emp + incomeTax + localTax);

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
                fill: true, tension: 0.4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { display: false } }
        }
    });
}

function resetCalc() {
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('input-screen').style.display = 'block';
}
