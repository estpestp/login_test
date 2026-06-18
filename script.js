// 유저 데이터베이스 (승인된 멤버 추가 구역)
const USERS_DB = [
    { email: "3upoibe2@gmail.com", password: "1234567890", nickname: "테스터" },
    { email: "admin@example.com", password: "adminpassword", nickname: "관리자" }
];

let loggedInUser = null; 
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

    const user = USERS_DB.find(u => u.email === email && u.password === pass);

    if (user) {
        loggedInUser = user; 
        document.getElementById('currentUser').innerText = loggedInUser.nickname; 
        
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

// 로컬 스토리지 데이터 로드
function loadPosts() {
    const savedPosts = localStorage.getItem('sns_posts');
    if (savedPosts) {
        posts = JSON.parse(savedPosts);
    } else {
        posts = [{ id: Date.now(), authorNickname: "관리자", authorEmail: "admin@example.com", content: "우리들만의 비밀 SNS 공간이 개설되었습니다! 사진 파일도 자유롭게 첨부해서 피드를 꾸며보세요. 🥳", image: "", time: "2026.06.18 12:00" }];
    }
    renderFeed();
}

// 피드 화면 출력
function renderFeed() {
    const container = document.getElementById('feedContainer');
    container.innerHTML = "";

    [...posts].reverse().forEach(post => {
        const postEl = document.createElement('div');
        postEl.className = 'post';
        
        const isMyPost = post.authorEmail === loggedInUser.email;
        const deleteBtnHtml = isMyPost ? `<button class="delete-btn" onclick="deletePost(${post.id})">삭제</button>` : '';

        // 💡 사진 데이터가 있을 때만 <img> 태그를 동적으로 생성하는 로직
        const imgHtml = post.image ? `<img src="${post.image}" class="post-image" alt="첨부 이미지">` : '';

        postEl.innerHTML = `
            <div class="post-header">
                <div class="post-author">👤 ${post.authorNickname}</div>
                ${deleteBtnHtml}
            </div>
            <div class="post-content">${post.content.replace(/\n/g, '<br>')}</div>
            ${imgHtml}
            <div class="post-time">${post.time}</div>
        `;
        container.appendChild(postEl);
    });
}

// 게시글 등록 (사진 인코딩 처리 포함)
document.getElementById('postForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const content = document.getElementById('postInput').value.trim();
    const imageFile = document.getElementById('postImageInput').files[0];
    if (!content) return;

    const now = new Date();
    const timeStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    // 💡 사진 파일이 첨부되었을 때와 아닐 때를 분기해서 처리하는 함수 호출
    if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = function() {
            // 파일을 Base64 데이터 주소로 변환하여 브라우저 저장소에 직접 저장 가능한 형태로 만듦
            savePostData(content, reader.result, timeStr);
        };
        reader.readAsDataURL(imageFile);
    } else {
        savePostData(content, "", timeStr);
    }
});

// 게시글 실제 데이터를 배열과 스토리지에 Push하는 공통 로직 함수
function savePostData(content, imageData, timeStr) {
    const newPost = {
        id: Date.now(),
        authorNickname: loggedInUser.nickname, 
        authorEmail: loggedInUser.email,       
        content: content,
        image: imageData, // 💡 변환된 이미지 데이터 바인딩
        time: timeStr
    };

    posts.push(newPost);
    
    try {
        localStorage.setItem('sns_posts', JSON.stringify(posts));
    } catch (error) {
        // 로컬스토리지는 브라우저당 약 5MB 용량 제한이 있으므로, 너무 큰 고용량 사진 연속 업로드 시 예외 처리
        alert("⚠️ 브라우저 저장 공간이 가득 찼거나 사진 용량이 너무 큽니다. 조금 더 작은 사이즈의 사진을 이용해 주세요!");
        posts.pop();
        return;
    }

    // 폼 초기화
    document.getElementById('postInput').value = "";
    document.getElementById('postImageInput').value = ""; // 파일 인풋 리셋
    renderFeed();
}

// 글 삭제
function deletePost(postId) {
    if (!confirm("정말 이 글을 삭제하시겠습니까?")) return;
    
    posts = posts.filter(post => post.id !== postId);
    localStorage.setItem('sns_posts', JSON.stringify(posts));
    renderFeed();
}
