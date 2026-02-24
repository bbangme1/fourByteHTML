    
document.querySelector('.button1').addEventListener('click', function() {
    const name = document.getElementById('name').value;
    const subsDate = document.getElementById('subsDate').value;

    if (!name || !subsDate) {
        alert("이름과 구독 시작일을 모두 입력해주세요.");
        return;
    }

    let users = JSON.parse(localStorage.getItem('spotifyUsers') || '[]');

    let nextId = 1;
    if (users.length > 0) {
        const lastUser = users[users.length - 1];
        nextId = lastUser.id + 1;
    }

    const newUser = {
        id: nextId,
        name: name,
        plan: 'Basic', 
        startDate: subsDate,
        status: '정상'
    };

    users.push(newUser);
    localStorage.setItem('spotifyUsers', JSON.stringify(users));

    alert(`${name}님, ${nextId}번 사용자로 등록되었습니다.`);
    location.href = 'admin.html'; 
});