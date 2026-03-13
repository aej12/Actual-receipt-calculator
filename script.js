let myChart = null;

function startCalc() {
    const salaryInput = document.getElementById('salary-input').value;
    if (!salaryInput) {
        alert("연봉을 입력해주세요!");
        return;
    }

    // 광고 노출 여부 확인 (세션 기준)
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
    
    // 1. 세금 계산 로직 (2026 예상 기준)
    const pensionBase = Math.max(400000, Math.min(monthlyGross, 6370000));
    const pension = Math.floor(pensionBase * 0.0475);
    const health = Math.floor(monthlyGross * 0.03595);
    const care = Math.floor(health * 0.1314);
    const emp = Math.floor(monthlyGross * 0.009);
    
    // 간이세액표 근사치 계산
    let incomeTax = 0;
    if (monthlyGross > 1500000) {
        incomeTax = Math.floor((monthlyGross - 1500000) * 0.05); 
    }
    const localTax = Math.floor(incomeTax * 0.1);
    
    const netPay = monthlyGross - (pension + health + care + emp + incomeTax + localTax);

    // 2. 화면 데이터 업데이트
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

    // 3. 그래프 그리기
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
                label: '기준중위소득 100%',
                data: [2564238, 4199292, 5359036, 6494738],
                borderColor: '#FF7A00',
                backgroundColor: 'rgba(255, 122, 0, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: false, ticks: { font: { size: 10 } } } }
        }
    });
}

function resetCalc() {
    document.getElementById('result-screen').style.display = 'none';
    document.getElementById('input-screen').style.display = 'block';
}
