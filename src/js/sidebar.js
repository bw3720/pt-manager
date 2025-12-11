// Sidebar Component - 공통 사이드바 생성 및 관리

function createSidebar(currentPage) {
    const sidebarHTML = `
        <div class="sidebar-header">
            <div class="sidebar-logo">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
            </div>
            <div class="sidebar-title">
                <div class="sidebar-title-main">PT Manager</div>
                <div class="sidebar-title-sub">트레이너의</div>
                <div class="sidebar-title-sub">맞춤형 회원 관리 시스템</div>
            </div>
        </div>

        <button class="logout-button" id="logoutButton">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            로그아웃
        </button>

        <nav class="sidebar-nav">
            <a href="dashboard.html" class="nav-item ${currentPage === 'dashboard' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                대시보드
            </a>
            <a href="main.html" class="nav-item ${currentPage === 'main' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                트레이너 소개
            </a>
            <a href="members.html" class="nav-item ${currentPage === 'members' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75"></path>
                </svg>
                회원 관리
            </a>
            <a href="members2.html" class="nav-item ${currentPage === 'members2' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="10" width="18" height="12" rx="2"></rect>
                    <path d="M7 10V6a5 5 0 0 1 10 0v4"></path>
                    <line x1="9" y1="16" x2="9" y2="16"></line>
                    <line x1="15" y1="16" x2="15" y2="16"></line>
                </svg>
                회원 관리2
            </a>
            <a href="workout-entry.html" class="nav-item ${currentPage === 'workout-entry' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                운동일지 작성
            </a>
            <a href="workout-entry2.html" class="nav-item ${currentPage === 'workout-entry2' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                운동일지 작성2
            </a>
            <a href="workout-history.html" class="nav-item ${currentPage === 'workout-history' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                운동일지 조회
            </a>
            <a href="ai-consultation.html" class="nav-item ${currentPage === 'ai-consultation' ? 'active' : ''}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                AI 상담
            </a>
        </nav>

        <div class="sidebar-footer">
            © 2025 PT Manager
        </div>
    `;

    return sidebarHTML;
}

// 사이드바 초기화 및 이벤트 리스너 설정
function initSidebar(currentPage) {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.innerHTML = createSidebar(currentPage);

        // 로그아웃 버튼 이벤트 리스너
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }
    }
}

// 로그아웃 처리
function handleLogout() {
    // auth.js에서 제공하는 전역 logout 함수 사용
    if (typeof window.logout === 'function') {
        window.logout();
    } else {
        console.error('[Sidebar] auth.js의 logout 함수를 찾을 수 없습니다.');
        // Fallback: 직접 처리
        localStorage.removeItem('pt_manager_user_id');
        localStorage.removeItem('pt_manager_user_role');
        localStorage.removeItem('pt_manager_user_name');
        sessionStorage.removeItem('pt_manager_user_id');
        sessionStorage.removeItem('pt_manager_user_role');
        sessionStorage.removeItem('pt_manager_user_name');
        window.location.replace('login.html');
    }
}

// 페이지 로드 시 자동으로 사이드바 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 현재 페이지 이름 가져오기
    const currentPage = getCurrentPageName();
    initSidebar(currentPage);
});

// 현재 페이지 이름 가져오기
function getCurrentPageName() {
    const path = window.location.pathname;
    const page = path.split('/').pop().replace('.html', '');
    return page || 'dashboard';
}
