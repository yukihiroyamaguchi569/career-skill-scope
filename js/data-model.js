/**
 * キャリアスキルスコープのデータモデル
 */

// カテゴリの定義
const CATEGORIES = [
    { id: 0, name: '専門技術スキル', startAngle: 0, endAngle: 29 },
    { id: 1, name: 'ビジネススキル', startAngle: 30, endAngle: 59 },
    { id: 2, name: '対人スキル', startAngle: 60, endAngle: 89 },
    { id: 3, name: '知的スキル', startAngle: 90, endAngle: 119 },
    { id: 4, name: '言語・コミュニケーション', startAngle: 120, endAngle: 149 },
    { id: 5, name: '音楽スキル', startAngle: 150, endAngle: 179 },
    { id: 6, name: '視覚芸術スキル', startAngle: 180, endAngle: 209 },
    { id: 7, name: '身体的スキル・スポーツ', startAngle: 210, endAngle: 239 },
    { id: 8, name: '手工芸・DIYスキル', startAngle: 240, endAngle: 269 },
    { id: 9, name: 'デジタルスキル', startAngle: 270, endAngle: 299 },
    { id: 10, name: '社会活動・ボランティア', startAngle: 300, endAngle: 329 },
    { id: 11, name: '自己啓発・マインドフルネス', startAngle: 330, endAngle: 359 }
];

// 年齢の定義
const AGES = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75];

// データモデルクラス
class SkillDataModel {
    constructor() {
        this.skills = [];
        this.loadFromLocalStorage();
    }

    // スキルを追加
    addSkill(age, categoryId, name, level) {
        // カテゴリの中央角度を計算
        const category = CATEGORIES[categoryId];
        const angle = (category.startAngle + category.endAngle) / 2;

        const skill = {
            id: Date.now().toString(), // ユニークID
            age: parseInt(age),
            categoryId: parseInt(categoryId),
            name: name,
            level: parseInt(level),
            angle: angle
        };

        this.skills.push(skill);
        this.saveToLocalStorage();
        return skill;
    }

    // スキルを削除
    removeSkill(skillId) {
        this.skills = this.skills.filter(skill => skill.id !== skillId);
        this.saveToLocalStorage();
    }

    // 特定の年齢のスキルを取得
    getSkillsByAge(age) {
        return this.skills.filter(skill => skill.age === parseInt(age));
    }

    // 全ての年齢のスキルを取得
    getAllSkills() {
        return this.skills;
    }

    // ローカルストレージに保存
    saveToLocalStorage() {
        localStorage.setItem('careerSkillData', JSON.stringify(this.skills));
    }

    // ローカルストレージから読み込み
    loadFromLocalStorage() {
        const savedData = localStorage.getItem('careerSkillData');
        if (savedData) {
            this.skills = JSON.parse(savedData);
        }
    }

    // ローカルストレージをクリア
    clearLocalStorage() {
        localStorage.removeItem('careerSkillData');
        this.skills = [];
    }

    // 2つのスキルポイント間の角度差を計算
    static getAngleDifference(angle1, angle2) {
        let diff = Math.abs(angle1 - angle2);
        return diff > 180 ? 360 - diff : diff;
    }

    // 特定の年齢のスキルポイントを接続するラインを生成
    getConnectionLines(age) {
        const ageSkills = this.getSkillsByAge(age);
        const lines = [];

        // 角度でソート
        ageSkills.sort((a, b) => a.angle - b.angle);

        // 30度以内のポイントを線で接続
        for (let i = 0; i < ageSkills.length; i++) {
            for (let j = i + 1; j < ageSkills.length; j++) {
                const angleDiff = SkillDataModel.getAngleDifference(ageSkills[i].angle, ageSkills[j].angle);
                if (angleDiff <= 30) {
                    lines.push({
                        source: ageSkills[i],
                        target: ageSkills[j]
                    });
                }
            }
        }

        return lines;
    }
}

// データモデルのインスタンスを作成
const skillDataModel = new SkillDataModel();
