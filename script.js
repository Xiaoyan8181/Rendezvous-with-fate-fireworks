document.addEventListener('DOMContentLoaded', () => {
    const gemSlots = document.querySelectorAll('.gem-slot');
    const gemOptions = document.querySelectorAll('.gem-option');
    const effectDisplay = document.getElementById('effect-display');

    let currentGems = Array(4).fill(null); // 用於儲存當前槽位中的寶石，null 表示空

    // 定義詞條及其對應的顏色類別
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

    // 初始化顯示效果
    updateEffectDisplay();

    // 點擊寶石選項
    gemOptions.forEach(option => {
        option.addEventListener('click', (event) => {
            const gemType = event.target.dataset.gem;
            addGemToSlot(gemType);
        });
    });

    // 點擊寶石槽位
    gemSlots.forEach(slot => {
        slot.addEventListener('click', (event) => {
            const index = parseInt(slot.dataset.index);
            removeGemFromSlot(index);
        });
    });

    // 將寶石添加到空位
    function addGemToSlot(gemType) {
        const emptySlotIndex = currentGems.findIndex(gem => gem === null);
        if (emptySlotIndex !== -1) {
            currentGems[emptySlotIndex] = gemType;
            renderGems();
            updateEffectDisplay();
        }
    }

    // 從空位中移除寶石
    function removeGemFromSlot(index) {
        if (currentGems[index] !== null) {
            currentGems[index] = null;
            // 將後面的寶石往前移，保持從左到右排列
            for (let i = index; i < currentGems.length - 1; i++) {
                currentGems[i] = currentGems[i + 1];
            }
            currentGems[currentGems.length - 1] = null; // 最後一個位置設為空
            renderGems();
            updateEffectDisplay();
        }
    }

    // 渲染寶石到頁面上
    function renderGems() {
        gemSlots.forEach((slot, index) => {
            slot.innerHTML = ''; // 清空槽位
            if (currentGems[index]) {
                const img = document.createElement('img');
                img.src = `images/${currentGems[index]}.png`; // 修改圖片路徑
                img.alt = `${currentGems[index]}寶石`;
                slot.appendChild(img);
            }
        });
    }

    // 將詞條加上顏色樣式
    function applyTermColors(text) {
        let coloredText = text;
        for (const term in termColors) {
            // 使用正則表達式進行全局替換，並處理可能出現的特殊字符
            // 這裡使用 lookbehind 來確保只匹配【term】而不是其他包含term的字串
            const regex = new RegExp(`(?<!<span class=".*">)【${term}】`, 'g');
            coloredText = coloredText.replace(regex, `<span class="${termColors[term]}">【${term}】</span>`);
        }
        return coloredText;
    }

    // 更新效果顯示
    function updateEffectDisplay() {
        // 先移除舊的顯示，讓動畫重新觸發
        effectDisplay.classList.remove('show');
        effectDisplay.innerHTML = '';

        setTimeout(() => { // 稍微延遲以確保動畫重置
            const effects = calculateEffects(currentGems);
            if (effects.length === 0) {
                effectDisplay.innerHTML = '無效果';
            } else {
                effectDisplay.innerHTML = effects.map(effectData => {
                    const { text, prefixColorClass } = effectData;
                    // 統一解析格式：【名稱】描述 或 【名稱】 (如果沒有描述)
                    const match = text.match(/^【([^】]+?)】(.*)$/);
                    let name = '';
                    let description = '';
                    let nameHtml = '';
                    let descriptionHtml = '';

                    if (match) {
                        name = match[1]; // 提取括號內的名稱
                        description = match[2]; // 提取括號後的描述

                        // 未滿4個寶石的單一效果名稱，使用動態前綴顏色
                        if (['血盟', '窺兆', '靜域', '幽冥'].includes(name)) {
                             nameHtml = `<span class="${prefixColorClass}">【${name}】</span>`;
                        } else {
                            // 其他滿4個寶石的組合名稱維持綠色
                            nameHtml = `<span class="effect-name-green">【${name}】</span>`;
                        }
                        descriptionHtml = `<span class="effect-description-white">${applyTermColors(description)}</span>`;

                        return nameHtml + descriptionHtml;

                    } else if (text.startsWith('【') && text.endsWith('】')) {
                        // 這是單純的組合名稱，例如【極彩輝煌】或【月映星輝】，沒有後續描述
                        return `<span class="effect-name-green">${text}</span>`;
                    } else {
                        // 理論上這個分支不應該再被觸發，因為所有效果都應該有【】前綴或被併入前一個
                        return `<span class="effect-description-white">${applyTermColors(text)}</span>`;
                    }
                }).join('<br>'); // 每個效果之間用 <br> 分隔
            }
            effectDisplay.classList.add('show');
        }, 100); // 短暫延遲
    }

    // 計算寶石組合效果
    function calculateEffects(gems) {
        const filledGems = gems.filter(gem => gem !== null);
        const gemCounts = {};
        filledGems.forEach(gem => {
            gemCounts[gem] = (gemCounts[gem] || 0) + 1;
        });

        const numFilled = filledGems.length;
        const effects = [];

        if (numFilled < 4) {
            // 寶石未滿4個，疊加處理
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

                    // 確保返回的文本是 【名稱】描述 的統一格式
                    effects.push({ text: `【${baseName}】${currentDescription}`, prefixColorClass });
                }
            };

            pushEffect('R', '血盟', '所有紅卡傷害提高10%', 'damage', 10);
            pushEffect('Y', '窺兆', '打出黃卡後，獲得0.33點費用', 'cost', 0.33);
            pushEffect('B', '靜域', '打出藍卡後，回復生命值最低的1名我方5%生命值', 'heal', 5);
            pushEffect('P', '幽冥', '所有紫卡傷害提高10%', 'damage', 10);

        } else {
            // 寶石滿4個
            const uniqueGemTypes = Object.keys(gemCounts).length;
            const sortedCounts = Object.values(gemCounts).sort((a, b) => b - a);

            // 輔助函式，統一推送格式
            const addCombinationEffect = (name, description = '') => {
                // 如果是第二行的描述，name會是空字串，我們不加【】
                const displayText = name ? `【${name}】${description}` : description;
                effects.push({ text: displayText, prefixColorClass: 'effect-name-green' });
            };

            if (uniqueGemTypes === 4) {
                // 4色各1
                addCombinationEffect('皇家聖焰', '我方全體所有機率觸發機制機率+10%');
            } else if (uniqueGemTypes === 1) {
                // 4個同色
                const type = filledGems[0];
                addCombinationEffect('極彩輝煌'); // 主名稱，無描述
                if (type === 'R') addCombinationEffect('', '所有紅卡所需費用-1'); // 描述
                else if (type === 'Y') addCombinationEffect('', '手牌上限+3張');
                else if (type === 'B') addCombinationEffect('', '打出藍卡後，我方全體攻擊力+0.5%，上限50%');
                else if (type === 'P') addCombinationEffect('', '所有紫卡所需費用-1');
            } else if (uniqueGemTypes === 2 && sortedCounts[0] === 3) {
                // 3個同色1個不同色
                const threeGem = Object.keys(gemCounts).find(gem => gemCounts[gem] === 3);
                const oneGem = Object.keys(gemCounts).find(gem => gemCounts[gem] === 1);
                addCombinationEffect('月映星輝'); // 主名稱，無描述

                if (threeGem === 'R') {
                    if (oneGem === 'Y') addCombinationEffect('', '我方全體造成的火焰傷害提高33%');
                    else if (oneGem === 'B') addCombinationEffect('', '我方全體造成的物理傷害提高33%');
                    else if (oneGem === 'P') addCombinationEffect('', '我方全體造成的混響傷害提高33%');
                } else if (threeGem === 'Y') {
                    if (oneGem === 'R') addCombinationEffect('', '我方全體造成的電磁傷害提高33%');
                    else if (oneGem === 'B') addCombinationEffect('', '我方全體造成的負能傷害提高33%');
                    else if (oneGem === 'P') addCombinationEffect('', '每秒獲得0.33費用');
                } else if (threeGem === 'B') {
                    if (oneGem === 'R') addCombinationEffect('', '我方全體造成的冰凍傷害提高33%');
                    else if (oneGem === 'Y') addCombinationEffect('', '所有藍卡所需費用-2');
                    else if (oneGem === 'P') addCombinationEffect('', '打出藍卡後，我方全體防禦力+0.5%，上限50%');
                } else if (threeGem === 'P') {
                    if (oneGem === 'R') addCombinationEffect('', '【暗藝】/【至暗時刻】傷害提高50%');
                    else if (oneGem === 'Y') addCombinationEffect('', '我方全體【使魔】造成的傷害提高50%');
                    else if (oneGem === 'B') addCombinationEffect('', '【新星】/【元素新星】/【超新星】傷害提高50%');
                }
            } else if (uniqueGemTypes === 3 && sortedCounts[0] === 2) {
                // 2個同色剩下2個皆不同色 (2+1+1)
                const twoGem = Object.keys(gemCounts).find(gem => gemCounts[gem] === 2);
                const oneGems = Object.keys(gemCounts).filter(gem => gemCounts[gem] === 1).sort();
                addCombinationEffect('星屑幽光'); // 主名稱，無描述

                const combination = twoGem + oneGems.join('');

                switch (combination) {
                    case 'RBY':
                    case 'RYB':
                        addCombinationEffect('', '我方全體【普通攻擊】傷害提高50%');
                        break;
                    case 'RPY':
                    case 'RYP':
                        addCombinationEffect('', '我方全體【普通攻擊】有15%機率觸發【點燃】');
                        break;
                    case 'RBP':
                    case 'RPB':
                        addCombinationEffect('', '對處於【凍結】/【冰封】狀態下的敵方，【斬裂】額外觸發1次');
                        break;
                    case 'YRB':
                    case 'YBR':
                        addCombinationEffect('', '我方全體5費及以上的技能牌所需費用-2');
                        break;
                    case 'YRP':
                    case 'YPR':
                        addCombinationEffect('', '我方全體【普通攻擊】有15%機率觸發【引雷】');
                        break;
                    case 'YBP':
                    case 'YPB':
                        addCombinationEffect('', '我方全體【霸體】/【隱形】/【無敵】的持續時間延長2秒');
                        break;
                    case 'BRY':
                    case 'BYR':
                        addCombinationEffect('', '我方【護盾】的持續時間延長20秒');
                        break;
                    case 'BRP':
                    case 'BPR':
                        addCombinationEffect('', '我方全體【普通攻擊】有15%機率觸發【凍結】');
                        break;
                    case 'BYP':
                    case 'BPY':
                        addCombinationEffect('', '我方【護盾】消失或引爆時，回復持有者15%生命值');
                        break;
                    case 'PRY':
                    case 'PYR':
                        addCombinationEffect('', '我方全體【波】/【蝕滅】/【裂蝕】造成的傷害提高50%');
                        break;
                    case 'PRB':
                    case 'PBR':
                        addCombinationEffect('', '我方全體免疫【混亂】/【束縛】/【禁錮】/【詛咒】/【昏睡】/【變萌】');
                        break;
                    case 'PYB':
                    case 'PBY':
                        addCombinationEffect('', '【棄牌】指令冷卻時間縮短5秒');
                        break;
                }

            } else if (uniqueGemTypes === 2 && sortedCounts[0] === 2 && sortedCounts[1] === 2) {
                // 2組同色 (2+2)
                const [gem1, gem2] = Object.keys(gemCounts).sort(); // 確保字母順序
                addCombinationEffect('二重幻華'); // 主名稱，無描述

                const combination = gem1 + gem2; // ombination 總是按字母順序
                switch (combination) {
                    case 'BR':
                        addCombinationEffect('', '我方全體【爆炸物】/【機械單位】造成的傷害提高50%');
                        break;
                    case 'PR':
                        addCombinationEffect('', '我方全體造成的最終傷害提高25%');
                        break;
                    case 'RY':
                        addCombinationEffect('', '每10秒觸發1次，從牌庫或棄牌區將1張紅卡加入手牌');
                        break;
                    case 'BY':
                        addCombinationEffect('', '每10秒觸發1次，從牌庫或棄牌區將1張藍卡加入手牌');
                        break;
                    case 'PY':
                        addCombinationEffect('', '手牌補充冷卻時間縮短1秒');
                        break;
                    case 'BP':
                        addCombinationEffect('', '我方全體受到的最終傷害降低25%');
                        break;
                }
            }
        }
        return effects;
    }
});
