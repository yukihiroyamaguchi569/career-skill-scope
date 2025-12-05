/**
 * キャリアスキルスコープのメインアプリケーションロジック
 */

document.addEventListener('DOMContentLoaded', function() {
    // レーダーチャートの初期化
    const radarChart = new RadarChart('radar-chart', skillDataModel);
    
    // 年齢スライダーの初期化
    const ageSlider = document.getElementById('age-slider');
    const selectedAgeDisplay = document.getElementById('selected-age');
    
    // フォーム要素の取得
    const skillForm = document.getElementById('skill-form');
    const ageSelect = document.getElementById('age-select');
    const categorySelect = document.getElementById('category-select');
    const skillNameInput = document.getElementById('skill-name');
    const skillLevelInput = document.getElementById('skill-level');
    const skillLevelDisplay = document.getElementById('skill-level-display');
    const skillList = document.getElementById('skill-list');
    
    // 初期表示
    updateSkillList();
    radarChart.drawSkillData(15);
    
    // 年齢スライダーの変更イベント
    ageSlider.addEventListener('input', function() {
        const age = parseInt(this.value);
        selectedAgeDisplay.textContent = age;
        radarChart.drawSkillData(age);
    });
    
    // スキルレベルスライダーの変更イベント
    skillLevelInput.addEventListener('input', function() {
        skillLevelDisplay.textContent = this.value;
    });
    
    // スキル追加フォームの送信イベント
    skillForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const age = parseInt(ageSelect.value);
        const categoryId = parseInt(categorySelect.value);
        const name = skillNameInput.value;
        const level = parseInt(skillLevelInput.value);
        
        if (!age || isNaN(categoryId) || !name || isNaN(level)) {
            alert('全ての項目を入力してください。');
            return;
        }
        
        // スキルを追加
        skillDataModel.addSkill(age, categoryId, name, level);
        
        // フォームをリセット
        skillForm.reset();
        skillLevelDisplay.textContent = '0';
        
        // 表示を更新
        updateSkillList();
        radarChart.drawSkillData(ageSlider.value);
    });
    
    // スキルリストの更新
    function updateSkillList() {
        skillList.innerHTML = '';
        
        const allSkills = skillDataModel.getAllSkills();
        
        if (allSkills.length === 0) {
            skillList.innerHTML = '<p>登録されたスキルはありません。</p>';
            return;
        }
        
        // 年齢でソート
        allSkills.sort((a, b) => a.age - b.age || a.categoryId - b.categoryId);
        
        // スキルリストを作成
        allSkills.forEach(skill => {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            
            const skillInfo = document.createElement('div');
            skillInfo.innerHTML = `
                <strong>${skill.name}</strong> (Lv.${skill.level}) - 
                ${skill.age}歳 - 
                ${CATEGORIES[skill.categoryId].name}
            `;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = '削除';
            deleteBtn.addEventListener('click', function() {
                if (confirm(`「${skill.name}」を削除しますか？`)) {
                    skillDataModel.removeSkill(skill.id);
                    updateSkillList();
                    radarChart.drawSkillData(ageSlider.value);
                }
            });
            
            skillItem.appendChild(skillInfo);
            skillItem.appendChild(deleteBtn);
            skillList.appendChild(skillItem);
        });
    }
    
    // ウィンドウリサイズ時の処理
    window.addEventListener('resize', function() {
        radarChart.resize();
    });
    
    // デモデータの追加（開発用）
    function addDemoData() {
        if (skillDataModel.getAllSkills().length > 0) {
            return; // すでにデータがある場合は追加しない
        }
        
        // 15歳のデータ
        skillDataModel.addSkill(15, 4, '英語（初級）', 2);
        skillDataModel.addSkill(15, 5, 'ピアノ', 3);
        skillDataModel.addSkill(15, 7, 'バスケットボール', 4);
        
        // 20歳のデータ
        skillDataModel.addSkill(20, 0, 'プログラミング（基礎）', 3);
        skillDataModel.addSkill(20, 4, '英語（中級）', 4);
        skillDataModel.addSkill(20, 5, 'ピアノ', 5);
        skillDataModel.addSkill(20, 7, 'バスケットボール', 6);
        
        // 25歳のデータ
        skillDataModel.addSkill(25, 0, 'プログラミング（中級）', 5);
        skillDataModel.addSkill(25, 1, 'プロジェクト管理', 3);
        skillDataModel.addSkill(25, 2, 'チームワーク', 4);
        skillDataModel.addSkill(25, 4, '英語（上級）', 6);
        
        // 30歳のデータ
        skillDataModel.addSkill(30, 0, 'プログラミング（上級）', 7);
        skillDataModel.addSkill(30, 1, 'プロジェクト管理', 5);
        skillDataModel.addSkill(30, 2, 'リーダーシップ', 4);
        skillDataModel.addSkill(30, 9, 'ウェブデザイン', 6);
        
        // 表示を更新
        updateSkillList();
        radarChart.drawSkillData(15);
    }
    
    // デモデータボタンの追加（開発用）
    const demoButton = document.createElement('button');
    demoButton.textContent = 'デモデータを追加';
    demoButton.style.marginTop = '1rem';
    demoButton.addEventListener('click', function() {
        addDemoData();
    });
    
    document.querySelector('.skill-list-container').appendChild(demoButton);
});
