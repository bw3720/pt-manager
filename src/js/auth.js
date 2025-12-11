// Authentication & Session Management
// 모든 페이지에서 로그인 여부를 확인하고 세션을 관리합니다

(function() {
    'use strict';

    // 현재 페이지가 로그인 페이지인지 확인
    function isLoginPage() {
        const path = window.location.pathname;
        return path.includes('login.html') || path.includes('find-account.html');
    }

    // 세션 정보 가져오기
    function getSession() {
        // localStorage 먼저 확인 (로그인 상태 유지 체크한 경우)
        let userId = localStorage.getItem('pt_manager_user_id');
        let userRole = localStorage.getItem('pt_manager_user_role');
        let userName = localStorage.getItem('pt_manager_user_name');

        // localStorage에 없으면 sessionStorage 확인
        if (!userId) {
            userId = sessionStorage.getItem('pt_manager_user_id');
            userRole = sessionStorage.getItem('pt_manager_user_role');
            userName = sessionStorage.getItem('pt_manager_user_name');
        }

        if (userId && userRole && userName) {
            return {
                userId,
                userRole,
                userName,
                isAuthenticated: true
            };
        }

        return {
            isAuthenticated: false
        };
    }

    // 세션 검증 및 리다이렉트
    function validateSession() {
        const session = getSession();

        // 로그인 페이지가 아닌데 세션이 없으면 로그인 페이지로 리다이렉트
        if (!isLoginPage() && !session.isAuthenticated) {
            console.log('[Auth] 세션이 없습니다. 로그인 페이지로 이동합니다.');
            window.location.replace('login.html'); // replace 사용으로 뒤로가기 방지
            return false;
        }

        // 로그인 페이지인데 세션이 있으면 대시보드로 리다이렉트
        if (isLoginPage() && session.isAuthenticated) {
            console.log('[Auth] 이미 로그인되어 있습니다. 대시보드로 이동합니다.');
            window.location.replace('dashboard.html');
            return false;
        }

        return true;
    }

    // 세션 정보를 전역으로 노출 (다른 스크립트에서 사용 가능)
    window.getCurrentUser = function() {
        return getSession();
    };

    // 로그아웃 함수 (전역으로 노출)
    window.logout = function() {
        // Clear all stored user data
        localStorage.removeItem('pt_manager_user_id');
        localStorage.removeItem('pt_manager_user_role');
        localStorage.removeItem('pt_manager_user_name');
        sessionStorage.removeItem('pt_manager_user_id');
        sessionStorage.removeItem('pt_manager_user_role');
        sessionStorage.removeItem('pt_manager_user_name');

        console.log('[Auth] 로그아웃 완료');

        // Redirect to login page
        window.location.replace('login.html'); // replace 사용으로 뒤로가기 방지
    };

    // 페이지 로드 시 세션 검증
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', validateSession);
    } else {
        validateSession();
    }

    // 페이지가 보이게 될 때마다 세션 재검증 (뒤로가기 대응)
    window.addEventListener('pageshow', function(event) {
        // bfcache(back-forward cache)에서 복원된 경우
        if (event.persisted || (window.performance && window.performance.navigation.type === 2)) {
            console.log('[Auth] 페이지가 캐시에서 복원되었습니다. 세션을 재검증합니다.');
            validateSession();
        }
    });

    // 브라우저 포커스 시 세션 재검증
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && !isLoginPage()) {
            const session = getSession();
            if (!session.isAuthenticated) {
                console.log('[Auth] 세션이 만료되었습니다. 로그인 페이지로 이동합니다.');
                window.location.replace('login.html');
            }
        }
    });

    console.log('[Auth] 인증 모듈 초기화 완료');
})();
