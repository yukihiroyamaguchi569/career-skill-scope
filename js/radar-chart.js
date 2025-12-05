/**
 * レーダーチャートの実装
 */

class RadarChart {
    constructor(elementId, dataModel) {
        this.elementId = elementId;
        this.dataModel = dataModel;
        this.svg = null;
        this.width = 0;
        this.height = 0;
        this.radius = 0;
        this.centerX = 0;
        this.centerY = 0;
        this.colors = d3.scaleOrdinal(d3.schemeCategory10);
        this.tooltip = null;
        
        this.init();
    }

    // 初期化
    init() {
        const container = d3.select(`#${this.elementId}`);
        const containerWidth = container.node().getBoundingClientRect().width;
        const containerHeight = container.node().getBoundingClientRect().height;

        this.width = containerWidth;
        this.height = containerHeight;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.radius = Math.min(this.width, this.height) / 2 - 50;

        // SVG要素の作成
        this.svg = container.append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .append('g')
            .attr('transform', `translate(${this.centerX}, ${this.centerY})`);

        // ツールチップの作成
        this.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

        this.drawRadarGrid();
        this.drawCategoryLabels();
    }

    // レーダーチャートのグリッドを描画
    drawRadarGrid() {
        // 同心円を描画
        const circles = [];
        for (let i = 1; i <= 10; i++) {
            circles.push(i);
        }

        this.svg.selectAll('.radar-circle')
            .data(circles)
            .enter()
            .append('circle')
            .attr('class', 'radar-grid')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', d => (d / 10) * this.radius)
            .attr('fill', 'none')
            .attr('stroke', '#ccc')
            .attr('stroke-dasharray', '2,2');

        // カテゴリの区分線を描画
        CATEGORIES.forEach(category => {
            const angle = (category.startAngle + category.endAngle) / 2;
            const radians = (angle - 90) * (Math.PI / 180);
            const x = this.radius * Math.cos(radians);
            const y = this.radius * Math.sin(radians);

            this.svg.append('line')
                .attr('class', 'radar-axis')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', x)
                .attr('y2', y);
        });
    }

    // カテゴリラベルを描画
    drawCategoryLabels() {
        CATEGORIES.forEach(category => {
            const angle = (category.startAngle + category.endAngle) / 2;
            const radians = (angle - 90) * (Math.PI / 180);
            const x = (this.radius + 20) * Math.cos(radians);
            const y = (this.radius + 20) * Math.sin(radians);

            this.svg.append('text')
                .attr('class', 'category-label')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', x > 0 ? 'start' : x < 0 ? 'end' : 'middle')
                .attr('dominant-baseline', y > 0 ? 'hanging' : y < 0 ? 'auto' : 'middle')
                .text(category.name);
        });
    }

    // 特定の年齢のスキルデータを描画
    drawSkillData(age) {
        const skills = this.dataModel.getSkillsByAge(age);
        const connections = this.dataModel.getConnectionLines(age);

        // 既存のスキルポイントとラインを削除
        this.svg.selectAll('.skill-point').remove();
        this.svg.selectAll('.connection-line').remove();

        // 接続線を描画
        connections.forEach(connection => {
            const source = connection.source;
            const target = connection.target;

            const sourceRadians = (source.angle - 90) * (Math.PI / 180);
            const targetRadians = (target.angle - 90) * (Math.PI / 180);

            const sourceX = (source.level / 10) * this.radius * Math.cos(sourceRadians);
            const sourceY = (source.level / 10) * this.radius * Math.sin(sourceRadians);
            const targetX = (target.level / 10) * this.radius * Math.cos(targetRadians);
            const targetY = (target.level / 10) * this.radius * Math.sin(targetRadians);

            this.svg.append('line')
                .attr('class', 'connection-line')
                .attr('x1', sourceX)
                .attr('y1', sourceY)
                .attr('x2', targetX)
                .attr('y2', targetY)
                .attr('stroke', this.colors(age))
                .attr('stroke-width', 2)
                .attr('opacity', 0.7);
        });

        // スキルポイントを描画
        const skillPoints = this.svg.selectAll('.skill-point')
            .data(skills)
            .enter()
            .append('circle')
            .attr('class', 'skill-point')
            .attr('cx', d => {
                const radians = (d.angle - 90) * (Math.PI / 180);
                return (d.level / 10) * this.radius * Math.cos(radians);
            })
            .attr('cy', d => {
                const radians = (d.angle - 90) * (Math.PI / 180);
                return (d.level / 10) * this.radius * Math.sin(radians);
            })
            .attr('r', 5)
            .attr('fill', this.colors(age));

        // ツールチップの追加
        skillPoints
            .on('mouseover', (event, d) => {
                this.tooltip.transition()
                    .duration(200)
                    .style('opacity', .9);
                this.tooltip.html(`
                    <strong>${d.name}</strong><br>
                    レベル: ${d.level}<br>
                    カテゴリ: ${CATEGORIES[d.categoryId].name}<br>
                    年齢: ${d.age}歳
                `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', () => {
                this.tooltip.transition()
                    .duration(500)
                    .style('opacity', 0);
            });
    }

    // 全年齢のスキルデータを描画
    drawAllAges() {
        // 既存のスキルポイントとラインを削除
        this.svg.selectAll('.skill-point').remove();
        this.svg.selectAll('.connection-line').remove();

        // 各年齢ごとにスキルを描画（透明度を調整して重ならないようにする）
        AGES.forEach((age, index) => {
            const skills = this.dataModel.getSkillsByAge(age);
            const connections = this.dataModel.getConnectionLines(age);

            // 接続線を描画
            connections.forEach(connection => {
                const source = connection.source;
                const target = connection.target;

                const sourceRadians = (source.angle - 90) * (Math.PI / 180);
                const targetRadians = (target.angle - 90) * (Math.PI / 180);

                const sourceX = (source.level / 10) * this.radius * Math.cos(sourceRadians);
                const sourceY = (source.level / 10) * this.radius * Math.sin(sourceRadians);
                const targetX = (target.level / 10) * this.radius * Math.cos(targetRadians);
                const targetY = (target.level / 10) * this.radius * Math.sin(targetRadians);

                this.svg.append('line')
                    .attr('class', 'connection-line')
                    .attr('x1', sourceX)
                    .attr('y1', sourceY)
                    .attr('x2', targetX)
                    .attr('y2', targetY)
                    .attr('stroke', this.colors(age))
                    .attr('stroke-width', 1.5)
                    .attr('opacity', 0.4);
            });

            // スキルポイントを描画
            const skillPoints = this.svg.selectAll(`.skill-point-${age}`)
                .data(skills)
                .enter()
                .append('circle')
                .attr('class', `skill-point skill-point-${age}`)
                .attr('cx', d => {
                    const radians = (d.angle - 90) * (Math.PI / 180);
                    return (d.level / 10) * this.radius * Math.cos(radians);
                })
                .attr('cy', d => {
                    const radians = (d.angle - 90) * (Math.PI / 180);
                    return (d.level / 10) * this.radius * Math.sin(radians);
                })
                .attr('r', 4)
                .attr('fill', this.colors(age))
                .attr('opacity', 0.6);

            // ツールチップの追加
            skillPoints
                .on('mouseover', (event, d) => {
                    this.tooltip.transition()
                        .duration(200)
                        .style('opacity', .9);
                    this.tooltip.html(`
                        <strong>${d.name}</strong><br>
                        レベル: ${d.level}<br>
                        カテゴリ: ${CATEGORIES[d.categoryId].name}<br>
                        年齢: ${d.age}歳
                    `)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 28) + 'px');
                })
                .on('mouseout', () => {
                    this.tooltip.transition()
                        .duration(500)
                        .style('opacity', 0);
                });
        });
    }

    // ウィンドウサイズ変更時の再描画
    resize() {
        const container = d3.select(`#${this.elementId}`);
        const containerWidth = container.node().getBoundingClientRect().width;
        const containerHeight = container.node().getBoundingClientRect().height;

        this.width = containerWidth;
        this.height = containerHeight;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.radius = Math.min(this.width, this.height) / 2 - 50;

        // SVG要素のサイズを更新
        container.select('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        container.select('svg g')
            .attr('transform', `translate(${this.centerX}, ${this.centerY})`);

        // グリッドと軸を再描画
        this.svg.selectAll('*').remove();
        this.drawRadarGrid();
        this.drawCategoryLabels();

        // 現在表示中の年齢のデータを再描画
        const currentAge = parseInt(d3.select('#age-slider').property('value'));
        this.drawSkillData(currentAge);
    }
}
