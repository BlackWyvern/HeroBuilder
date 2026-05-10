// aesica-translator.js
// Standalone Bridge for Aesica & Balaknight URLs

window.AesicaTranslator = (function() {
    
    // --- 1. AESICA'S EXACT MATH (BASE 61) ---
    function urlCodeToNum(charStr) {
        if (!charStr) return 0;
        let charCode = charStr.charCodeAt(0);
        if (charCode >= 48 && charCode <= 57) return charCode - 48; // 0-9
        if (charCode >= 65 && charCode <= 90) return charCode - 55; // A-Z
        if (charCode >= 97 && charCode <= 122) return charCode - 61; // a-z
        return 0;
    }

    function urlCodeToNum2(str) { 
        if (!str || str.length < 2) return 0;
        return urlCodeToNum(str[0]) * 61 + urlCodeToNum(str[1]); 
    }

    function urlCodeToNum4(str) { 
        if (!str || str.length < 4) return 0;
        return urlCodeToNum(str[0]) * 226981 + urlCodeToNum(str[1]) * 3721 + urlCodeToNum(str[2]) * 61 + urlCodeToNum(str[3]); 
    }

    // --- 2. THE DICTIONARY BUILDER ---
    window.Aesica = window.Aesica || {};
    window.Aesica.dataHarness = window.Aesica.dataHarness || {};
    window.numToUrlCode = function(num) {
        let charCode = 0; num = +num || 0;
        if (num >= 0 && num <= 9) charCode = num + 48; 
        else if (num >= 10 && num <= 35) charCode = num + 55; 
        else if (num >= 36 && num <= 61) charCode = num + 61; 
        return String.fromCharCode(charCode);
    };

    let powerMap = null;

    function buildDictionary() {
        if (typeof HCData === 'undefined' || !HCData.power) return null;
        let map = {};
        for (let i = 0; i < HCData.power.length; i++) {
            let hp = HCData.power[i];
            let fw = window.numToUrlCode(hp.framework);
            let pId = window.numToUrlCode(hp.power !== undefined ? hp.power : (hp.id !== undefined ? hp.id : i));
            
            if (typeof hp.code === 'function') {
                try { map[hp.code()] = hp; continue; } catch(e) {}
            }
            map[fw + pId] = hp;
        }
        return map;
    }

    function getFrameworkName(fwId) {
        if (!HCData.framework) return null;
        let fwList = Array.isArray(HCData.framework[0]) ? HCData.framework[0] : HCData.framework;
        let fwObj = fwList.find(f => f.id === fwId);
        return fwObj ? fwObj.name : null;
    }

    // --- 3. THE DECODER ENGINE ---
    return {
        decode: function(urlString) {
            if (!powerMap) powerMap = buildDictionary();
            if (!powerMap) {
                console.error("AesicaTranslator: HCData.js is missing or not loaded.");
                return null;
            }

            let url;
            try { url = new URL(urlString); } catch(e) { return null; }
            let d = url.searchParams.get('d');
            if (!d) return null;

            d = d.split('');
            let i = 0;

            let plainTextBuild = {
                stats: { primary: null, sec1: null, sec2: null },
                powers: [], 
                specs: { primary: null, sec1: null, sec2: null, mastery: null, perks: [] },
                devices: [null, null, null, null, null],
                role: null
            };

            const aesicaStats = {
                1: "Strength", 2: "Dexterity", 3: "Constitution", 4: "Intelligence", 
                5: "Ego", 6: "Presence", 7: "Recovery", 8: "Endurance"
            };

            // STATS
            let archetype = urlCodeToNum(d[i++]);
            plainTextBuild.stats.primary = aesicaStats[urlCodeToNum(d[i++])] || null;
            plainTextBuild.stats.sec1 = aesicaStats[urlCodeToNum(d[i++])] || null;
            plainTextBuild.stats.sec2 = aesicaStats[urlCodeToNum(d[i++])] || null;

            let innate = urlCodeToNum2(d[i++] + d[i++]);
            for(let t=0; t<6; t++) i++; // Skip Talents
            for(let tp=0; tp<2; tp++) i += 3; // Skip Travel Powers

            // POWERS & ADVANTAGES
            for(let p=0; p<14; p++) {
                let fwCodeChar = d[i++];
                let pIdxCodeChar = d[i++];
                let m1 = d[i++];
                let m2 = d[i++];

                let targetCode = fwCodeChar + pIdxCodeChar;
                let pMask = urlCodeToNum2(m1 + m2) << 1; 

                let aesicaPower = powerMap[targetCode];

                if (aesicaPower && aesicaPower.name) {
                    let powerData = {
                        name: aesicaPower.name,
                        setName: getFrameworkName(aesicaPower.framework),
                        advantages: []
                    };

                    if (pMask > 0 && aesicaPower.advantageList) {
                        for (let bit = 1; bit < aesicaPower.advantageList.length; bit++) { 
                            let test = Math.pow(2, bit);
                            if ((pMask & test) === test) { 
                                let aesicaAdv = aesicaPower.advantageList[bit];
                                if (aesicaAdv && aesicaAdv.name) {
                                    powerData.advantages.push(aesicaAdv.name);
                                }
                            }
                        }
                    }
                    plainTextBuild.powers.push(powerData);
                }
            }

            // SPECIALIZATIONS
            let hcTreeList = HCData.specializationTree || HCData.specialization || HCData.tree || HCData.specializations;
            if (hcTreeList) {
                let specBlocks = [];
                for(let s=1; s<=3; s++) {
                    specBlocks.push(urlCodeToNum4(d[i++] + d[i++] + d[i++] + d[i++]));
                }

                // Mastery Choice is stored in the lower 4 bits of the first Spec Block
                let masteryChoice = specBlocks[0] & 15; 

                for (let s=1; s<=3; s++) {
                    let specNum = specBlocks[s-1];
                    let allocations = specNum >> 4; // This bitmask holds the perk points
                    let treeName = null;

                    if (s === 1) {
                        // Primary tree always matches the primary stat
                        treeName = plainTextBuild.stats.primary;
                    } else {
                        // Secondary trees use the lower 4 bits
                        let treeID = specNum & 15;
                        if (treeID > 0) {
                            let foundTree = hcTreeList.find(t => t.id === treeID + 8) 
                                         || hcTreeList.find(t => t.id === treeID) 
                                         || hcTreeList[treeID + 8] 
                                         || hcTreeList[treeID];

                            if (foundTree) {
                                treeName = foundTree.name;
                            }
                        }
                    }

                    if (treeName) {
                        let treeKey = (s === 1) ? 'primary' : (s === 2) ? 'sec1' : 'sec2';
                        plainTextBuild.specs[treeKey] = treeName;

                        let aTree = hcTreeList.find(t => t.name && t.name.toLowerCase() === treeName.toLowerCase());
                        if (aTree && aTree.specializationList) {
                            
                            // Aesica's lists have exactly 8 standard perks (Indexes 0-7)
                            for (let pIdx = 0; pIdx < 8; pIdx++) {
                                let pts = (allocations >> (pIdx * 2)) & 3; // 2 bits per perk
                                if (pts > 0 && aTree.specializationList[pIdx]) {
                                    let perkItem = aTree.specializationList[pIdx];
                                    plainTextBuild.specs.perks.push({
                                        treeName: treeName,
                                        perkName: perkItem.name || perkItem.desc,
                                        points: pts
                                    });
                                }
                            }
                            
                            // Aesica's Mastery is always hardcoded to Index 8 in the array
                            let isMasteryHere = (masteryChoice === s);
                            if (isMasteryHere && aTree.specializationList[8]) {
                                let masteryPerk = aTree.specializationList[8];
                                plainTextBuild.specs.mastery = masteryPerk.name || masteryPerk.desc;
                            }
                        }
                    }
                }
            }

            // ROLE ALIGNMENT FIX
            // If the remaining URL length is an odd number, it means Aesica's 1-character Role ID 
            // is sitting right before the devices. We must read it so the device pairs align correctly.
            if ((d.length - i) % 2 !== 0) {
                let roleId = urlCodeToNum(d[i++]);
                if (HCData.archetypeGroup && HCData.archetypeGroup[roleId]) {
                    plainTextBuild.role = HCData.archetypeGroup[roleId].name;
                }
            }

            // DEVICES
            if (i < d.length) {
                for (let devIndex = 0; devIndex < 5; devIndex++) {
                    if (i + 1 < d.length) {
                        let extractedId = urlCodeToNum2(d[i++] + d[i++]);
                        
                        // Look up the exact array index (0 returns nothing, 1 returns Elixir, etc)
                        if (extractedId > 0 && HCData.device && HCData.device[extractedId]) {
                            plainTextBuild.devices[devIndex] = HCData.device[extractedId].name;
                        }
                    }
                }
            }

            console.log("AESICA TRANSLATOR OUTPUT:", plainTextBuild);
            return plainTextBuild;
        }
    };
})();