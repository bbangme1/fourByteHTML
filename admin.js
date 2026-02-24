
const PLAN_RULES = { 'Basic': 30, 'Pro': 90, 'Premium': 365 };
let isEditMode = false; 

document.addEventListener('DOMContentLoaded', function() {
    renderTable();

    document.getElementById('search').addEventListener('input', renderTable);

    document.querySelector('.bottomBt1').addEventListener('click', function() {
        isEditMode = true;
        alert("수정 모드가 활성화되었습니다.");
        renderTable(); 
    });

    document.querySelector('.bottomBt2').addEventListener('click', saveChanges);
});

function updatePlanDates(obj) {
    const row = obj.closest('tr'); 
    const startDateText = row.cells[3].innerText; 
    const plan = obj.value; 

    const start = new Date(startDateText);
    const end = new Date(start);
    end.setDate(start.getDate() + (PLAN_RULES[plan] || 30));

    const endDateStr = end.toISOString().split('T')[0];
    const diff = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
    const remainDays = diff > 0 ? diff : 0;

    row.cells[4].innerText = endDateStr;
    row.cells[5].innerText = remainDays;

    const statusSel = row.querySelector('.status-sel');
    if (remainDays === 0) {
        statusSel.value = '만료';
    } else {
        if (statusSel.value !== '정지') {
            statusSel.value = '정상';
        }
    }

    updateStatusColor(statusSel);
}

function updateStatusColor(obj) {
    const colors = { '정상': '#1db954', '만료': '#ff4d4d', '정지': '#555' };
    obj.style.backgroundColor = colors[obj.value];
}

function renderTable() {
    const searchText = document.getElementById('search').value.toLowerCase();
    let users = JSON.parse(localStorage.getItem('spotifyUsers') || '[]');

    const filteredUsers = users.filter(user => user.name.toLowerCase().includes(searchText));

    const table = document.querySelector('.chart');
    const oldRows = table.querySelectorAll('tr:not(.chartHead)');
    oldRows.forEach(row => row.remove());

    filteredUsers.forEach(user => {
        const row = table.insertRow();
        
        const start = new Date(user.startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + (PLAN_RULES[user.plan] || 30));
        const endDateStr = end.toISOString().split('T')[0];
        const diff = Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
        const remainDays = diff > 0 ? diff : 0;

        let displayStatus = user.status;
        if (remainDays === 0 && user.status === '정상') {
            displayStatus = '만료';
        }

        const colors = { '정상': '#1db954', '만료': '#ff4d4d', '정지': '#555' };
        const statusColor = colors[displayStatus] || '#1db954';
        const disabledAttr = isEditMode ? "" : "disabled";

        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>
                <select class="payStatus plan-sel" data-id="${user.id}" ${disabledAttr} onchange="updatePlanDates(this)">
                    <option value="Basic" ${user.plan === 'Basic' ? 'selected' : ''}>Basic</option>
                    <option value="Pro" ${user.plan === 'Pro' ? 'selected' : ''}>Pro</option>
                    <option value="Premium" ${user.plan === 'Premium' ? 'selected' : ''}>Premium</option>
                </select>
            </td>
            <td>${user.startDate}</td>
            <td>${endDateStr}</td>
            <td>${remainDays}</td>
            <td>
                <select class="payStatus status-sel" data-id="${user.id}" ${disabledAttr} 
                        onchange="updateStatusColor(this)" 
                        style="background-color: ${statusColor}; color: white;">
                    <option value="정상" ${displayStatus === '정상' ? 'selected' : ''}>정상</option>
                    <option value="만료" ${displayStatus === '만료' ? 'selected' : ''}>만료</option>
                    <option value="정지" ${displayStatus === '정지' ? 'selected' : ''}>정지</option>
                </select>
            </td>
        `;
    });
}

function saveChanges() {
    if (!isEditMode) {
        alert("먼저 '수정하기' 버튼을 눌러주세요.");
        return;
    }

    let users = JSON.parse(localStorage.getItem('spotifyUsers') || '[]');

    document.querySelectorAll('.chart tr:not(.chartHead)').forEach(row => {
        const planSel = row.querySelector('.plan-sel');
        const statusSel = row.querySelector('.status-sel');
        
        if (planSel && statusSel) {
            const userId = planSel.getAttribute('data-id');
            const user = users.find(u => u.id == userId);
            
            if (user) {
                user.plan = planSel.value;
                user.status = statusSel.value;
            }
        }
    });

    localStorage.setItem('spotifyUsers', JSON.stringify(users));
    alert("변경사항이 저장되었습니다.");
    
    isEditMode = false;
    renderTable();
}