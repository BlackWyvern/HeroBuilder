// balak-translator.js
// Standalone Bridge using Balak's Math AND Balak's Dictionary (Double-shift Bug Removed)

window.BalakTranslator = (function() {
    
    function urlCodeToNum(charStr) {
        if (!charStr) return 0;
        let charCode = charStr.charCodeAt(0);
        if (charCode >= 48 && charCode <= 57) return charCode - 48; 
        if (charCode >= 65 && charCode <= 90) return charCode - 55; 
        if (charCode >= 97 && charCode <= 122) return charCode - 61; 
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

    window.numToUrlCode = function(num) {
        let charCode = 0; num = +num || 0;
        if (num >= 0 && num <= 9) charCode = num + 48; 
        else if (num >= 10 && num <= 35) charCode = num + 55; 
        else if (num >= 36 && num <= 61) charCode = num + 61; 
        return String.fromCharCode(charCode);
    };

    let phMap = null;

    // --- GRABS THE ROSETTA STONE DICTIONARY FROM powerhouse-data.js ---
    function buildPowerHouseMap() {
        let map = {};
        if (typeof getDataPower === 'function') {
            let phArray = getDataPower();
            for(let i = 0; i < phArray.length; i++) {
                let p = phArray[i];
                if (p && p.framework !== undefined && p.power !== undefined && p.name) {
                    let code = window.numToUrlCode(p.framework) + window.numToUrlCode(p.power);
                    map[code] = p; 
                }
            }
        } else {
            console.error("BalakTranslator: powerhouse-data.js is missing! It must be loaded in index.html");
        }
        return map;
    }

    return {
        decode: function(urlString) {
            if (!phMap) phMap = buildPowerHouseMap();

            let url;
            try { url = new URL(urlString); } catch(e) { return null; }
            let rawD = url.searchParams.get('d');
            if (!rawD) return null;

            // 1. STRIP THE INJECTED CHARACTERS
            let oldData = rawD.split('');
            let cleanData = [];
            for (let j = 0; j < oldData.length; j++) {
                if (j === 12 || j === 15) continue; 
                cleanData.push(oldData[j]);
            }
            
            let d = cleanData;
            let i = 0;

            let plainTextBuild = {
                stats: { primary: null, sec1: null, sec2: null },
                powers: [], 
                specs: { primary: null, sec1: null, sec2: null, mastery: null, perks: [] },
                devices: [null, null, null, null, null],
				talents: new Array(7).fill(null),
                role: null
            };

            const aesicaStats = { 1: "Strength", 2: "Dexterity", 3: "Constitution", 4: "Intelligence", 5: "Ego", 6: "Presence", 7: "Recovery", 8: "Endurance" };

            plainTextBuild.role = aesicaStats[urlCodeToNum(d[i++])]; 
            plainTextBuild.stats.primary = aesicaStats[urlCodeToNum(d[i++])] || null;
            plainTextBuild.stats.sec1 = aesicaStats[urlCodeToNum(d[i++])] || null;
            plainTextBuild.stats.sec2 = aesicaStats[urlCodeToNum(d[i++])] || null;

            let innateCode1 = d[i++];
            let innateCode2 = d[i++];
            let innate = urlCodeToNum2(innateCode1 + innateCode2);

            // Balak's original index fix shifts
            if (innate == 57) innate = 36;
            else if (innate == 51) innate = 50;
            else if (innate == 50) innate = 51;
            else if (innate == 36) innate = 57;

            // Map the innate choice to slot 0
            if (innate > 0 && typeof CO_TALENTS !== 'undefined') {
                let innateObj = CO_TALENTS.filter(x => x.type === "innate")[innate - 1];
                if (innateObj) plainTextBuild.talents[0] = innateObj.id;
            }

            // Read the 6 progressive choices directly from the URL stream
            for(let t=0; t<6; t++) {
                let progIdx = urlCodeToNum(d[i++]);
                if (progIdx > 0 && typeof CO_TALENTS !== 'undefined') {
                    let progObj = CO_TALENTS.filter(x => x.type === "progressive")[progIdx - 1];
                    if (progObj) plainTextBuild.talents[t + 1] = progObj.id;
                }
            }
            
            for(let tp=0; tp<4; tp++) i++; // Skip Travel Powers

            // POWERS
            for(let p=0; p<14; p++) {
                let fwChar = d[i++];
                let pIdChar = d[i++];
                let m1 = d[i++];
                let m2 = d[i++];

                let framework = urlCodeToNum(fwChar);
                let power = urlCodeToNum(pIdChar);
                let pMask = urlCodeToNum2(m1 + m2) << 1; 

                // 2. THE NEWEST MASSIVE BALAK REMAP (v1.2.5 powerhouse.js)
                if (framework == 1 && power == 2) { framework = 1; power = 3; } else if (framework == 1 && power == 3) { framework = 1; power = 2; } else if (framework == 1 && power == 13) { framework = 1; power = 15; } else if (framework == 1 && power == 14) { framework = 1; power = 16; } else if (framework == 1 && power == 15) { framework = 1; power = 13; } else if (framework == 1 && power == 16) { framework = 1; power = 17; } else if (framework == 1 && power == 17) { framework = 1; power = 18; } else if (framework == 1 && power == 18) { framework = 1; power = 14; } else if (framework == 1 && power == 30) { framework = 1; power = 31; } else if (framework == 1 && power == 31) { framework = 1; power = 30; } else if (framework == 2 && power == 2) { framework = 2; power = 5; } else if (framework == 2 && power == 3) { framework = 2; power = 2; } else if (framework == 2 && power == 5) { framework = 2; power = 3; } else if (framework == 2 && power == 6) { framework = 2; power = 7; } else if (framework == 2 && power == 7) { framework = 2; power = 6; } else if (framework == 2 && power == 14) { framework = 2; power = 15; } else if (framework == 2 && power == 15) { framework = 2; power = 14; } else if (framework == 2 && power == 16) { framework = 2; power = 17; } else if (framework == 2 && power == 17) { framework = 2; power = 16; } else if (framework == 2 && power == 18) { framework = 2; power = 20; } else if (framework == 2 && power == 19) { framework = 2; power = 21; } else if (framework == 2 && power == 20) { framework = 2; power = 22; } else if (framework == 2 && power == 21) { framework = 2; power = 18; } else if (framework == 2 && power == 22) { framework = 2; power = 19; } else if (framework == 3 && power == 2) { framework = 3; power = 3; } else if (framework == 3 && power == 3) { framework = 3; power = 2; } else if (framework == 3 && power == 5) { framework = 3; power = 7; } else if (framework == 3 && power == 6) { framework = 3; power = 8; } else if (framework == 3 && power == 7) { framework = 3; power = 9; } else if (framework == 3 && power == 8) { framework = 3; power = 10; } else if (framework == 3 && power == 9) { framework = 3; power = 11; } else if (framework == 3 && power == 10) { framework = 3; power = 13; } else if (framework == 3 && power == 11) { framework = 3; power = 14; } else if (framework == 3 && power == 12) { framework = 3; power = 5; } else if (framework == 3 && power == 13) { framework = 3; power = 6; } else if (framework == 3 && power == 14) { framework = 3; power = 12; } else if (framework == 4 && power == 7) { framework = 4; power = 9; } else if (framework == 4 && power == 9) { framework = 4; power = 10; } else if (framework == 4 && power == 10) { framework = 4; power = 7; } else if (framework == 4 && power == 11) { framework = 4; power = 12; } else if (framework == 4 && power == 12) { framework = 4; power = 13; } else if (framework == 4 && power == 13) { framework = 4; power = 11; } else if (framework == 5 && power == 4) { framework = 5; power = 5; } else if (framework == 5 && power == 5) { framework = 5; power = 4; } else if (framework == 5 && power == 12) { framework = 5; power = 13; } else if (framework == 5 && power == 13) { framework = 5; power = 14; } else if (framework == 5 && power == 14) { framework = 5; power = 16; } else if (framework == 5 && power == 15) { framework = 5; power = 17; } else if (framework == 5 && power == 16) { framework = 5; power = 18; } else if (framework == 5 && power == 17) { framework = 5; power = 21; } else if (framework == 5 && power == 18) { framework = 5; power = 19; } else if (framework == 5 && power == 19) { framework = 5; power = 20; } else if (framework == 5 && power == 20) { framework = 5; power = 22; } else if (framework == 5 && power == 21) { framework = 5; power = 23; } else if (framework == 5 && power == 22) { framework = 5; power = 24; } else if (framework == 5 && power == 23) { framework = 5; power = 25; } else if (framework == 5 && power == 24) { framework = 5; power = 26; } else if (framework == 5 && power == 25) { framework = 5; power = 27; } else if (framework == 5 && power == 26) { framework = 5; power = 28; } else if (framework == 5 && power == 27) { framework = 5; power = 29; } else if (framework == 5 && power == 28) { framework = 5; power = 30; } else if (framework == 6 && power == 4) { framework = 6; power = 7; } else if (framework == 6 && power == 7) { framework = 6; power = 8; } else if (framework == 6 && power == 8) { framework = 6; power = 9; } else if (framework == 6 && power == 9) { framework = 6; power = 10; } else if (framework == 6 && power == 10) { framework = 6; power = 4; } else if (framework == 6 && power == 14) { framework = 6; power = 15; } else if (framework == 6 && power == 15) { framework = 6; power = 14; } else if (framework == 6 && power == 22) { framework = 6; power = 23; } else if (framework == 6 && power == 23) { framework = 6; power = 22; } else if (framework == 7 && power == 0) { framework = 9; power = 0; } else if (framework == 7 && power == 1) { framework = 9; power = 1; } else if (framework == 7 && power == 2) { framework = 9; power = 2; } else if (framework == 7 && power == 0) { framework = 9; power = 3; } else if (framework == 7 && power == 1) { framework = 9; power = 4; } else if (framework == 7 && power == 2) { framework = 9; power = 6; } else if (framework == 7 && power == 3) { framework = 9; power = 5; } else if (framework == 7 && power == 4) { framework = 9; power = 7; } else if (framework == 7 && power == 6) { framework = 9; power = 8; } else if (framework == 7 && power == 7) { framework = 9; power = 9; } else if (framework == 7 && power == 8) { framework = 9; power = 11; } else if (framework == 7 && power == 9) { framework = 9; power = 13; } else if (framework == 7 && power == 10) { framework = 9; power = 17; } else if (framework == 7 && power == 11) { framework = 9; power = 18; } else if (framework == 7 && power == 12) { framework = 9; power = 12; } else if (framework == 7 && power == 13) { framework = 9; power = 14; } else if (framework == 7 && power == 14) { framework = 9; power = 15; } else if (framework == 7 && power == 15) { framework = 9; power = 16; } else if (framework == 7 && power == 16) { framework = 9; power = 19; } else if (framework == 7 && power == 17) { framework = 9; power = 20; } else if (framework == 7 && power == 18) { framework = 7; power = 13; } else if (framework == 7 && power == 19) { framework = 9; power = 22; } else if (framework == 7 && power == 20) { framework = 9; power = 23; } else if (framework == 7 && power == 21) { framework = 9; power = 24; } else if (framework == 7 && power == 22) { framework = 9; power = 28; } else if (framework == 7 && power == 23) { framework = 9; power = 26; } else if (framework == 7 && power == 24) { framework = 9; power = 27; } else if (framework == 7 && power == 25) { framework = 9; power = 37; } else if (framework == 7 && power == 26) { framework = 9; power = 29; } else if (framework == 7 && power == 27) { framework = 9; power = 30; } else if (framework == 7 && power == 28) { framework = 9; power = 31; } else if (framework == 7 && power == 29) { framework = 9; power = 32; } else if (framework == 7 && power == 30) { framework = 9; power = 38; } else if (framework == 7 && power == 31) { framework = 9; power = 33; } else if (framework == 7 && power == 32) { framework = 9; power = 34; } else if (framework == 7 && power == 34) { framework = 9; power = 36; } else if (framework == 7 && power == 35) { framework = 9; power = 39; } else if (framework == 7 && power == 36) { framework = 9; power = 40; } else if (framework == 7 && power == 37) { framework = 9; power = 41; } else if (framework == 7 && power == 38) { framework = 9; power = 42; } else if (framework == 7 && power == 39) { framework = 9; power = 43; } else if (framework == 7 && power == 40) { framework = 9; power = 44; } else if (framework == 7 && power == 41) { framework = 9; power = 10; } else if (framework == 7 && power == 42) { framework = 9; power = 45; } else if (framework == 7 && power == 43) { framework = 7; power = 31; } else if (framework == 7 && power == 44) { framework = 7; power = 32; } else if (framework == 7 && power == 45) { framework = 7; power = 34; } else if (framework == 7 && power == 46) { framework = 7; power = 33; } else if (framework == 7 && power == 47) { framework = 7; power = 35; } else if (framework == 7 && power == 48) { framework = 7; power = 36; } else if (framework == 7 && power == 49) { framework = 7; power = 37; } else if (framework == 8 && power == 0) { framework = 7; power = 0; } else if (framework == 8 && power == 1) { framework = 7; power = 1; } else if (framework == 8 && power == 2) { framework = 7; power = 2; } else if (framework == 8 && power == 3) { framework = 7; power = 3; } else if (framework == 8 && power == 4) { framework = 7; power = 4; } else if (framework == 8 && power == 5) { framework = 7; power = 5; } else if (framework == 8 && power == 6) { framework = 7; power = 6; } else if (framework == 8 && power == 7) { framework = 7; power = 7; } else if (framework == 8 && power == 8) { framework = 7; power = 8; } else if (framework == 8 && power == 9) { framework = 7; power = 9; } else if (framework == 8 && power == 10) { framework = 7; power = 10; } else if (framework == 8 && power == 11) { framework = 7; power = 11; } else if (framework == 8 && power == 12) { framework = 7; power = 12; } else if (framework == 8 && power == 13) { framework = 8; power = 12; } else if (framework == 8 && power == 14) { framework = 7; power = 14; } else if (framework == 8 && power == 15) { framework = 7; power = 15; } else if (framework == 8 && power == 16) { framework = 7; power = 16; } else if (framework == 8 && power == 17) { framework = 7; power = 17; } else if (framework == 8 && power == 18) { framework = 7; power = 18; } else if (framework == 8 && power == 19) { framework = 7; power = 26; } else if (framework == 8 && power == 20) { framework = 7; power = 19; } else if (framework == 8 && power == 21) { framework = 7; power = 20; } else if (framework == 8 && power == 22) { framework = 7; power = 21; } else if (framework == 8 && power == 23) { framework = 7; power = 24; } else if (framework == 8 && power == 24) { framework = 7; power = 25; } else if (framework == 8 && power == 25) { framework = 7; power = 22; } else if (framework == 8 && power == 26) { framework = 7; power = 23; } else if (framework == 8 && power == 27) { framework = 7; power = 29; } else if (framework == 8 && power == 28) { framework = 7; power = 28; } else if (framework == 8 && power == 29) { framework = 7; power = 27; } else if (framework == 8 && power == 30) { framework = 7; power = 30; } else if (framework == 8 && power == 31) { framework = 8; power = 26; } else if (framework == 8 && power == 32) { framework = 8; power = 27; } else if (framework == 8 && power == 33) { framework = 8; power = 29; } else if (framework == 8 && power == 34) { framework = 8; power = 28; } else if (framework == 8 && power == 35) { framework = 8; power = 30; } else if (framework == 8 && power == 36) { framework = 8; power = 31; } else if (framework == 8 && power == 37) { framework = 8; power = 32; } else if (framework == 9 && power == 0) { framework = 8; power = 0; } else if (framework == 9 && power == 1) { framework = 8; power = 1; } else if (framework == 9 && power == 2) { framework = 8; power = 2; } else if (framework == 9 && power == 3) { framework = 8; power = 3; } else if (framework == 9 && power == 4) { framework = 8; power = 5; } else if (framework == 9 && power == 5) { framework = 8; power = 4; } else if (framework == 9 && power == 6) { framework = 8; power = 6; } else if (framework == 9 && power == 7) { framework = 8; power = 7; } else if (framework == 9 && power == 8) { framework = 8; power = 8; } else if (framework == 9 && power == 9) { framework = 8; power = 9; } else if (framework == 9 && power == 10) { framework = 8; power = 10; } else if (framework == 9 && power == 11) { framework = 8; power = 11; } else if (framework == 9 && power == 12) { framework = 9; power = 21; } else if (framework == 9 && power == 13) { framework = 8; power = 13; } else if (framework == 9 && power == 14) { framework = 8; power = 14; } else if (framework == 9 && power == 15) { framework = 8; power = 15; } else if (framework == 9 && power == 16) { framework = 8; power = 16; } else if (framework == 9 && power == 17) { framework = 8; power = 17; } else if (framework == 9 && power == 18) { framework = 8; power = 18; } else if (framework == 9 && power == 19) { framework = 8; power = 19; } else if (framework == 9 && power == 20) { framework = 8; power = 20; } else if (framework == 9 && power == 21) { framework = 8; power = 21; } else if (framework == 9 && power == 22) { framework = 8; power = 22; } else if (framework == 9 && power == 23) { framework = 8; power = 23; } else if (framework == 9 && power == 24) { framework = 8; power = 24; } else if (framework == 9 && power == 25) { framework = 8; power = 25; } else if (framework == 9 && power == 26) { framework = 9; power = 46; } else if (framework == 9 && power == 27) { framework = 9; power = 47; } else if (framework == 9 && power == 28) { framework = 9; power = 49; } else if (framework == 9 && power == 29) { framework = 9; power = 48; } else if (framework == 9 && power == 30) { framework = 9; power = 50; } else if (framework == 9 && power == 31) { framework = 9; power = 51; } else if (framework == 9 && power == 32) { framework = 9; power = 52; } else if (framework == 10 && power == 15) { framework = 10; power = 16; } else if (framework == 10 && power == 16) { framework = 10; power = 15; } else if (framework == 10 && power == 20) { framework = 10; power = 21; } else if (framework == 10 && power == 21) { framework = 10; power = 20; } else if (framework == 11 && power == 3) { framework = 11; power = 5; } else if (framework == 11 && power == 4) { framework = 11; power = 3; } else if (framework == 11 && power == 5) { framework = 11; power = 4; } else if (framework == 11 && power == 7) { framework = 11; power = 11; } else if (framework == 11 && power == 8) { framework = 11; power = 16; } else if (framework == 11 && power == 9) { framework = 11; power = 13; } else if (framework == 11 && power == 10) { framework = 11; power = 14; } else if (framework == 11 && power == 11) { framework = 11; power = 12; } else if (framework == 11 && power == 12) { framework = 11; power = 15; } else if (framework == 11 && power == 13) { framework = 11; power = 17; } else if (framework == 11 && power == 14) { framework = 11; power = 18; } else if (framework == 11 && power == 15) { framework = 11; power = 8; } else if (framework == 11 && power == 16) { framework = 11; power = 9; } else if (framework == 11 && power == 17) { framework = 11; power = 7; } else if (framework == 11 && power == 18) { framework = 11; power = 10; } else if (framework == 11 && power == 24) { framework = 11; power = 25; } else if (framework == 11 && power == 25) { framework = 11; power = 26; } else if (framework == 11 && power == 26) { framework = 11; power = 28; } else if (framework == 11 && power == 27) { framework = 11; power = 29; } else if (framework == 11 && power == 28) { framework = 11; power = 30; } else if (framework == 11 && power == 29) { framework = 11; power = 31; } else if (framework == 11 && power == 30) { framework = 11; power = 32; } else if (framework == 11 && power == 31) { framework = 11; power = 33; } else if (framework == 11 && power == 32) { framework = 11; power = 34; } else if (framework == 11 && power == 33) { framework = 11; power = 35; } else if (framework == 12 && power == 3) { framework = 12; power = 5; } else if (framework == 12 && power == 4) { framework = 12; power = 6; } else if (framework == 12 && power == 5) { framework = 12; power = 4; } else if (framework == 12 && power == 6) { framework = 12; power = 3; } else if (framework == 12 && power == 9) { framework = 12; power = 12; } else if (framework == 12 && power == 10) { framework = 12; power = 17; } else if (framework == 12 && power == 11) { framework = 12; power = 14; } else if (framework == 12 && power == 12) { framework = 12; power = 15; } else if (framework == 12 && power == 14) { framework = 12; power = 16; } else if (framework == 12 && power == 15) { framework = 12; power = 18; } else if (framework == 12 && power == 16) { framework = 12; power = 19; } else if (framework == 12 && power == 17) { framework = 12; power = 20; } else if (framework == 12 && power == 18) { framework = 12; power = 9; } else if (framework == 12 && power == 19) { framework = 12; power = 10; } else if (framework == 12 && power == 20) { framework = 12; power = 11; } else if (framework == 12 && power == 23) { framework = 12; power = 26; } else if (framework == 12 && power == 25) { framework = 12; power = 23; } else if (framework == 12 && power == 26) { framework = 12; power = 28; } else if (framework == 12 && power == 27) { framework = 12; power = 25; } else if (framework == 12 && power == 28) { framework = 12; power = 29; } else if (framework == 12 && power == 29) { framework = 12; power = 30; } else if (framework == 12 && power == 30) { framework = 12; power = 32; } else if (framework == 12 && power == 31) { framework = 12; power = 33; } else if (framework == 12 && power == 32) { framework = 12; power = 34; } else if (framework == 12 && power == 33) { framework = 12; power = 35; } else if (framework == 12 && power == 34) { framework = 12; power = 36; } else if (framework == 12 && power == 35) { framework = 12; power = 37; } else if (framework == 12 && power == 36) { framework = 12; power = 38; } else if (framework == 12 && power == 37) { framework = 12; power = 39; } else if (framework == 13 && power == 4) { framework = 13; power = 7; } else if (framework == 13 && power == 5) { framework = 13; power = 4; } else if (framework == 13 && power == 7) { framework = 13; power = 5; } else if (framework == 13 && power == 9) { framework = 13; power = 13; } else if (framework == 13 && power == 10) { framework = 13; power = 18; } else if (framework == 13 && power == 11) { framework = 13; power = 15; } else if (framework == 13 && power == 12) { framework = 13; power = 16; } else if (framework == 13 && power == 13) { framework = 13; power = 14; } else if (framework == 13 && power == 14) { framework = 13; power = 17; } else if (framework == 13 && power == 15) { framework = 13; power = 19; } else if (framework == 13 && power == 16) { framework = 13; power = 20; } else if (framework == 13 && power == 17) { framework = 13; power = 21; } else if (framework == 13 && power == 18) { framework = 13; power = 10; } else if (framework == 13 && power == 19) { framework = 13; power = 9; } else if (framework == 13 && power == 20) { framework = 13; power = 11; } else if (framework == 13 && power == 21) { framework = 13; power = 12; } else if (framework == 13 && power == 28) { framework = 13; power = 29; } else if (framework == 13 && power == 29) { framework = 13; power = 30; } else if (framework == 13 && power == 30) { framework = 13; power = 32; } else if (framework == 13 && power == 31) { framework = 13; power = 33; } else if (framework == 13 && power == 32) { framework = 13; power = 34; } else if (framework == 13 && power == 33) { framework = 13; power = 35; } else if (framework == 13 && power == 34) { framework = 13; power = 36; } else if (framework == 13 && power == 35) { framework = 13; power = 37; } else if (framework == 13 && power == 36) { framework = 13; power = 38; } else if (framework == 13 && power == 37) { framework = 13; power = 39; } else if (framework == 13 && power == 38) { framework = 13; power = 40; } else if (framework == 14 && power == 3) { framework = 14; power = 9; } else if (framework == 14 && power == 4) { framework = 14; power = 3; } else if (framework == 14 && power == 5) { framework = 14; power = 7; } else if (framework == 14 && power == 6) { framework = 14; power = 4; } else if (framework == 14 && power == 7) { framework = 14; power = 6; } else if (framework == 14 && power == 8) { framework = 14; power = 5; } else if (framework == 14 && power == 9) { framework = 14; power = 8; } else if (framework == 14 && power == 10) { framework = 14; power = 13; } else if (framework == 14 && power == 11) { framework = 14; power = 18; } else if (framework == 14 && power == 12) { framework = 14; power = 15; } else if (framework == 14 && power == 13) { framework = 14; power = 16; } else if (framework == 14 && power == 15) { framework = 14; power = 17; } else if (framework == 14 && power == 16) { framework = 14; power = 19; } else if (framework == 14 && power == 17) { framework = 14; power = 20; } else if (framework == 14 && power == 18) { framework = 14; power = 10; } else if (framework == 14 && power == 19) { framework = 14; power = 11; } else if (framework == 14 && power == 20) { framework = 14; power = 12; } else if (framework == 14 && power == 27) { framework = 14; power = 28; } else if (framework == 14 && power == 28) { framework = 14; power = 29; } else if (framework == 14 && power == 29) { framework = 14; power = 31; } else if (framework == 14 && power == 30) { framework = 14; power = 32; } else if (framework == 14 && power == 31) { framework = 14; power = 33; } else if (framework == 14 && power == 32) { framework = 14; power = 34; } else if (framework == 14 && power == 33) { framework = 14; power = 35; } else if (framework == 14 && power == 34) { framework = 14; power = 36; } else if (framework == 14 && power == 35) { framework = 14; power = 37; } else if (framework == 14 && power == 36) { framework = 14; power = 38; } else if (framework == 14 && power == 37) { framework = 14; power = 39; } else if (framework == 14 && power == 38) { framework = 14; power = 40; } else if (framework == 15 && power == 9) { framework = 15; power = 11; } else if (framework == 15 && power == 11) { framework = 15; power = 12; } else if (framework == 15 && power == 12) { framework = 15; power = 13; } else if (framework == 15 && power == 13) { framework = 15; power = 14; } else if (framework == 15 && power == 14) { framework = 15; power = 15; } else if (framework == 15 && power == 15) { framework = 15; power = 9; } else if (framework == 15 && power == 26) { framework = 15; power = 27; } else if (framework == 15 && power == 27) { framework = 15; power = 26; } else if (framework == 15 && power == 32) { framework = 15; power = 33; } else if (framework == 15 && power == 33) { framework = 15; power = 32; } else if (framework == 16 && power == 3) { framework = 16; power = 8; } else if (framework == 16 && power == 4) { framework = 16; power = 6; } else if (framework == 16 && power == 5) { framework = 16; power = 7; } else if (framework == 16 && power == 6) { framework = 16; power = 3; } else if (framework == 16 && power == 7) { framework = 16; power = 4; } else if (framework == 16 && power == 8) { framework = 16; power = 5; } else if (framework == 16 && power == 15) { framework = 16; power = 16; } else if (framework == 16 && power == 16) { framework = 16; power = 17; } else if (framework == 16 && power == 17) { framework = 16; power = 18; } else if (framework == 16 && power == 18) { framework = 16; power = 19; } else if (framework == 16 && power == 19) { framework = 16; power = 15; } else if (framework == 16 && power == 20) { framework = 16; power = 21; } else if (framework == 16 && power == 21) { framework = 16; power = 20; } else if (framework == 16 && power == 26) { framework = 16; power = 27; } else if (framework == 16 && power == 27) { framework = 16; power = 26; } else if (framework == 17 && power == 2) { framework = 17; power = 3; } else if (framework == 17 && power == 3) { framework = 17; power = 2; } else if (framework == 17 && power == 4) { framework = 17; power = 5; } else if (framework == 17 && power == 5) { framework = 17; power = 6; } else if (framework == 17 && power == 6) { framework = 17; power = 9; } else if (framework == 17 && power == 7) { framework = 17; power = 4; } else if (framework == 17 && power == 8) { framework = 17; power = 7; } else if (framework == 17 && power == 9) { framework = 17; power = 8; } else if (framework == 17 && power == 14) { framework = 17; power = 16; } else if (framework == 17 && power == 15) { framework = 17; power = 17; } else if (framework == 17 && power == 16) { framework = 17; power = 15; } else if (framework == 17 && power == 17) { framework = 17; power = 14; } else if (framework == 17 && power == 19) { framework = 17; power = 20; } else if (framework == 17 && power == 20) { framework = 17; power = 19; } else if (framework == 18 && power == 4) { framework = 18; power = 6; } else if (framework == 18 && power == 5) { framework = 18; power = 7; } else if (framework == 18 && power == 6) { framework = 18; power = 8; } else if (framework == 18 && power == 7) { framework = 18; power = 10; } else if (framework == 18 && power == 8) { framework = 18; power = 9; } else if (framework == 18 && power == 9) { framework = 18; power = 12; } else if (framework == 18 && power == 10) { framework = 18; power = 11; } else if (framework == 18 && power == 11) { framework = 18; power = 4; } else if (framework == 18 && power == 12) { framework = 18; power = 5; } else if (framework == 18 && power == 14) { framework = 18; power = 15; } else if (framework == 18 && power == 15) { framework = 18; power = 14; } else if (framework == 18 && power == 17) { framework = 18; power = 18; } else if (framework == 18 && power == 18) { framework = 18; power = 19; } else if (framework == 18 && power == 19) { framework = 18; power = 17; } else if (framework == 19 && power == 5) { framework = 19; power = 7; } else if (framework == 19 && power == 6) { framework = 19; power = 8; } else if (framework == 19 && power == 7) { framework = 19; power = 9; } else if (framework == 19 && power == 8) { framework = 19; power = 5; } else if (framework == 19 && power == 9) { framework = 19; power = 10; } else if (framework == 19 && power == 10) { framework = 19; power = 12; } else if (framework == 19 && power == 11) { framework = 19; power = 13; } else if (framework == 19 && power == 12) { framework = 19; power = 16; } else if (framework == 19 && power == 13) { framework = 19; power = 15; } else if (framework == 19 && power == 14) { framework = 19; power = 11; } else if (framework == 19 && power == 15) { framework = 19; power = 14; } else if (framework == 19 && power == 16) { framework = 19; power = 17; } else if (framework == 19 && power == 17) { framework = 19; power = 18; } else if (framework == 19 && power == 18) { framework = 19; power = 19; } else if (framework == 19 && power == 19) { framework = 19; power = 20; } else if (framework == 19 && power == 20) { framework = 19; power = 23; } else if (framework == 19 && power == 21) { framework = 19; power = 24; } else if (framework == 19 && power == 22) { framework = 19; power = 21; } else if (framework == 19 && power == 23) { framework = 19; power = 22; } else if (framework == 19 && power == 25) { framework = 19; power = 26; } else if (framework == 19 && power == 26) { framework = 19; power = 27; } else if (framework == 19 && power == 27) { framework = 19; power = 28; } else if (framework == 19 && power == 28) { framework = 19; power = 29; } else if (framework == 19 && power == 29) { framework = 19; power = 30; } else if (framework == 19 && power == 30) { framework = 19; power = 31; } else if (framework == 19 && power == 31) { framework = 19; power = 32; } else if (framework == 19 && power == 32) { framework = 19; power = 33; } else if (framework == 19 && power == 33) { framework = 19; power = 34; } else if (framework == 19 && power == 34) { framework = 19; power = 35; } else if (framework == 20 && power == 4) { framework = 20; power = 5; } else if (framework == 20 && power == 5) { framework = 20; power = 4; } else if (framework == 20 && power == 7) { framework = 20; power = 8; } else if (framework == 20 && power == 8) { framework = 20; power = 9; } else if (framework == 20 && power == 9) { framework = 20; power = 7; } else if (framework == 20 && power == 11) { framework = 20; power = 12; } else if (framework == 20 && power == 12) { framework = 20; power = 13; } else if (framework == 20 && power == 13) { framework = 20; power = 11; } else if (framework == 20 && power == 20) { framework = 20; power = 21; } else if (framework == 20 && power == 21) { framework = 20; power = 20; } else if (framework == 21 && power == 4) { framework = 21; power = 5; } else if (framework == 21 && power == 5) { framework = 21; power = 6; } else if (framework == 21 && power == 6) { framework = 21; power = 7; } else if (framework == 21 && power == 7) { framework = 21; power = 8; } else if (framework == 21 && power == 8) { framework = 21; power = 9; } else if (framework == 21 && power == 9) { framework = 21; power = 10; } else if (framework == 21 && power == 10) { framework = 21; power = 11; } else if (framework == 21 && power == 11) { framework = 21; power = 12; } else if (framework == 21 && power == 12) { framework = 21; power = 4; } else if (framework == 21 && power == 15) { framework = 21; power = 17; } else if (framework == 21 && power == 16) { framework = 21; power = 15; } else if (framework == 21 && power == 17) { framework = 21; power = 16; } else if (framework == 21 && power == 18) { framework = 21; power = 21; } else if (framework == 21 && power == 21) { framework = 21; power = 18; } else if (framework == 21 && power == 24) { framework = 21; power = 25; } else if (framework == 21 && power == 25) { framework = 21; power = 24; } else if (framework == 21 && power == 32) { framework = 21; power = 33; } else if (framework == 21 && power == 33) { framework = 21; power = 32; } else if (framework == 22 && power == 2) { framework = 22; power = 6; } else if (framework == 22 && power == 3) { framework = 22; power = 2; } else if (framework == 22 && power == 4) { framework = 22; power = 3; } else if (framework == 22 && power == 5) { framework = 22; power = 8; } else if (framework == 22 && power == 6) { framework = 22; power = 7; } else if (framework == 22 && power == 7) { framework = 22; power = 4; } else if (framework == 22 && power == 8) { framework = 22; power = 5; } else if (framework == 22 && power == 10) { framework = 22; power = 11; } else if (framework == 22 && power == 11) { framework = 22; power = 12; } else if (framework == 22 && power == 12) { framework = 22; power = 13; } else if (framework == 22 && power == 13) { framework = 22; power = 10; } else if (framework == 22 && power == 21) { framework = 22; power = 29; } else if (framework == 22 && power == 22) { framework = 22; power = 30; } else if (framework == 22 && power == 23) { framework = 22; power = 21; } else if (framework == 22 && power == 24) { framework = 22; power = 22; } else if (framework == 22 && power == 25) { framework = 22; power = 31; } else if (framework == 22 && power == 26) { framework = 22; power = 32; } else if (framework == 22 && power == 27) { framework = 22; power = 33; } else if (framework == 22 && power == 28) { framework = 22; power = 34; } else if (framework == 22 && power == 29) { framework = 22; power = 23; } else if (framework == 22 && power == 30) { framework = 22; power = 24; } else if (framework == 22 && power == 31) { framework = 22; power = 25; } else if (framework == 22 && power == 32) { framework = 22; power = 26; } else if (framework == 22 && power == 33) { framework = 22; power = 27; } else if (framework == 22 && power == 34) { framework = 22; power = 28; } else if (framework == 22 && power == 36) { framework = 22; power = 38; } else if (framework == 22 && power == 38) { framework = 22; power = 36; } else if (framework == 22 && power == 43) { framework = 22; power = 44; } else if (framework == 22 && power == 44) { framework = 22; power = 43; } else if (framework == 23 && power == 1) { framework = 23; power = 2; } else if (framework == 23 && power == 2) { framework = 23; power = 1; } else if (framework == 23 && power == 5) { framework = 23; power = 8; } else if (framework == 23 && power == 8) { framework = 23; power = 12; } else if (framework == 23 && power == 9) { framework = 23; power = 10; } else if (framework == 23 && power == 10) { framework = 23; power = 11; } else if (framework == 23 && power == 11) { framework = 23; power = 13; } else if (framework == 23 && power == 12) { framework = 23; power = 14; } else if (framework == 23 && power == 13) { framework = 23; power = 9; } else if (framework == 23 && power == 14) { framework = 23; power = 15; } else if (framework == 23 && power == 15) { framework = 23; power = 16; } else if (framework == 23 && power == 16) { framework = 23; power = 5; } else if (framework == 23 && power == 18) { framework = 23; power = 19; } else if (framework == 23 && power == 19) { framework = 23; power = 20; } else if (framework == 23 && power == 20) { framework = 23; power = 25; } else if (framework == 23 && power == 21) { framework = 23; power = 26; } else if (framework == 23 && power == 25) { framework = 23; power = 21; } else if (framework == 23 && power == 26) { framework = 23; power = 18; } else if (framework == 23 && power == 34) { framework = 23; power = 35; } else if (framework == 23 && power == 35) { framework = 23; power = 34; } else if (framework == 24 && power == 4) { framework = 24; power = 5; } else if (framework == 24 && power == 5) { framework = 24; power = 6; } else if (framework == 24 && power == 6) { framework = 24; power = 4; } else if (framework == 24 && power == 9) { framework = 24; power = 11; } else if (framework == 24 && power == 10) { framework = 24; power = 9; } else if (framework == 24 && power == 11) { framework = 24; power = 10; } else if (framework == 24 && power == 17) { framework = 24; power = 22; } else if (framework == 24 && power == 18) { framework = 24; power = 24; } else if (framework == 24 && power == 19) { framework = 24; power = 17; } else if (framework == 24 && power == 21) { framework = 24; power = 18; } else if (framework == 24 && power == 22) { framework = 24; power = 21; } else if (framework == 24 && power == 24) { framework = 24; power = 19; } else if (framework == 24 && power == 31) { framework = 24; power = 32; } else if (framework == 24 && power == 32) { framework = 24; power = 31; }

                // 3. LOOKUP THE TRUE NAME IN powerhouse-data.js
                let targetCode = window.numToUrlCode(framework) + window.numToUrlCode(power);
                let phPowerObj = phMap[targetCode];

                if (phPowerObj && typeof powers !== 'undefined') {
                    let searchName = phPowerObj.name.trim().toLowerCase();
                    
                    let ourPower = powers.find(x => 
                        x.name.trim().toLowerCase() === searchName || 
                        (searchName === "electric bolt" && x.name.trim().toLowerCase() === "lightning bolt")
                    );
                    
                    if (ourPower) {
                        let powerData = { name: ourPower.name, advantages: [] };
                        
                        if (pMask > 0 && phPowerObj.advantageList) {
                            for (let bit = 1; bit < phPowerObj.advantageList.length; bit++) { 
                                let test = Math.pow(2, bit);
                                if ((pMask & test) === test) { 
                                    let resolvedAdv = phPowerObj.advantageList[bit];
                                    if (resolvedAdv && resolvedAdv.name) {
                                        powerData.advantages.push(resolvedAdv.name);
                                    }
                                }
                            }
                        }
                        plainTextBuild.powers.push(powerData);
                    } else {
                        console.warn("BalakTranslator: Name not found in local DB: " + searchName);
                    }
                }
            }

            // SPECIALIZATIONS
            let hcTreeList = typeof HCData !== 'undefined' ? (HCData.specializationTree || HCData.specialization || HCData.tree || HCData.specializations) : null;
            if (hcTreeList) {
                let specBlocks = [];
                for(let s=1; s<=3; s++) specBlocks.push(urlCodeToNum4(d[i++] + d[i++] + d[i++] + d[i++]));

                let masteryChoice = specBlocks[0] & 15; 

                for (let s=1; s<=3; s++) {
                    let specNum = specBlocks[s-1];
                    let allocations = specNum >> 4;
                    let treeName = null;

                    if (s === 1) treeName = plainTextBuild.stats.primary;
                    else {
                        let treeID = specNum & 15;
                        if (treeID > 0) {
                            let foundTree = hcTreeList.find(t => t.id === treeID + 8) || hcTreeList.find(t => t.id === treeID) || hcTreeList[treeID + 8] || hcTreeList[treeID];
                            if (foundTree) treeName = foundTree.name;
                        }
                    }

                    if (treeName) {
                        let treeKey = (s === 1) ? 'primary' : (s === 2) ? 'sec1' : 'sec2';
                        plainTextBuild.specs[treeKey] = treeName;

                        let aTree = hcTreeList.find(t => t.name && t.name.toLowerCase() === treeName.toLowerCase());
                        if (aTree && aTree.specializationList) {
                            for (let pIdx = 0; pIdx < 8; pIdx++) {
                                let pts = (allocations >> (pIdx * 2)) & 3; 
                                if (pts > 0 && aTree.specializationList[pIdx]) {
                                    let perkItem = aTree.specializationList[pIdx];
                                    plainTextBuild.specs.perks.push({ treeName: treeName, perkName: perkItem.name || perkItem.desc, points: pts });
                                }
                            }
                            if ((masteryChoice === s) && aTree.specializationList[8]) {
                                let masteryPerk = aTree.specializationList[8];
                                plainTextBuild.specs.mastery = masteryPerk.name || masteryPerk.desc;
                            }
                        }
                    }
                }
            }

            if ((d.length - i) % 2 !== 0) i++;

            // DEVICES
            if (i < d.length) {
                for (let devIndex = 0; devIndex < 5; devIndex++) {
                    if (i + 1 < d.length) {
                        let extractedId = urlCodeToNum2(d[i++] + d[i++]);
                        if (extractedId > 0 && typeof HCData !== 'undefined' && HCData.device && HCData.device[extractedId]) {
                            plainTextBuild.devices[devIndex] = HCData.device[extractedId].name;
                        }
                    }
                }
            }

            console.log("BALAK TRANSLATOR OUTPUT:", plainTextBuild);
            return plainTextBuild;
        }
    };
})();