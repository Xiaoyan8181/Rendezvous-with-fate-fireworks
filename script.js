document.addEventListener('DOMContentLoaded', () => {
    const gemSlots = document.querySelectorAll('.gem-slot');
    const gemOptions = document.querySelectorAll('.gem-option');
    const effectDisplay = document.getElementById('effect-display');
    const recordCombinationBtn = document.getElementById('record-combination-btn');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const unrecordedCombinationsGrid = document.getElementById('unrecorded-combinations-grid');
    const recordedCombinationsGrid = document.getElementById('recorded-combinations-grid');

    let currentGems = Array(4).fill(null);
    let recordedCombinations = new Set(JSON.parse(localStorage.getItem('recordedCombinations') || '[]'));

    const termColors = {
        '點燃': 'term-red',
        '斬裂': 'term-red',
        '蝕滅': 'term-red',
        '裂蝕': 'term-red',
        '引雷': 'term-yellow',
        '凍結': 'term-blue',
        '冰封': 'term-blue',
        '霸體': 'term-blue',
        '隱形': 'term-blue',
        '無敵': 'term-blue',
        '護盾': 'term-blue',
        '混亂': 'term-purple',
        '束縛': 'term-purple',
        '禁錮': 'term-purple',
        '詛咒': 'term-purple',
        '昏睡': 'term-purple',
        '變萌': 'term-purple'
    };

    const gemOrder = { 'R': 1, 'Y': 2, 'B': 3, 'P': 4 };

    function getSortedGemsString(gemsArray) {
        return [...gemsArray].sort((a, b) => gemOrder[a] - gemOrder[b]).join('');
    }

    const allPossibleCombinations = [
        { name: '皇家聖焰', type: 'unique4', gems: ['R', 'Y', 'B', 'P'] },
        { name: '極彩輝煌', type: 'unique1', gems: ['R', 'R', 'R', 'R'] },
        { name: '極彩輝煌', type: 'unique1', gems: ['Y', 'Y', 'Y', 'Y'] },
        { name: '極彩輝煌', type: 'unique1', gems: ['B', 'B', 'B', 'B'] },
        { name: '極彩輝煌', type: 'unique1', gems: ['P', 'P', 'P', 'P'] },
        { name: '二重幻華', type: 'two_pairs', gems: ['R', 'R', 'Y', 'Y'] },
        { name: '二重幻華', type: 'two_pairs', gems: ['R', 'R', 'B', 'B'] },
        { name: '二重幻華', type: 'two_pairs', gems: ['R', 'R', 'P', 'P'] },
        { name: '二重幻華', type: 'two_pairs', gems: ['Y', 'Y', 'B', 'B'] },
        { name: '二重幻華', type: 'two_pairs', gems: ['Y', 'Y', 'P', 'P'] },
        { name: '二重幻華', type: 'two_pairs', gems: ['B', 'B', 'P', 'P'] },
        { name: '月映星輝', type: 'three_one', gems: ['R', 'R', 'R', 'Y'] },
        { name: '月映星輝', type: 'three_one', gems: ['R', 'R', 'R', 'B'] },
        { name: '月映星輝', type: 'three_one', gems: ['R', 'R', 'R', 'P'] },
        { name: '月映星輝', type: 'three_one', gems: ['Y', 'Y', 'Y', 'R'] },
        { name: '月映星輝', type: 'three_one', gems: ['Y', 'Y', 'Y', 'B'] },
        { name: '月映星輝', type: 'three_one', gems: ['Y', 'Y', 'Y', 'P'] },
        { name: '月映星輝', type: 'three_one', gems: ['B', 'B', 'B', 'R'] },
        { name: '月映星輝', type: 'three_one', gems: ['B', 'B', 'B', 'Y'] },
        { name: '月映星輝', type: 'three_one', gems: ['B', 'B', 'B', 'P'] },
        { name: '月映星輝', type: 'three_one', gems: ['P', 'P', 'P', 'R'] },
        { name: '月映星輝', type: 'three_one', gems: ['P', 'P', 'P', 'Y'] },
        { name: '月映星輝', type: 'three_one', gems: ['P', 'P', 'P', 'B'] },
        { name: '星屑幽光', type: 'two_one_one', gems: ['R', 'R', 'Y', 'B'] },
        { name: '星屑幽光', type: 'two_one_one', gems: ['R', 'R', 'Y', 'P'] },
        { name: '星屑幽光', type: 'two_one_one', gems: ['R', 'R', 'B', 'P'] },
        { name: '星屑幽光', type: 'two_one_one', gems: ['Y', 'Y', 'R', 'B'] },
        { name: '星屑幽光', type: 'two_one_one', gems: ['Y', 'Y', 'R', 'P'] },
        { name: '星屑幽光', type: 'two_one_one', gems: ['Y', 'Y', 'B', 'P'] },
        { name: '星屑幽光', type: 'two_one_one', gems: ['B', 'B', 'R', 'Y'] },
        { name: '星屑幽光', type: 'two_one_one', gems: ['B', 'B', 'R', 'P'] },
        { name: '星屑幽光', type: 'two_one_one', gems: ['B', 'B', 'Y', 'P'] },
        { name: '星屑幽光', type: 'two_one_one', gems: ['P', 'P', 'R', 'Y'] },
        { name: '星屑幽光', type: 'two_one_one', gems: ['P', 'P', 'R', 'B'] },
        { name: '星屑幽光', type: 'two_one_one', gems: ['P', 'P', 'Y', 'B'] }
    ];

    const combinationMap = new Map();
    allPossibleCombinations.forEach(combo => {
        const sortedKey = getSortedGemsString(combo.gems);
        combo.sortedGems = sortedKey;
        combinationMap.set(sortedKey, combo);
    });

    const combinationDescriptions = {
        'RYBP': '我方全體所有機率觸發機制機率+10%',
        'RRRR': '所有紅卡所需費用-1',
        'YYYY': '手牌上限+3張',
        'BBBB': '打出藍卡後，我方全體攻擊力+0.5%，上限50%',
        'PPPP': '所有紫卡所需費用-1',
        'RRYY': '每10秒觸發1次，從牌庫或棄牌區將1張紅卡加入手牌',
        'RRBB': '我方全體【爆炸物】/【機械單位】造成的傷害提高50%',
        'RRPP': '我方全體造成的最終傷害提高25%',
        'YYBB': '每10秒觸發1次，從牌庫或棄牌區將1張藍卡加入手牌',
        'YYPP': '手牌補充冷卻時間縮短1秒',
        'BBPP': '我方全體受到的最終傷害降低25%',
        'RRRY': '我方全體造成的燃燒傷害提高33%',
        'RRRB': '我方全體造成的物理傷害提高33%',
        'RRRP': '我方全體造成的混響傷害提高33%',
        'RYYY': '我方全體造成的電磁傷害提高33%',
        'YYYB': '我方全體造成的負能傷害提高33%',
        'YYYP': '每秒獲得0.33費用',
        'RBBB': '我方全體造成的冰凍傷害提高33%',
        'YBBB': '所有藍卡所需費用-2',
        'BBBP': '打出藍卡後，我方全體防禦力+0.5%，上限50%',
        'RPPP': '【暗藝】/【至暗時刻】傷害提高50%',
        'YPPP': '我方全體【使魔】造成的傷害提高50%',
        'BPPP': '【新星】/【元素新星】/【超新星】傷害提高50%',
        'RRYB': '我方全體【普通攻擊】傷害提高50%', // KEY 修正 (原 RRBY)
        'RRYP': '我方全體【普通攻擊】有15%機率觸發【點燃】',
        'RRBP': '對處於【凍結】/【冰封】狀態下的敵方，【斬裂】額外觸發1次',
        'RYYB': '我方全體5費及以上的技能牌所需費用-2', // KEY 修正 (原 RBYY)
        'RYYP': '我方全體【普通攻擊】有15%機率觸發【引雷】',
        'YYBP': '我方全體【霸體】/【隱形】/【無敵】的持續時間延長2秒',
        'RYBB': '我方【護盾】的持續時間延長20秒', // KEY 修正 (原 RBBY)
        'RBBP': '我方全體【普通攻擊】有15%機率觸發【凍結】',
        'YBBP': '我方【護盾】消失或引爆時，回復持有者15%生命值',
        'RYPP': '我方全體【波】/【蝕滅】/【裂蝕】造成的傷害提高50%',
        'RBPP': '我方全體免疫【混亂】/【束縛】/【禁錮】/【詛咒】/【昏睡】/【變萌】',
        'YBPP': '【棄牌】指令冷卻時間縮短5秒'
    };
    
    updateEffectDisplay();
    switchTab('combination-query');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            switchTab(tabId);
        });
    });

    function switchTab(tabId) {
        tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.tab === tabId) {
                button.classList.add('active');
            }
        });

        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });

        if (tabId === 'unrecorded') {
            displayUnrecordedCombinations();
        } else if (tabId === 'recorded') {
            displayRecordedCombinations();
        }
    }

    gemOptions.forEach(option => {
        option.addEventListener('click', (event) => {
            const gemType = event.target.dataset.gem;
            addGemToSlot(gemType);
        });
    });

    gemSlots.forEach(slot => {
        slot.addEventListener('click', (event) => {
            const index = parseInt(slot.dataset.index);
            removeGemFromSlot(index);
        });
    });

    function addGemToSlot(gemType) {
        const emptySlotIndex = currentGems.findIndex(gem => gem === null);
        if (emptySlotIndex !== -1) {
            currentGems[emptySlotIndex] = gemType;
            renderGems();
            updateEffectDisplay();
        }
    }

    function removeGemFromSlot(index) {
        if (currentGems[index] !== null) {
            currentGems[index] = null;
            for (let i = index; i < currentGems.length - 1; i++) {
                currentGems[i] = currentGems[i + 1];
            }
            currentGems[currentGems.length - 1] = null;
            renderGems();
            updateEffectDisplay();
        }
    }

    function renderGems() {
        gemSlots.forEach((slot, index) => {
            slot.innerHTML = '';
            if (currentGems[index]) {
                const img = document.createElement('img');
                img.src = `images/${currentGems[index]}.png`;
                img.alt = `${currentGems[index]}寶石`;
                slot.appendChild(img);
            }
        });
        updateRecordButtonState();
    }

    function updateRecordButtonState() {
        const filledGems = currentGems.filter(gem => gem !== null);
        if (filledGems.length === 4) {
            const sortedCurrentGems = getSortedGemsString(filledGems);
            const isRecorded = recordedCombinations.has(sortedCurrentGems);

            recordCombinationBtn.style.display = 'block';
            recordCombinationBtn.textContent = isRecorded ? '已記錄' : '未記錄';
            recordCombinationBtn.classList.toggle('recorded', isRecorded);
            recordCombinationBtn.classList.toggle('unrecorded', !isRecorded);
            recordCombinationBtn.onclick = () => toggleRecordState(sortedCurrentGems);
        } else {
            recordCombinationBtn.style.display = 'none';
        }
    }

    function toggleRecordState(sortedGemsString) {
        if (recordedCombinations.has(sortedGemsString)) {
            recordedCombinations.delete(sortedGemsString);
        } else {
            recordedCombinations.add(sortedGemsString);
        }
        localStorage.setItem('recordedCombinations', JSON.stringify(Array.from(recordedCombinations)));
        
        displayUnrecordedCombinations();
        displayRecordedCombinations();
        updateRecordButtonState();
    }

    function applyTermColors(text) {
        let coloredText = text;
        for (const term in termColors) {
            const regex = new RegExp(`(?<!<span class=".*">)【${term}】`, 'g');
            coloredText = coloredText.replace(regex, `<span class="${termColors[term]}">【${term}】</span>`);
        }
        return coloredText;
    }

    function updateEffectDisplay() {
        effectDisplay.classList.remove('show');
        effectDisplay.innerHTML = '';

        setTimeout(() => {
            const effects = calculateEffects(currentGems);
            if (effects.length === 0) {
                effectDisplay.innerHTML = '無效果';
            } else {
                effectDisplay.innerHTML = effects.map(effectData => {
                    const { text, prefixColorClass } = effectData;
                    const match = text.match(/^【([^】]+?)】(.*)$/);
                    let nameHtml = '';
                    let descriptionHtml = '';

                    if (match) {
                        const name = match[1];
                        const description = match[2];

                        if (['血盟', '窺兆', '靜域', '幽冥'].includes(name)) {
                             nameHtml = `<span class="${prefixColorClass}">【${name}】</span>`;
                        } else {
                            nameHtml = `<span class="effect-name-green">【${name}】</span>`;
                        }
                        descriptionHtml = `<span class="effect-description-white">${applyTermColors(description)}</span>`;

                        return nameHtml + descriptionHtml;

                    } else if (text.startsWith('【') && text.endsWith('】')) {
                        return `<span class="effect-name-green">${text}</span>`;
                    } else {
                        return `<span class="effect-description-white">${applyTermColors(text)}</span>`;
                    }
                }).join('<br>');
            }
            effectDisplay.classList.add('show');
        }, 100);
    }
    
    function calculateEffects(gems) {
        const filledGems = gems.filter(gem => gem !== null);
        const gemCounts = {};
        filledGems.forEach(gem => {
            gemCounts[gem] = (gemCounts[gem] || 0) + 1;
        });

        const numFilled = filledGems.length;
        const effects = [];

        if (numFilled < 4) {
            const pushEffect = (gemType, baseName, baseDescription, valueKey, baseValue) => {
                if (gemCounts[gemType]) {
                    let currentDescription = baseDescription;
                    let currentValue = baseValue * gemCounts[gemType];
                    let prefixColorClass = 'effect-prefix-white';

                    if (gemCounts[gemType] === 2) {
                        prefixColorClass = 'effect-prefix-green';
                    } else if (gemCounts[gemType] >= 3) {
                        prefixColorClass = 'effect-prefix-orange';
                    }

                    if (valueKey === 'damage') {
                        currentDescription = baseDescription.replace('10%', `${currentValue}%`);
                    } else if (valueKey === 'cost') {
                        currentValue = Math.round(currentValue * 100) / 100;
                        currentDescription = baseDescription.replace('0.33', `${currentValue}`);
                    } else if (valueKey === 'heal') {
                        currentDescription = baseDescription.replace('5%', `${currentValue}%`);
                    }

                    effects.push({ text: `【${baseName}】${currentDescription}`, prefixColorClass });
                }
            };

            pushEffect('R', '血盟', '所有紅卡傷害提高10%', 'damage', 10);
            pushEffect('Y', '窺兆', '打出黃卡後，獲得0.33點費用', 'cost', 0.33);
            pushEffect('B', '靜域', '打出藍卡後，回復生命值最低的1名我方5%生命值', 'heal', 5);
            pushEffect('P', '幽冥', '所有紫卡傷害提高10%', 'damage', 10);

        } else {
            const sortedCurrentGemsString = getSortedGemsString(filledGems);
            const foundCombination = combinationMap.get(sortedCurrentGemsString);

            if (foundCombination) {
                 const description = combinationDescriptions[foundCombination.sortedGems] || '';
                 effects.push({ text: `【${foundCombination.name}】${description}`, prefixColorClass: 'effect-name-green'});
            }
        }
        return effects;
    }

    function getVisualGemsForCombinationCard(gemsArray) {
        const gemCounts = {};
        gemsArray.forEach(gem => { gemCounts[gem] = (gemCounts[gem] || 0) + 1; });

        const uniqueGemTypes = Object.keys(gemCounts).length;
        const visualGems = Array(4).fill(null);

        const sortedGemTypesByCount = Object.keys(gemCounts).sort((a, b) => {
            if (gemCounts[a] !== gemCounts[b]) {
                return gemCounts[b] - gemCounts[a];
            }
            return gemOrder[a] - gemOrder[b];
        });

        if (uniqueGemTypes === 4) {
            visualGems[0] = 'R';
            visualGems[1] = 'Y';
            visualGems[2] = 'B';
            visualGems[3] = 'P';
        } else if (uniqueGemTypes === 1) {
            const gemType = gemsArray[0];
            visualGems[0] = gemType;
            visualGems[1] = gemType;
            visualGems[2] = gemType;
            visualGems[3] = gemType;
        } else if (uniqueGemTypes === 2 && gemCounts[sortedGemTypesByCount[0]] === 3) {
            const threeGem = sortedGemTypesByCount[0];
            const oneGem = sortedGemTypesByCount[1];

            visualGems[0] = threeGem;
            visualGems[1] = threeGem;
            visualGems[2] = threeGem;
            visualGems[3] = oneGem;
        } else if (uniqueGemTypes === 2 && gemCounts[sortedGemTypesByCount[0]] === 2 && gemCounts[sortedGemTypesByCount[1]] === 2) {
            const gemA = sortedGemTypesByCount[0];
            const gemB = sortedGemTypesByCount[1];

            visualGems[0] = gemA;
            visualGems[1] = gemA;
            visualGems[2] = gemB;
            visualGems[3] = gemB;
        } else if (uniqueGemTypes === 3 && gemCounts[sortedGemTypesByCount[0]] === 2) {
            const twoGem = sortedGemTypesByCount[0];
            const oneGem1 = sortedGemTypesByCount[1];
            const oneGem2 = sortedGemTypesByCount[2];

            visualGems[0] = twoGem;
            visualGems[1] = twoGem;
            visualGems[2] = oneGem1;
            visualGems[3] = oneGem2;
        }
        return visualGems.filter(gem => gem !== null);
    }

    function createCombinationCard(originalGems, name, description, isRecorded) {
        const card = document.createElement('div');
        card.classList.add('combination-card');

        const contentWrapper = document.createElement('div');
        contentWrapper.classList.add('combination-content-wrapper');

        const gemCircle = document.createElement('div');
        gemCircle.classList.add('recorded-gem-circle');

        const visualGems = getVisualGemsForCombinationCard(originalGems);

        const positions = ['top', 'right', 'bottom', 'left'];
        visualGems.forEach((gemType, index) => {
            const img = document.createElement('img');
            img.src = `images/${gemType}.png`;
            img.alt = `${gemType}寶石`;
            img.classList.add(`gem-${positions[index]}`);
            gemCircle.appendChild(img);
        });


        const nameElement = document.createElement('div');
        nameElement.classList.add('recorded-combination-text');
        nameElement.textContent = name;

        const descriptionElement = document.createElement('div');
        descriptionElement.classList.add('combination-description');
        descriptionElement.innerHTML = applyTermColors(description);

        contentWrapper.appendChild(gemCircle);
        contentWrapper.appendChild(nameElement);
        contentWrapper.appendChild(descriptionElement);
        card.appendChild(contentWrapper);
        
        const sortedGemsString = getSortedGemsString(originalGems);

        if (!isRecorded) {
            const recordButton = document.createElement('button');
            recordButton.classList.add('record-button');
            recordButton.textContent = '記錄';
            recordButton.addEventListener('click', () => {
                // 觸發淡出動畫
                card.classList.add('card-fading-out');
                
                // 延遲0.3秒後再更新列表
                setTimeout(() => {
                    recordedCombinations.add(sortedGemsString);
                    localStorage.setItem('recordedCombinations', JSON.stringify(Array.from(recordedCombinations)));
                    displayUnrecordedCombinations();
                    displayRecordedCombinations();
                    updateRecordButtonState();
                }, 300);
            });
            card.appendChild(recordButton);
        } else {
            const cancelButton = document.createElement('button');
            cancelButton.classList.add('cancel-record-button');
            cancelButton.textContent = '取消記錄';
            cancelButton.addEventListener('click', () => {
                // 觸發淡出動畫
                card.classList.add('card-fading-out');

                // 延遲0.3秒後再更新列表
                setTimeout(() => {
                    recordedCombinations.delete(sortedGemsString);
                    localStorage.setItem('recordedCombinations', JSON.stringify(Array.from(recordedCombinations)));
                    displayUnrecordedCombinations();
                    displayRecordedCombinations();
                    updateRecordButtonState();
                }, 300);
            });
            card.appendChild(cancelButton);
        }

        return card;
    }


    function displayUnrecordedCombinations() {
        unrecordedCombinationsGrid.innerHTML = '';
        const unrecorded = allPossibleCombinations.filter(combo => !recordedCombinations.has(combo.sortedGems));
        unrecorded.forEach(combo => {
            const description = combinationDescriptions[combo.sortedGems] || '';
            const card = createCombinationCard(combo.gems, combo.name, description, false);
            unrecordedCombinationsGrid.appendChild(card);
        });
    }

    function displayRecordedCombinations() {
        recordedCombinationsGrid.innerHTML = '';
        const recorded = allPossibleCombinations.filter(combo => recordedCombinations.has(combo.sortedGems));
        recorded.forEach(combo => {
            const description = combinationDescriptions[combo.sortedGems] || '';
            const card = createCombinationCard(combo.gems, combo.name, description, true);
            recordedCombinationsGrid.appendChild(card);
        });
    }

    renderGems();
});