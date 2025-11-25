// Members Table View functionality
(function() {
    'use strict';

    // Config
    const SUPABASE_URL = window.APP_CONFIG?.SUPABASE_URL;
    const SUPABASE_ANON_KEY = window.APP_CONFIG?.SUPABASE_ANON_KEY;

    let supabase = null;
    let editingMemberId = null;
    let allMembers = [];

    // Initialize Supabase
    if (SUPABASE_URL && SUPABASE_ANON_KEY &&
        SUPABASE_URL !== 'YOUR_SUPABASE_URL' &&
        SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY') {

        if (!window.supabase) {
            console.error('❌ window.supabase가 로드되지 않았습니다!');
            alert('Supabase 라이브러리가 로드되지 않았습니다. 페이지를 새로고침해주세요.');
        } else {
            console.log('✅ Supabase 초기화 시작');
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase 클라이언트 생성 완료');
            loadMembers();
        }
    } else {
        console.warn('❌ Supabase configuration required');
        console.warn('설정을 확인해주세요.');
    }

    // DOM elements
    const modal = document.getElementById('memberModal');
    const addMemberBtn = document.getElementById('addMemberBtn');
    const closeModalBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const memberForm = document.getElementById('memberForm');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');
    const searchInput = document.getElementById('searchInput');
    const memberList = document.getElementById('memberList');

    // Open modal
    addMemberBtn.addEventListener('click', () => {
        editingMemberId = null;
        memberForm.reset();
        modalTitle.textContent = '새 회원 등록';
        submitBtn.textContent = '등록';
        modal.classList.remove('hidden');
    });

    // Close modal
    function closeModal() {
        modal.classList.add('hidden');
        memberForm.reset();
        editingMemberId = null;
    }

    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Close modal on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Search
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const filtered = allMembers.filter(member =>
            member.name.toLowerCase().includes(searchTerm)
        );
        renderMembers(filtered);
    });

    // Submit form
    memberForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!supabase) {
            alert('Supabase 연결이 필요합니다.');
            return;
        }

        const formData = new FormData(memberForm);

        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = editingMemberId ? '수정 중...' : '등록 중...';

        try {
            if (editingMemberId) {
                // 수정 모드
                const member = allMembers.find(m => m.id === editingMemberId);
                if (!member) throw new Error('회원 정보를 찾을 수 없습니다.');

                const userId = member._original.users.user_id;

                // 1. Update users table
                const { error: userError } = await supabase
                    .from('users')
                    .update({
                        name: formData.get('name'),
                        age: formData.get('age') ? parseInt(formData.get('age')) : null,
                        phone_number: formData.get('phone') || null,
                        gender: formData.get('gender') === 'male' ? '남' : formData.get('gender') === 'female' ? '여' : null,
                        updated_id: 'system',
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', userId);

                if (userError) throw userError;

                // 2. Update member table
                const { error: memberError } = await supabase
                    .from('member')
                    .update({
                        goal: formData.get('goal') || null,
                        physical_info: formData.get('notes') || null,
                        session_total_count: formData.get('total_sessions') ? parseInt(formData.get('total_sessions')) : null,
                        session_start_date: formData.get('session_start_date') || null,
                        session_end_date: formData.get('session_end_date') || null,
                        updated_id: 'system',
                        updated_at: new Date().toISOString()
                    })
                    .eq('member_id', editingMemberId);

                if (memberError) throw memberError;

                alert('회원 정보가 수정되었습니다.');
            } else {
                // 등록 모드
                // Get first trainer for now
                const { data: trainers } = await supabase
                    .from('trainer')
                    .select('trainer_id')
                    .limit(1);

                if (!trainers || trainers.length === 0) {
                    throw new Error('등록된 트레이너가 없습니다. 먼저 트레이너를 등록해주세요.');
                }

                const trainerId = trainers[0].trainer_id;

                // Generate user_id (simple approach: use timestamp + random)
                const userId = 'M' + Date.now();

                // 1. Insert into users table
                const { error: userError } = await supabase
                    .from('users')
                    .insert([{
                        user_id: userId,
                        password: '123456!', // 기본 비밀번호
                        role: 'member',
                        name: formData.get('name'),
                        age: formData.get('age') ? parseInt(formData.get('age')) : null,
                        birth_date: '1990-01-01', // 기본값 (나중에 수정 가능)
                        phone_number: formData.get('phone') || '010-0000-0000',
                        email: `${userId}@temp.com`, // 임시 이메일
                        gender: formData.get('gender') === 'male' ? '남' : formData.get('gender') === 'female' ? '여' : '남',
                        address: '주소 미입력',
                        zip_code: '00000',
                        is_active: 'Y',
                        created_id: 'system',
                        updated_id: 'system'
                    }]);

                if (userError) throw userError;

                // 2. Insert into member table
                const totalSessions = formData.get('total_sessions') ? parseInt(formData.get('total_sessions')) : 10;
                const { error: memberError } = await supabase
                    .from('member')
                    .insert([{
                        member_id: userId,
                        trainer_id: trainerId,
                        goal: formData.get('goal') || null,
                        physical_info: formData.get('notes') || null,
                        session_start_date: formData.get('session_start_date') || new Date().toISOString().split('T')[0],
                        session_end_date: formData.get('session_end_date') || new Date(Date.now() + 90*24*60*60*1000).toISOString().split('T')[0],
                        session_total_count: totalSessions,
                        session_used_count: 0,
                        session_holding_count: 0,
                        created_id: 'system',
                        updated_id: 'system'
                    }]);

                if (memberError) throw memberError;

                alert('회원이 등록되었습니다.');
            }

            closeModal();
            loadMembers();
        } catch (error) {
            console.error('Error:', error);
            alert('저장에 실패했습니다: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // Load members
    async function loadMembers() {
        if (!supabase) return;

        try {
            const { data, error } = await supabase
                .from('member')
                .select(`
                    member_id,
                    trainer_id,
                    goal,
                    physical_info,
                    session_start_date,
                    session_end_date,
                    session_total_count,
                    session_used_count,
                    users!inner(
                        user_id,
                        name,
                        age,
                        birth_date,
                        phone_number,
                        email,
                        gender
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to match expected structure
            allMembers = data.map(m => ({
                id: m.member_id,
                name: m.users.name,
                age: m.users.age,
                gender: m.users.gender === '남' ? 'male' : 'female',
                phone: m.users.phone_number,
                goal: m.goal,
                notes: m.physical_info,
                total_sessions: m.session_total_count,
                remaining_sessions: m.session_total_count - m.session_used_count,
                session_start_date: m.session_start_date,
                session_end_date: m.session_end_date,
                // Keep original data for editing
                _original: m
            }));

            renderMembers(allMembers);
        } catch (error) {
            console.error('Error loading members:', error);
        }
    }

    // Render members as table
    function renderMembers(members) {
        if (members.length === 0) {
            memberList.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 4rem; color: var(--text-muted);">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 1rem; opacity: 0.5;">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <p>${searchInput.value ? '검색 결과가 없습니다' : '등록된 회원이 없습니다'}</p>
                    </td>
                </tr>
            `;
            return;
        }

        memberList.innerHTML = members.map(member => {
            // Determine session badge class
            let badgeClass = 'high';
            const remaining = member.remaining_sessions || 0;
            if (remaining === 0) {
                badgeClass = 'low';
            } else if (remaining <= 3) {
                badgeClass = 'medium';
            }

            // Format session period
            let sessionPeriod = '-';
            if (member.session_start_date && member.session_end_date) {
                const start = new Date(member.session_start_date).toLocaleDateString('ko-KR', {month: 'numeric', day: 'numeric'});
                const end = new Date(member.session_end_date).toLocaleDateString('ko-KR', {month: 'numeric', day: 'numeric'});
                sessionPeriod = `${start} ~ ${end}`;
            } else if (member.session_start_date) {
                sessionPeriod = new Date(member.session_start_date).toLocaleDateString('ko-KR', {month: 'numeric', day: 'numeric'}) + ' ~';
            } else if (member.session_end_date) {
                sessionPeriod = '~ ' + new Date(member.session_end_date).toLocaleDateString('ko-KR', {month: 'numeric', day: 'numeric'});
            }

            // Format body composition
            let bodyComp = [];
            if (member.height) bodyComp.push(`${member.height}cm`);
            if (member.weight) bodyComp.push(`${member.weight}kg`);
            if (member.body_fat_percentage) bodyComp.push(`${member.body_fat_percentage}%`);
            const bodyCompStr = bodyComp.length > 0 ? bodyComp.join(' / ') : '-';

            return `
                <tr>
                    <td><strong>${member.name}</strong></td>
                    <td>${member.age ? member.age + '세' : '-'} ${member.gender === 'male' ? '남' : member.gender === 'female' ? '여' : ''}</td>
                    <td>${member.phone || '-'}</td>
                    <td>
                        <div class="session-info">
                            <span class="session-badge ${badgeClass}">
                                ${member.remaining_sessions || 0}/${member.total_sessions || 0}
                            </span>
                        </div>
                    </td>
                    <td style="font-size: var(--font-size-xs);">${sessionPeriod}</td>
                    <td>${member.goal || '-'}</td>
                    <td style="font-size: var(--font-size-xs);">${bodyCompStr}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon btn-secondary" onclick="editMember('${member.id}')" title="수정">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="btn-icon btn-danger" onclick="deleteMember('${member.id}', '${member.name}')" title="삭제">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    // Edit member
    async function editMember(memberId) {
        if (!supabase) return;

        try {
            const member = allMembers.find(m => m.id === memberId);
            if (!member) {
                throw new Error('회원 정보를 찾을 수 없습니다.');
            }

            editingMemberId = memberId;
            document.getElementById('name').value = member.name || '';
            document.getElementById('age').value = member.age || '';
            document.getElementById('gender').value = member.gender || '';
            document.getElementById('phone').value = member.phone || '';
            document.getElementById('goal').value = member.goal || '';
            document.getElementById('notes').value = member.notes || '';

            // 세션 정보
            document.getElementById('total_sessions').value = member.total_sessions || '';
            document.getElementById('remaining_sessions').value = member.remaining_sessions || '';
            document.getElementById('session_start_date').value = member.session_start_date || '';
            document.getElementById('session_end_date').value = member.session_end_date || '';

            // 체성분 정보는 새 스키마에서 별도 테이블이므로 일단 빈 값으로 설정
            document.getElementById('height').value = '';
            document.getElementById('weight').value = '';
            document.getElementById('skeletal_muscle_mass').value = '';
            document.getElementById('body_fat_mass').value = '';
            document.getElementById('body_fat_percentage').value = '';
            document.getElementById('abdominal_fat_percentage').value = '';
            document.getElementById('visceral_fat_level').value = '';
            document.getElementById('body_water').value = '';
            document.getElementById('basal_metabolic_rate').value = '';

            modalTitle.textContent = '회원 정보 수정';
            submitBtn.textContent = '수정';
            modal.classList.remove('hidden');
        } catch (error) {
            console.error('Error loading member:', error);
            alert('회원 정보를 불러오는데 실패했습니다.');
        }
    }

    // Delete member
    async function deleteMember(memberId, memberName) {
        if (!supabase) return;

        if (!confirm(`${memberName} 회원을 삭제하시겠습니까?\n관련된 모든 데이터도 함께 삭제됩니다.`)) {
            return;
        }

        try {
            // 1. Delete from member table (CASCADE will handle training_sessions)
            const { error: memberError } = await supabase
                .from('member')
                .delete()
                .eq('member_id', memberId);

            if (memberError) throw memberError;

            // 2. Delete from users table
            const { error: userError } = await supabase
                .from('users')
                .delete()
                .eq('user_id', memberId);

            if (userError) throw userError;

            alert('회원이 삭제되었습니다.');
            loadMembers();
        } catch (error) {
            console.error('Error deleting member:', error);
            alert('회원 삭제에 실패했습니다: ' + error.message);
        }
    }

    // Make functions global
    window.editMember = editMember;
    window.deleteMember = deleteMember;

})();
