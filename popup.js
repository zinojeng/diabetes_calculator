// 標籤切換功能
document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    button.classList.add('active');
    const tabId = button.getAttribute('data-tab');
    document.getElementById(`${tabId}-tab`).classList.add('active');
  });
});

// HbA1c轉換器功能
document.getElementById('hba1c-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const hba1cValue = parseFloat(document.getElementById('hba1c-value').value);
  const eAG = calculateEAG(hba1cValue);
  const ci = calculateConfidenceInterval(hba1cValue);
  
  const resultDiv = document.getElementById('hba1c-result');
  resultDiv.innerHTML = `
    <div class="result-text">
      糖化血色素(HbA1c) 值: ${hba1cValue.toFixed(1)}%<br>
      估算平均血糖 (eAG): ${eAG.toFixed(0)} mg/dL (${ci.lower}-${ci.upper})
    </div>
    <button class="copy-button">複製結果</button>
  `;

  // 添加複製按鈕事件監聽器
  const copyButton = resultDiv.querySelector('.copy-button');
  copyButton.addEventListener('click', function() {
    const textToCopy = 
`糖化血色素(HbA1c) 值: ${hba1cValue.toFixed(1)}%
估算平均血糖 (eAG): ${eAG.toFixed(0)} mg/dL (${ci.lower}-${ci.upper})`;
    
    copyToClipboard(textToCopy);
  });
});

// GA轉換器功能
document.addEventListener('DOMContentLoaded', function() {
  const gaForm = document.getElementById('ga-form');
  if (gaForm) {
    gaForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      const gaValue = parseFloat(document.getElementById('ga-value').value);
      if (!isNaN(gaValue)) {
        const hba1c = calculateHbA1c(gaValue);
        const eAG = calculateEAGFromGA(gaValue);
        const hba1cLower = (0.216 * gaValue + 2.978) - (1.96 * 0.5);
        const hba1cUpper = (0.216 * gaValue + 2.978) + (1.96 * 0.5);
        
        // 顯示結果
        const resultDiv = document.getElementById('ga-result');
        resultDiv.innerHTML = `
          <div class="result-text">
            糖化白蛋白(GA) 值: ${gaValue}%<br>
            估算HbA1c值: ${hba1c.toFixed(1)}% (${hba1cLower.toFixed(1)}-${hba1cUpper.toFixed(1)})<br>
            估算平均血糖 (eAG): ${eAG.toFixed(0)} mg/dL (${(eAG * 0.85).toFixed(0)}-${(eAG * 1.15).toFixed(0)})
          </div>
          <button class="copy-button">複製結果</button>
        `;

        // 添加複製按鈕事件監聽器
        const copyButton = resultDiv.querySelector('.copy-button');
        copyButton.addEventListener('click', function() {
          const textToCopy = 
`糖化白蛋白(GA) 值: ${gaValue}%
估算HbA1c值: ${hba1c.toFixed(1)}% (${hba1cLower.toFixed(1)}-${hba1cUpper.toFixed(1)})
估算平均血糖 (eAG): ${eAG.toFixed(0)} mg/dL (${(eAG * 0.85).toFixed(0)}-${(eAG * 1.15).toFixed(0)})`;
          
          copyToClipboard(textToCopy);
        });
      }
    });
  }
});

// 複製功能
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const copyButton = document.querySelector('.copy-button');
    const originalText = copyButton.textContent;
    copyButton.textContent = '複製成功！';
    setTimeout(() => {
      copyButton.textContent = originalText;
    }, 2000);
  }).catch(err => {
    console.error('複製失敗:', err);
  });
}

function calculateEAG(hba1c) {
  // eAG (mg/dL) = 28.7 × A1C - 46.7
  return 28.7 * hba1c - 46.7;
}

function calculateHbA1c(ga) {
  // HbA1c = 0.216 × GA + 2.978
  return 0.216 * ga + 2.978;
}

function calculateEAGFromGA(ga) {
  // eAG (mg/dL) = 4.71 × GA% + 73.3514
  return 4.71 * ga + 73.3514;
}

function calculateConfidenceInterval(hba1c) {
  // 根據表格數據進行線性插值計算
  const data = [
    { hba1c: 5.0, lower: 76, upper: 120 },
    { hba1c: 6.0, lower: 100, upper: 152 },
    { hba1c: 7.0, lower: 123, upper: 185 },
    { hba1c: 8.0, lower: 147, upper: 217 },
    { hba1c: 9.0, lower: 170, upper: 249 },
    { hba1c: 10.0, lower: 193, upper: 282 },
    { hba1c: 11.0, lower: 217, upper: 314 },
    { hba1c: 12.0, lower: 240, upper: 347 }
  ];
  
  // 找到最接近的兩個參考點
  let lower = data[0];
  let upper = data[data.length - 1];
  
  for (let i = 0; i < data.length - 1; i++) {
    if (hba1c >= data[i].hba1c && hba1c <= data[i + 1].hba1c) {
      lower = data[i];
      upper = data[i + 1];
      break;
    }
  }
  
  // 線性插值計算
  const ratio = (hba1c - lower.hba1c) / (upper.hba1c - lower.hba1c);
  const lowerCI = Math.round(lower.lower + ratio * (upper.lower - lower.lower));
  const upperCI = Math.round(lower.upper + ratio * (upper.upper - lower.upper));
  
  return {
    lower: lowerCI,
    upper: upperCI
  };
}