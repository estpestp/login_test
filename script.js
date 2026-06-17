// 💡 회원 목록 및 닉네임 맵핑 데이터베이스
// 가입 신청서(Formspree)를 보고 승인해 줄 때 여기 배열에 이메일, 패스워드, 닉네임을 추가해 주시면 됩니다!
const USERS_DB = [
    { email: "3upoibe2@gmail.com", password: "1234567890", nickname: "루루 - 오너" },
    { email: "admin@example.com", password: "adminpassword", nickname: "관리자" },
    { email: "testest@gmail.com", passworsd: "testtest", nickname: "쏘쏘쏘쏠수있어!!!!!!!" }
];

let loggedInUser = null; // 로그인 성공 시 유저 객체 전체를 저장 ({email, password, nickname})
let posts = [];

// Formspree 초기화
window.formspree = window.formspree || function () { (formspree.q = formspree.q || []).push(arguments); };
formspree('initForm', { 
    formElement: '#signupForm', 
    formId: 'mwvjzjqp',
    onSuccess: function() {
        document.querySelector('[data-fs-success]').style.display = 'block';
        document.getElementById('signupForm').reset();
    }
});

// 로그인 기능
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;

    // 일치하는 유저 찾기
    const user = USERS_DB.find(u => u.email === email && u.password === pass);

    if (user) {
        loggedInUser = user; // 로그인된 유저 정보 보관
        document.getElementById('currentUser').innerText = loggedInUser.nickname; // 닉네임 표시
        
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('snsSection').style.display = 'block';
        
        loadPosts();
    } else {
        alert("❌ 멤버 정보가 올바르지 않습니다.");
    }
});

// 로그아웃 기능
function logout() {
    loggedInUser = null;
    document.getElementById('authSection').style.display = 'block';
    document.getElementById('snsSection').style.display = 'none';
    document.getElementById('loginForm').reset();
}

// 로컬 스토리지에서 글 가져오기
function loadPosts() {
    const savedPosts = localStorage.getItem('sns_posts');
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    } else {
        posts = [{ id: Date.now(), authorNickname: "관리자", authorEmail: "admin@example.com", content: "우리들만의 비밀 SNS 공간이 개설되었습니다! 자유롭게 피드를 채워보세요. 🥳", time: "2026.06.17 12:00" }];
    }
    renderFeed();
}

// 피드 출력 함수
function renderFeed() {
    const container = document.getElementById('feedContainer');
    container.innerHTML = "";

    [...posts].reverse().forEach(post => {
        const postEl = document.createElement('div');
        postEl.className = 'post';
        
        // 이메일 기준으로 내가 쓴 글인지 판별하여 삭제 버튼 활성화
        const isMyPost = post.authorEmail === loggedInUser.email;
        const deleteBtnHtml = isMyPost ? `<button class="delete-btn" onclick="deletePost(${post.id})">삭제</button>` : '';

        postEl.innerHTML = `
            <div class="post-header">
                <div class="post-author">👤 ${post.authorNickname}</div>
                ${deleteBtnHtml}
            </div>
            <div class="post-content">${post.content.replace(/\n/g, '<br>')}</div>
            <div class="post-time">${post.time}</div>
        `;
        container.appendChild(postEl);
    });
}

// 게시글 등록 기능
document.getElementById('postForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const content = document.getElementById('postInput').value.trim();
    if (!content) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    const newPost = {
        id: Date.now(),
        authorNickname: loggedInUser.nickname, // 💡 작성자 닉네임 저장
        authorEmail: loggedInUser.email,       // 삭제 검증용 이메일 저장
        content: content,
        time: timeStr
    };

    posts.push(newPost);
    localStorage.setItem('sns_posts', JSON.stringify(posts));

    document.getElementById('postInput').value = "";
    renderFeed();
});

// 글 삭제 기능
function deletePost(postId) {
    if (!confirm("정말 이 글을 삭제하시겠습니까?")) return;
    
    posts = posts.filter(post => post.id !== postId);
    localStorage.setItem('sns_posts', JSON.stringify(posts));
    renderFeed();
}
