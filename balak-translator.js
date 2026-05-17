// balak-translator.js
// Standalone Bridge for Balaknight (Powerhouse) URLs

window.BalakTranslator = (function() {
    
    function numToUrlCode(num) {
        let charCode = 0;
        if (num >= 0 && num <= 9) charCode = num + 48;
        else if (num >= 10 && num <= 35) charCode = num + 55;
        else if (num >= 36 && num <= 61) charCode = num + 61;
        else return String.fromCharCode(48);
        return String.fromCharCode(charCode);
    }
    
    function numToUrlCode2(num) { 
        return numToUrlCode(Math.floor(num / 61)) + numToUrlCode(num % 61); 
    }

    function urlCodeToNum(code) {
        if (!code) return 0;
        let charCode = code.charCodeAt(0);
        if (charCode >= 48 && charCode <= 57) return charCode - 48; 
        if (charCode >= 65 && charCode <= 90) return charCode - 55; 
        if (charCode >= 97 && charCode <= 122) return charCode - 61; 
        return 0;
    }

    function urlCodeToNum2(code) { 
        if (!code || code.length < 2) return 0;
        return urlCodeToNum(code[0]) * 61 + urlCodeToNum(code[1]); 
    }

    function urlCodeToNum4(code) { 
        if (!code || code.length < 4) return 0;
        return urlCodeToNum(code[0]) * 226981 + urlCodeToNum(code[1]) * 3721 + urlCodeToNum(code[2]) * 61 + urlCodeToNum(code[3]); 
    }

    // Strips HTML <img> tags and &nbsp; out of powerhouse-data strings
    function cleanText(str) {
        if (!str) return "";
        return str.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/ig, ' ').trim();
    }

    return {
        decode: function(urlString) {
            if (typeof dataPower === 'undefined') {
                console.error("BalakTranslator: powerhouse-data.js is missing!");
                return null;
            }

            let url;
            try { url = new URL(urlString); } catch(e) { return null; }
            let vParam = url.searchParams.get('v');
            let version = vParam ? parseInt(vParam) : 2;
            let d = url.searchParams.get('d');
            if (!d) return null;

            let dataArr = d.split('');

            // --- V38 PRE-PROCESSING SHIFT ---
            if (version === 38) {
                let oldData = [...dataArr];
                dataArr = [];
                for (let j = 0, k = 0; j < 86; j++) {
                    if (j != 12 && j != 15) {
                        dataArr[k] = oldData[j] || '0';
                        k++;
                    }
                }

                let i = 0, pos = 0, inc = 1;
                while (i < dataArr.length) {
                    switch(pos) {
                        case 0: case 1: case 2: case 3: inc = 1; break;
                        case 4:
                            let innateCode = urlCodeToNum2(dataArr[i] + dataArr[i+1]);
                            if (innateCode == 57) innateCode = 36;
                            else if (innateCode == 51) innateCode = 50;
                            else if (innateCode == 50) innateCode = 51;
                            else if (innateCode == 36) innateCode = 57;
                            let inCode = numToUrlCode2(innateCode);
                            dataArr[i] = inCode[0]; dataArr[i+1] = inCode[1];
                            inc = 2; break;
                        case 5: case 6: case 7: case 8: case 9: case 10: inc = 1; break;
                        case 11: case 12: inc = 2; break;
                        case 13: case 14: case 15: case 16: case 17: case 18: case 19: case 20: case 21: case 22: case 23: case 24: case 25: case 26:
                            let framework = parseInt(urlCodeToNum(dataArr[i]));
                            let power = parseInt(urlCodeToNum(dataArr[i+1]));
                            
                            // Apply V38 specific framework / power ID shifts
                            if (framework == 1 && power == 2) { framework = 1; power = 3; } else if (framework == 1 && power == 3) { framework = 1; power = 2; } else if (framework == 1 && power == 13) { framework = 1; power = 15; } else if (framework == 1 && power == 14) { framework = 1; power = 16; } else if (framework == 1 && power == 15) { framework = 1; power = 13; } else if (framework == 1 && power == 16) { framework = 1; power = 17; } else if (framework == 1 && power == 17) { framework = 1; power = 18; } else if (framework == 1 && power == 18) { framework = 1; power = 14; } else if (framework == 1 && power == 30) { framework = 1; power = 31; } else if (framework == 1 && power == 31) { framework = 1; power = 30; } else if (framework == 2 && power == 2) { framework = 2; power = 5; } else if (framework == 2 && power == 3) { framework = 2; power = 2; } else if (framework == 2 && power == 5) { framework = 2; power = 3; } else if (framework == 2 && power == 6) { framework = 2; power = 7; } else if (framework == 2 && power == 7) { framework = 2; power = 6; } else if (framework == 2 && power == 14) { framework = 2; power = 15; } else if (framework == 2 && power == 15) { framework = 2; power = 14; } else if (framework == 2 && power == 16) { framework = 2; power = 17; } else if (framework == 2 && power == 17) { framework = 2; power = 16; } else if (framework == 2 && power == 18) { framework = 2; power = 20; } else if (framework == 2 && power == 19) { framework = 2; power = 21; } else if (framework == 2 && power == 21) { framework = 2; power = 18; } else if (framework == 2 && power == 22) { framework = 2; power = 19; } else if (framework == 3 && power == 2) { framework = 3; power = 3; } else if (framework == 3 && power == 3) { framework = 3; power = 2; } else if (framework == 3 && power == 5) { framework = 3; power = 7; } else if (framework == 3 && power == 6) { framework = 3; power = 8; } else if (framework == 3 && power == 7) { framework = 3; power = 9; } else if (framework == 3 && power == 8) { framework = 3; power = 10; } else if (framework == 3 && power == 9) { framework = 3; power = 11; } else if (framework == 3 && power == 10) { framework = 3; power = 13; } else if (framework == 3 && power == 11) { framework = 3; power = 14; } else if (framework == 3 && power == 12) { framework = 3; power = 5; } else if (framework == 3 && power == 13) { framework = 3; power = 6; } else if (framework == 3 && power == 14) { framework = 3; power = 12; } else if (framework == 4 && power == 7) { framework = 4; power = 9; } else if (framework == 4 && power == 9) { framework = 4; power = 10; } else if (framework == 4 && power == 10) { framework = 4; power = 7; } else if (framework == 4 && power == 11) { framework = 4; power = 12; } else if (framework == 4 && power == 12) { framework = 4; power = 13; } else if (framework == 4 && power == 13) { framework = 4; power = 11; } else if (framework == 5 && power == 4) { framework = 5; power = 5; } else if (framework == 5 && power == 5) { framework = 5; power = 4; } else if (framework == 5 && power == 12) { framework = 5; power = 13; } else if (framework == 5 && power == 13) { framework = 5; power = 14; } else if (framework == 5 && power == 14) { framework = 5; power = 16; } else if (framework == 5 && power == 15) { framework = 5; power = 17; } else if (framework == 5 && power == 16) { framework = 5; power = 18; } else if (framework == 5 && power == 17) { framework = 5; power = 21; } else if (framework == 5 && power == 18) { framework = 5; power = 19; } else if (framework == 5 && power == 19) { framework = 5; power = 20; } else if (framework == 5 && power == 20) { framework = 5; power = 22; } else if (framework == 5 && power == 21) { framework = 5; power = 23; } else if (framework == 5 && power == 22) { framework = 5; power = 24; } else if (framework == 5 && power == 23) { framework = 5; power = 25; } else if (framework == 5 && power == 24) { framework = 5; power = 26; } else if (framework == 5 && power == 25) { framework = 5; power = 27; } else if (framework == 5 && power == 26) { framework = 5; power = 28; } else if (framework == 5 && power == 27) { framework = 5; power = 29; } else if (framework == 5 && power == 28) { framework = 5; power = 30; } else if (framework == 6 && power == 4) { framework = 6; power = 7; } else if (framework == 6 && power == 7) { framework = 6; power = 8; } else if (framework == 6 && power == 8) { framework = 6; power = 9; } else if (framework == 6 && power == 9) { framework = 6; power = 10; } else if (framework == 6 && power == 10) { framework = 6; power = 4; } else if (framework == 6 && power == 14) { framework = 6; power = 15; } else if (framework == 6 && power == 15) { framework = 6; power = 14; } else if (framework == 6 && power == 22) { framework = 6; power = 23; } else if (framework == 6 && power == 23) { framework = 6; power = 22; } else if (framework == 7 && power == 0) { framework = 9; power = 0; } else if (framework == 7 && power == 1) { framework = 9; power = 1; } else if (framework == 7 && power == 2) { framework = 9; power = 2; } else if (framework == 7 && power == 0) { framework = 9; power = 3; } else if (framework == 7 && power == 1) { framework = 9; power = 4; } else if (framework == 7 && power == 2) { framework = 9; power = 6; } else if (framework == 7 && power == 3) { framework = 9; power = 5; } else if (framework == 7 && power == 4) { framework = 9; power = 7; } else if (framework == 7 && power == 6) { framework = 9; power = 8; } else if (framework == 7 && power == 7) { framework = 9; power = 9; } else if (framework == 7 && power == 8) { framework = 9; power = 11; } else if (framework == 7 && power == 9) { framework = 9; power = 13; } else if (framework == 7 && power == 10) { framework = 9; power = 17; } else if (framework == 7 && power == 11) { framework = 9; power = 18; } else if (framework == 7 && power == 12) { framework = 9; power = 12; } else if (framework == 7 && power == 13) { framework = 9; power = 14; } else if (framework == 7 && power == 14) { framework = 9; power = 15; } else if (framework == 7 && power == 15) { framework = 9; power = 16; } else if (framework == 7 && power == 16) { framework = 9; power = 19; } else if (framework == 7 && power == 17) { framework = 9; power = 20; } else if (framework == 7 && power == 18) { framework = 7; power = 13; } else if (framework == 7 && power == 19) { framework = 9; power = 22; } else if (framework == 7 && power == 20) { framework = 9; power = 23; } else if (framework == 7 && power == 21) { framework = 9; power = 24; } else if (framework == 7 && power == 22) { framework = 9; power = 28; } else if (framework == 7 && power == 23) { framework = 9; power = 26; } else if (framework == 7 && power == 24) { framework = 9; power = 27; } else if (framework == 7 && power == 25) { framework = 9; power = 37; } else if (framework == 7 && power == 26) { framework = 9; power = 29; } else if (framework == 7 && power == 27) { framework = 9; power = 30; } else if (framework == 7 && power == 28) { framework = 9; power = 31; } else if (framework == 7 && power == 29) { framework = 9; power = 32; } else if (framework == 7 && power == 30) { framework = 9; power = 38; } else if (framework == 7 && power == 31) { framework = 9; power = 33; } else if (framework == 7 && power == 32) { framework = 9; power = 34; } else if (framework == 7 && power == 34) { framework = 9; power = 36; } else if (framework == 7 && power == 35) { framework = 9; power = 39; } else if (framework == 7 && power == 36) { framework = 9; power = 40; } else if (framework == 7 && power == 37) { framework = 9; power = 41; } else if (framework == 7 && power == 38) { framework = 9; power = 42; } else if (framework == 7 && power == 39) { framework = 9; power = 43; } else if (framework == 7 && power == 40) { framework = 9; power = 44; } else if (framework == 7 && power == 41) { framework = 9; power = 10; } else if (framework == 7 && power == 42) { framework = 9; power = 45; } else if (framework == 7 && power == 43) { framework = 7; power = 31; } else if (framework == 7 && power == 44) { framework = 7; power = 32; } else if (framework == 7 && power == 45) { framework = 7; power = 34; } else if (framework == 7 && power == 46) { framework = 7; power = 33; } else if (framework == 7 && power == 47) { framework = 7; power = 35; } else if (framework == 7 && power == 48) { framework = 7; power = 36; } else if (framework == 7 && power == 49) { framework = 7; power = 37; } else if (framework == 8 && power == 0) { framework = 7; power = 0; } else if (framework == 8 && power == 1) { framework = 7; power = 1; } else if (framework == 8 && power == 2) { framework = 7; power = 2; } else if (framework == 8 && power == 3) { framework = 7; power = 3; } else if (framework == 8 && power == 4) { framework = 7; power = 4; } else if (framework == 8 && power == 5) { framework = 7; power = 5; } else if (framework == 8 && power == 6) { framework = 7; power = 6; } else if (framework == 8 && power == 7) { framework = 7; power = 7; } else if (framework == 8 && power == 8) { framework = 7; power = 8; } else if (framework == 8 && power == 9) { framework = 7; power = 9; } else if (framework == 8 && power == 10) { framework = 7; power = 10; } else if (framework == 8 && power == 11) { framework = 7; power = 11; } else if (framework == 8 && power == 12) { framework = 7; power = 12; } else if (framework == 8 && power == 13) { framework = 8; power = 12; } else if (framework == 8 && power == 14) { framework = 7; power = 14; } else if (framework == 8 && power == 15) { framework = 7; power = 15; } else if (framework == 8 && power == 16) { framework = 7; power = 16; } else if (framework == 8 && power == 17) { framework = 7; power = 17; } else if (framework == 8 && power == 18) { framework = 7; power = 18; } else if (framework == 8 && power == 19) { framework = 7; power = 26; } else if (framework == 8 && power == 20) { framework = 7; power = 19; } else if (framework == 8 && power == 21) { framework = 7; power = 20; } else if (framework == 8 && power == 22) { framework = 7; power = 21; } else if (framework == 8 && power == 23) { framework = 7; power = 24; } else if (framework == 8 && power == 24) { framework = 7; power = 25; } else if (framework == 8 && power == 25) { framework = 7; power = 22; } else if (framework == 8 && power == 26) { framework = 7; power = 23; } else if (framework == 8 && power == 27) { framework = 7; power = 29; } else if (framework == 8 && power == 28) { framework = 7; power = 28; } else if (framework == 8 && power == 29) { framework = 7; power = 27; } else if (framework == 8 && power == 30) { framework = 7; power = 30; } else if (framework == 8 && power == 31) { framework = 8; power = 26; } else if (framework == 8 && power == 32) { framework = 8; power = 27; } else if (framework == 8 && power == 33) { framework = 8; power = 29; } else if (framework == 8 && power == 34) { framework = 8; power = 28; } else if (framework == 8 && power == 35) { framework = 8; power = 30; } else if (framework == 8 && power == 36) { framework = 8; power = 31; } else if (framework == 8 && power == 37) { framework = 8; power = 32; } else if (framework == 9 && power == 0) { framework = 8; power = 0; } else if (framework == 9 && power == 1) { framework = 8; power = 1; } else if (framework == 9 && power == 2) { framework = 8; power = 2; } else if (framework == 9 && power == 3) { framework = 8; power = 3; } else if (framework == 9 && power == 4) { framework = 8; power = 5; } else if (framework == 9 && power == 5) { framework = 8; power = 4; } else if (framework == 9 && power == 6) { framework = 8; power = 6; } else if (framework == 9 && power == 7) { framework = 8; power = 7; } else if (framework == 9 && power == 8) { framework = 8; power = 8; } else if (framework == 9 && power == 9) { framework = 8; power = 9; } else if (framework == 9 && power == 10) { framework = 8; power = 10; } else if (framework == 9 && power == 11) { framework = 8; power = 11; } else if (framework == 9 && power == 12) { framework = 9; power = 21; } else if (framework == 9 && power == 13) { framework = 8; power = 13; } else if (framework == 9 && power == 14) { framework = 8; power = 14; } else if (framework == 9 && power == 15) { framework = 8; power = 15; } else if (framework == 9 && power == 16) { framework = 8; power = 16; } else if (framework == 9 && power == 17) { framework = 8; power = 17; } else if (framework == 9 && power == 18) { framework = 8; power = 18; } else if (framework == 9 && power == 19) { framework = 8; power = 19; } else if (framework == 9 && power == 20) { framework = 8; power = 20; } else if (framework == 9 && power == 21) { framework = 8; power = 21; } else if (framework == 9 && power == 22) { framework = 8; power = 22; } else if (framework == 9 && power == 23) { framework = 8; power = 23; } else if (framework == 9 && power == 24) { framework = 8; power = 24; } else if (framework == 9 && power == 25) { framework = 8; power = 25; } else if (framework == 9 && power == 26) { framework = 9; power = 46; } else if (framework == 9 && power == 27) { framework = 9; power = 47; } else if (framework == 9 && power == 28) { framework = 9; power = 49; } else if (framework == 9 && power == 29) { framework = 9; power = 48; } else if (framework == 9 && power == 30) { framework = 9; power = 50; } else if (framework == 9 && power == 31) { framework = 9; power = 51; } else if (framework == 9 && power == 32) { framework = 9; power = 52; } else if (framework == 10 && power == 15) { framework = 10; power = 16; } else if (framework == 10 && power == 16) { framework = 10; power = 15; } else if (framework == 10 && power == 20) { framework = 10; power = 21; } else if (framework == 10 && power == 21) { framework = 10; power = 20; } else if (framework == 11 && power == 3) { framework = 11; power = 5; } else if (framework == 11 && power == 4) { framework = 11; power = 3; } else if (framework == 11 && power == 5) { framework = 11; power = 4; } else if (framework == 11 && power == 7) { framework = 11; power = 11; } else if (framework == 11 && power == 8) { framework = 11; power = 16; } else if (framework == 11 && power == 9) { framework = 11; power = 13; } else if (framework == 11 && power == 10) { framework = 11; power = 14; } else if (framework == 11 && power == 11) { framework = 11; power = 12; } else if (framework == 11 && power == 12) { framework = 11; power = 15; } else if (framework == 11 && power == 13) { framework = 11; power = 17; } else if (framework == 11 && power == 14) { framework = 11; power = 18; } else if (framework == 11 && power == 15) { framework = 11; power = 8; } else if (framework == 11 && power == 16) { framework = 11; power = 9; } else if (framework == 11 && power == 17) { framework = 11; power = 7; } else if (framework == 11 && power == 18) { framework = 11; power = 10; } else if (framework == 11 && power == 24) { framework = 11; power = 25; } else if (framework == 11 && power == 25) { framework = 11; power = 26; } else if (framework == 11 && power == 26) { framework = 11; power = 28; } else if (framework == 11 && power == 27) { framework = 11; power = 29; } else if (framework == 11 && power == 28) { framework = 11; power = 30; } else if (framework == 11 && power == 29) { framework = 11; power = 31; } else if (framework == 11 && power == 30) { framework = 11; power = 32; } else if (framework == 11 && power == 31) { framework = 11; power = 33; } else if (framework == 11 && power == 32) { framework = 11; power = 34; } else if (framework == 11 && power == 33) { framework = 11; power = 35; } else if (framework == 12 && power == 3) { framework = 12; power = 5; } else if (framework == 12 && power == 4) { framework = 12; power = 6; } else if (framework == 12 && power == 5) { framework = 12; power = 4; } else if (framework == 12 && power == 6) { framework = 12; power = 3; } else if (framework == 12 && power == 9) { framework = 12; power = 12; } else if (framework == 12 && power == 10) { framework = 12; power = 17; } else if (framework == 12 && power == 11) { framework = 12; power = 14; } else if (framework == 12 && power == 12) { framework = 12; power = 15; } else if (framework == 12 && power == 14) { framework = 12; power = 16; } else if (framework == 12 && power == 15) { framework = 12; power = 18; } else if (framework == 12 && power == 16) { framework = 12; power = 19; } else if (framework == 12 && power == 17) { framework = 12; power = 20; } else if (framework == 12 && power == 18) { framework = 12; power = 9; } else if (framework == 12 && power == 19) { framework = 12; power = 10; } else if (framework == 12 && power == 20) { framework = 12; power = 11; } else if (framework == 12 && power == 23) { framework = 12; power = 26; } else if (framework == 12 && power == 25) { framework = 12; power = 23; } else if (framework == 12 && power == 26) { framework = 12; power = 28; } else if (framework == 12 && power == 27) { framework = 12; power = 25; } else if (framework == 12 && power == 28) { framework = 12; power = 29; } else if (framework == 12 && power == 29) { framework = 12; power = 30; } else if (framework == 12 && power == 30) { framework = 12; power = 32; } else if (framework == 12 && power == 31) { framework = 12; power = 33; } else if (framework == 12 && power == 32) { framework = 12; power = 34; } else if (framework == 12 && power == 33) { framework = 12; power = 35; } else if (framework == 12 && power == 34) { framework = 12; power = 36; } else if (framework == 12 && power == 35) { framework = 12; power = 37; } else if (framework == 12 && power == 36) { framework = 12; power = 38; } else if (framework == 12 && power == 37) { framework = 12; power = 39; } else if (framework == 13 && power == 4) { framework = 13; power = 7; } else if (framework == 13 && power == 5) { framework = 13; power = 4; } else if (framework == 13 && power == 7) { framework = 13; power = 5; } else if (framework == 13 && power == 9) { framework = 13; power = 13; } else if (framework == 13 && power == 10) { framework = 13; power = 18; } else if (framework == 13 && power == 11) { framework = 13; power = 15; } else if (framework == 13 && power == 12) { framework = 13; power = 16; } else if (framework == 13 && power == 13) { framework = 13; power = 14; } else if (framework == 13 && power == 14) { framework = 13; power = 17; } else if (framework == 13 && power == 15) { framework = 13; power = 19; } else if (framework == 13 && power == 16) { framework = 13; power = 20; } else if (framework == 13 && power == 17) { framework = 13; power = 21; } else if (framework == 13 && power == 18) { framework = 13; power = 10; } else if (framework == 13 && power == 19) { framework = 13; power = 9; } else if (framework == 13 && power == 20) { framework = 13; power = 11; } else if (framework == 13 && power == 21) { framework = 13; power = 12; } else if (framework == 13 && power == 28) { framework = 13; power = 29; } else if (framework == 13 && power == 29) { framework = 13; power = 30; } else if (framework == 13 && power == 30) { framework = 13; power = 32; } else if (framework == 13 && power == 31) { framework = 13; power = 33; } else if (framework == 13 && power == 32) { framework = 13; power = 34; } else if (framework == 13 && power == 33) { framework = 13; power = 35; } else if (framework == 13 && power == 34) { framework = 13; power = 36; } else if (framework == 13 && power == 35) { framework = 13; power = 37; } else if (framework == 13 && power == 36) { framework = 13; power = 38; } else if (framework == 13 && power == 37) { framework = 13; power = 39; } else if (framework == 13 && power == 38) { framework = 13; power = 40; } else if (framework == 14 && power == 3) { framework = 14; power = 9; } else if (framework == 14 && power == 4) { framework = 14; power = 3; } else if (framework == 14 && power == 5) { framework = 14; power = 7; } else if (framework == 14 && power == 6) { framework = 14; power = 4; } else if (framework == 14 && power == 7) { framework = 14; power = 6; } else if (framework == 14 && power == 8) { framework = 14; power = 5; } else if (framework == 14 && power == 9) { framework = 14; power = 8; } else if (framework == 14 && power == 10) { framework = 14; power = 13; } else if (framework == 14 && power == 11) { framework = 14; power = 18; } else if (framework == 14 && power == 12) { framework = 14; power = 15; } else if (framework == 14 && power == 13) { framework = 14; power = 16; } else if (framework == 14 && power == 15) { framework = 14; power = 17; } else if (framework == 14 && power == 16) { framework = 14; power = 19; } else if (framework == 14 && power == 17) { framework = 14; power = 20; } else if (framework == 14 && power == 18) { framework = 14; power = 10; } else if (framework == 14 && power == 19) { framework = 14; power = 11; } else if (framework == 14 && power == 20) { framework = 14; power = 12; } else if (framework == 14 && power == 27) { framework = 14; power = 28; } else if (framework == 14 && power == 28) { framework = 14; power = 29; } else if (framework == 14 && power == 29) { framework = 14; power = 31; } else if (framework == 14 && power == 30) { framework = 14; power = 32; } else if (framework == 14 && power == 31) { framework = 14; power = 33; } else if (framework == 14 && power == 32) { framework = 14; power = 34; } else if (framework == 14 && power == 33) { framework = 14; power = 35; } else if (framework == 14 && power == 34) { framework = 14; power = 36; } else if (framework == 14 && power == 35) { framework = 14; power = 37; } else if (framework == 14 && power == 36) { framework = 14; power = 38; } else if (framework == 14 && power == 37) { framework = 14; power = 39; } else if (framework == 14 && power == 38) { framework = 14; power = 40; } else if (framework == 15 && power == 9) { framework = 15; power = 11; } else if (framework == 15 && power == 11) { framework = 15; power = 12; } else if (framework == 15 && power == 12) { framework = 15; power = 13; } else if (framework == 15 && power == 13) { framework = 15; power = 14; } else if (framework == 15 && power == 14) { framework = 15; power = 15; } else if (framework == 15 && power == 15) { framework = 15; power = 9; } else if (framework == 15 && power == 26) { framework = 15; power = 27; } else if (framework == 15 && power == 27) { framework = 15; power = 26; } else if (framework == 15 && power == 32) { framework = 15; power = 33; } else if (framework == 15 && power == 33) { framework = 15; power = 32; } else if (framework == 16 && power == 3) { framework = 16; power = 8; } else if (framework == 16 && power == 4) { framework = 16; power = 6; } else if (framework == 16 && power == 5) { framework = 16; power = 7; } else if (framework == 16 && power == 6) { framework = 16; power = 3; } else if (framework == 16 && power == 7) { framework = 16; power = 4; } else if (framework == 16 && power == 8) { framework = 16; power = 5; } else if (framework == 16 && power == 15) { framework = 16; power = 16; } else if (framework == 16 && power == 16) { framework = 16; power = 17; } else if (framework == 16 && power == 17) { framework = 16; power = 18; } else if (framework == 16 && power == 18) { framework = 16; power = 19; } else if (framework == 16 && power == 19) { framework = 16; power = 15; } else if (framework == 16 && power == 20) { framework = 16; power = 21; } else if (framework == 16 && power == 21) { framework = 16; power = 20; } else if (framework == 16 && power == 26) { framework = 16; power = 27; } else if (framework == 16 && power == 27) { framework = 16; power = 26; } else if (framework == 17 && power == 2) { framework = 17; power = 3; } else if (framework == 17 && power == 3) { framework = 17; power = 2; } else if (framework == 17 && power == 4) { framework = 17; power = 5; } else if (framework == 17 && power == 5) { framework = 17; power = 6; } else if (framework == 17 && power == 6) { framework = 17; power = 9; } else if (framework == 17 && power == 7) { framework = 17; power = 4; } else if (framework == 17 && power == 8) { framework = 17; power = 7; } else if (framework == 17 && power == 9) { framework = 17; power = 8; } else if (framework == 17 && power == 14) { framework = 17; power = 16; } else if (framework == 17 && power == 15) { framework = 17; power = 17; } else if (framework == 17 && power == 16) { framework = 17; power = 15; } else if (framework == 17 && power == 17) { framework = 17; power = 14; } else if (framework == 17 && power == 19) { framework = 17; power = 20; } else if (framework == 17 && power == 20) { framework = 17; power = 19; } else if (framework == 18 && power == 4) { framework = 18; power = 6; } else if (framework == 18 && power == 5) { framework = 18; power = 7; } else if (framework == 18 && power == 6) { framework = 18; power = 8; } else if (framework == 18 && power == 7) { framework = 18; power = 10; } else if (framework == 18 && power == 8) { framework = 18; power = 9; } else if (framework == 18 && power == 9) { framework = 18; power = 12; } else if (framework == 18 && power == 10) { framework = 18; power = 11; } else if (framework == 18 && power == 11) { framework = 18; power = 4; } else if (framework == 18 && power == 12) { framework = 18; power = 5; } else if (framework == 18 && power == 14) { framework = 18; power = 15; } else if (framework == 18 && power == 15) { framework = 18; power = 14; } else if (framework == 18 && power == 17) { framework = 18; power = 18; } else if (framework == 18 && power == 18) { framework = 18; power = 19; } else if (framework == 18 && power == 19) { framework = 18; power = 17; } else if (framework == 19 && power == 5) { framework = 19; power = 7; } else if (framework == 19 && power == 6) { framework = 19; power = 8; } else if (framework == 19 && power == 7) { framework = 19; power = 9; } else if (framework == 19 && power == 8) { framework = 19; power = 5; } else if (framework == 19 && power == 9) { framework = 19; power = 10; } else if (framework == 19 && power == 10) { framework = 19; power = 12; } else if (framework == 19 && power == 11) { framework = 19; power = 13; } else if (framework == 19 && power == 12) { framework = 19; power = 16; } else if (framework == 19 && power == 13) { framework = 19; power = 15; } else if (framework == 19 && power == 14) { framework = 19; power = 11; } else if (framework == 19 && power == 15) { framework = 19; power = 14; } else if (framework == 19 && power == 16) { framework = 19; power = 17; } else if (framework == 19 && power == 17) { framework = 19; power = 18; } else if (framework == 19 && power == 18) { framework = 19; power = 19; } else if (framework == 19 && power == 19) { framework = 19; power = 20; } else if (framework == 19 && power == 20) { framework = 19; power = 23; } else if (framework == 19 && power == 21) { framework = 19; power = 24; } else if (framework == 19 && power == 22) { framework = 19; power = 21; } else if (framework == 19 && power == 23) { framework = 19; power = 22; } else if (framework == 19 && power == 25) { framework = 19; power = 26; } else if (framework == 19 && power == 26) { framework = 19; power = 27; } else if (framework == 19 && power == 27) { framework = 19; power = 28; } else if (framework == 19 && power == 28) { framework = 19; power = 29; } else if (framework == 19 && power == 29) { framework = 19; power = 30; } else if (framework == 19 && power == 30) { framework = 19; power = 31; } else if (framework == 19 && power == 31) { framework = 19; power = 32; } else if (framework == 19 && power == 32) { framework = 19; power = 33; } else if (framework == 19 && power == 33) { framework = 19; power = 34; } else if (framework == 19 && power == 34) { framework = 19; power = 35; } else if (framework == 20 && power == 4) { framework = 20; power = 5; } else if (framework == 20 && power == 5) { framework = 20; power = 4; } else if (framework == 20 && power == 7) { framework = 20; power = 8; } else if (framework == 20 && power == 8) { framework = 20; power = 9; } else if (framework == 20 && power == 9) { framework = 20; power = 7; } else if (framework == 20 && power == 11) { framework = 20; power = 12; } else if (framework == 20 && power == 12) { framework = 20; power = 13; } else if (framework == 20 && power == 13) { framework = 20; power = 11; } else if (framework == 20 && power == 20) { framework = 20; power = 21; } else if (framework == 20 && power == 21) { framework = 20; power = 20; } else if (framework == 21 && power == 4) { framework = 21; power = 5; } else if (framework == 21 && power == 5) { framework = 21; power = 6; } else if (framework == 21 && power == 6) { framework = 21; power = 7; } else if (framework == 21 && power == 7) { framework = 21; power = 8; } else if (framework == 21 && power == 8) { framework = 21; power = 9; } else if (framework == 21 && power == 9) { framework = 21; power = 10; } else if (framework == 21 && power == 10) { framework = 21; power = 11; } else if (framework == 21 && power == 11) { framework = 21; power = 12; } else if (framework == 21 && power == 12) { framework = 21; power = 4; } else if (framework == 21 && power == 15) { framework = 21; power = 17; } else if (framework == 21 && power == 16) { framework = 21; power = 15; } else if (framework == 21 && power == 17) { framework = 21; power = 16; } else if (framework == 21 && power == 18) { framework = 21; power = 21; } else if (framework == 21 && power == 21) { framework = 21; power = 18; } else if (framework == 21 && power == 24) { framework = 21; power = 25; } else if (framework == 21 && power == 25) { framework = 21; power = 24; } else if (framework == 21 && power == 32) { framework = 21; power = 33; } else if (framework == 21 && power == 33) { framework = 21; power = 32; } else if (framework == 22 && power == 2) { framework = 22; power = 6; } else if (framework == 22 && power == 3) { framework = 22; power = 2; } else if (framework == 22 && power == 4) { framework = 22; power = 3; } else if (framework == 22 && power == 5) { framework = 22; power = 8; } else if (framework == 22 && power == 6) { framework = 22; power = 7; } else if (framework == 22 && power == 7) { framework = 22; power = 4; } else if (framework == 22 && power == 8) { framework = 22; power = 5; } else if (framework == 22 && power == 10) { framework = 22; power = 11; } else if (framework == 22 && power == 11) { framework = 22; power = 12; } else if (framework == 22 && power == 12) { framework = 22; power = 13; } else if (framework == 22 && power == 13) { framework = 22; power = 10; } else if (framework == 22 && power == 21) { framework = 22; power = 29; } else if (framework == 22 && power == 22) { framework = 22; power = 30; } else if (framework == 22 && power == 23) { framework = 22; power = 21; } else if (framework == 22 && power == 24) { framework = 22; power = 22; } else if (framework == 22 && power == 25) { framework = 22; power = 31; } else if (framework == 22 && power == 26) { framework = 22; power = 32; } else if (framework == 22 && power == 27) { framework = 22; power = 33; } else if (framework == 22 && power == 28) { framework = 22; power = 34; } else if (framework == 22 && power == 29) { framework = 22; power = 23; } else if (framework == 22 && power == 30) { framework = 22; power = 24; } else if (framework == 22 && power == 31) { framework = 22; power = 25; } else if (framework == 22 && power == 32) { framework = 22; power = 26; } else if (framework == 22 && power == 33) { framework = 22; power = 27; } else if (framework == 22 && power == 34) { framework = 22; power = 28; } else if (framework == 22 && power == 36) { framework = 22; power = 38; } else if (framework == 22 && power == 38) { framework = 22; power = 36; } else if (framework == 22 && power == 43) { framework = 22; power = 44; } else if (framework == 22 && power == 44) { framework = 22; power = 43; } else if (framework == 23 && power == 1) { framework = 23; power = 2; } else if (framework == 23 && power == 2) { framework = 23; power = 1; } else if (framework == 23 && power == 5) { framework = 23; power = 8; } else if (framework == 23 && power == 8) { framework = 23; power = 12; } else if (framework == 23 && power == 9) { framework = 23; power = 10; } else if (framework == 23 && power == 10) { framework = 23; power = 11; } else if (framework == 23 && power == 11) { framework = 23; power = 13; } else if (framework == 23 && power == 12) { framework = 23; power = 14; } else if (framework == 23 && power == 13) { framework = 23; power = 9; } else if (framework == 23 && power == 14) { framework = 23; power = 15; } else if (framework == 23 && power == 15) { framework = 23; power = 16; } else if (framework == 23 && power == 16) { framework = 23; power = 5; } else if (framework == 23 && power == 18) { framework = 23; power = 19; } else if (framework == 23 && power == 19) { framework = 23; power = 20; } else if (framework == 23 && power == 20) { framework = 23; power = 25; } else if (framework == 23 && power == 21) { framework = 23; power = 26; } else if (framework == 23 && power == 25) { framework = 23; power = 21; } else if (framework == 23 && power == 26) { framework = 23; power = 18; } else if (framework == 23 && power == 34) { framework = 23; power = 35; } else if (framework == 23 && power == 35) { framework = 23; power = 34; } else if (framework == 24 && power == 4) { framework = 24; power = 5; } else if (framework == 24 && power == 5) { framework = 24; power = 6; } else if (framework == 24 && power == 6) { framework = 24; power = 4; } else if (framework == 24 && power == 9) { framework = 24; power = 11; } else if (framework == 24 && power == 10) { framework = 24; power = 9; } else if (framework == 24 && power == 11) { framework = 24; power = 10; } else if (framework == 24 && power == 17) { framework = 24; power = 22; } else if (framework == 24 && power == 19) { framework = 24; power = 17; } else if (framework == 24 && power == 21) { framework = 24; power = 18; } else if (framework == 24 && power == 22) { framework = 24; power = 21; } else if (framework == 24 && power == 24) { framework = 24; power = 19; } else if (framework == 24 && power == 31) { framework = 24; power = 32; } else if (framework == 24 && power == 32) { framework = 24; power = 31; }

                            dataArr[i] = numToUrlCode(framework);
                            dataArr[i+1] = numToUrlCode(power);
                            inc = 4; break;
                        case 27: case 28: case 29: inc = 4; break;
                    }
                    i += inc; pos++;
                }
            }

            // --- STANDARD SEQUENTIAL DECODING ---
            let i = 0;
            let plainTextBuild = {
                stats: { primary: null, sec1: null, sec2: null },
                powers: [],
                specs: { primary: null, sec1: null, sec2: null, mastery: null, perks: [] },
                devices: [null, null, null, null, null],
                role: null
            };

            const statMap = { 1: "Strength", 2: "Dexterity", 3: "Constitution", 4: "Intelligence", 5: "Ego", 6: "Presence", 7: "Recovery", 8: "Endurance" };

            // 0: Archetype
            i++;

            // 1-3: Super Stats
            if (i < dataArr.length) plainTextBuild.stats.primary = statMap[urlCodeToNum(dataArr[i++])] || null;
            if (i < dataArr.length) plainTextBuild.stats.sec1 = statMap[urlCodeToNum(dataArr[i++])] || null;
            if (i < dataArr.length) plainTextBuild.stats.sec2 = statMap[urlCodeToNum(dataArr[i++])] || null;

            // 4: Innate (2 chars)
            i += 2;

            // 5-10: Talents (6 chars)
            i += 6;

            let travelPowersExtracted = [];
            // 11-12: Travel Powers
            for(let tp=0; tp<2; tp++) {
                if (i + 1 >= dataArr.length) break;
                let tpId = urlCodeToNum(dataArr[i++]);
                let m1 = dataArr[i++];
                let pMask = urlCodeToNum(m1) << 1;

                if (typeof dataTravelPower !== 'undefined' && dataTravelPower[tpId] && dataTravelPower[tpId].desc) {
                    let powerData = { name: cleanText(dataTravelPower[tpId].desc), advantages: [] };
                    if (pMask > 0 && dataTravelPower[tpId].advantageList) {
                        for (let bit = 1; bit < dataTravelPower[tpId].advantageList.length; bit++) {
                            let test = Math.pow(2, bit);
                            if ((pMask & test) === test && dataTravelPower[tpId].advantageList[bit]) {
                                let advName = cleanText(dataTravelPower[tpId].advantageList[bit].desc || dataTravelPower[tpId].advantageList[bit].name);
                                if (advName === "R2") advName = "Rank 2";
                                if (advName === "R3") advName = "Rank 3";
                                powerData.advantages.push(advName);
                            }
                        }
                    }
                    travelPowersExtracted.push(powerData);
                }
            }

            let activePowersExtracted = [];
            // 13-26: Active Powers
            for(let p=0; p<14; p++) {
                if (i + 3 >= dataArr.length) break;
                let framework = urlCodeToNum(dataArr[i++]);
                let powerIdx = urlCodeToNum(dataArr[i++]);
                let m1 = dataArr[i++];
                let m2 = dataArr[i++];
                let pMask = urlCodeToNum2(m1 + m2) << 1;

                // V1 Night Warrior Historical Shift
                if (version === 1) {
                    if (framework == 11 && powerIdx == 27) powerIdx = 15;
                    else if (framework == 12 && powerIdx == 31) powerIdx = 16;
                    else if (framework == 13 && powerIdx == 31) powerIdx = 17;
                    else if (framework == 14 && powerIdx == 30) powerIdx = 17;
                    else if ((framework == 11 && powerIdx >= 15 && powerIdx <= 26)
                          || (framework == 12 && powerIdx >= 16 && powerIdx <= 30)
                          || (framework == 13 && powerIdx >= 17 && powerIdx <= 30)
                          || (framework == 14 && powerIdx >= 17 && powerIdx <= 29)) {
                        powerIdx++;
                    }
                }

                let balakPower = null;
                for (let j = 0; j < dataPower.length; j++) {
                    if (dataPower[j] && dataPower[j].framework === framework && dataPower[j].power === powerIdx) {
                        balakPower = dataPower[j];
                        break;
                    }
                }

                if (balakPower && balakPower.desc) {
                    let powerData = { name: cleanText(balakPower.desc), advantages: [] };
                    if (pMask > 0 && balakPower.advantageList) {
                        for (let bit = 1; bit < balakPower.advantageList.length; bit++) {
                            let test = Math.pow(2, bit);
                            if ((pMask & test) === test && balakPower.advantageList[bit]) {
                                let advName = cleanText(balakPower.advantageList[bit].desc || balakPower.advantageList[bit].name);
                                if (advName === "R2") advName = "Rank 2";
                                if (advName === "R3") advName = "Rank 3";
                                powerData.advantages.push(advName);
                            }
                        }
                    }
                    activePowersExtracted.push(powerData);
                }
            }

            // Push Active Powers first, then append Travel Powers
            for(let p = 0; p < activePowersExtracted.length; p++) plainTextBuild.powers.push(activePowersExtracted[p]);
            for(let tp = 0; tp < travelPowersExtracted.length; tp++) plainTextBuild.powers.push(travelPowersExtracted[tp]);
            plainTextBuild.powers = plainTextBuild.powers.slice(0, 14);

            // 27-29: Specs
            if (typeof dataSpecializationTree !== 'undefined') {
                let specBlocks = [];
                for(let s=1; s<=3; s++) {
                    if (i + 3 >= dataArr.length) break;
                    specBlocks.push(urlCodeToNum4(dataArr[i++] + dataArr[i++] + dataArr[i++] + dataArr[i++]));
                }

                if (specBlocks.length > 0) {
                    let masteryChoice = specBlocks[0] ? (specBlocks[0] & 15) : 0;

                    for (let s=1; s<=3; s++) {
                        if (s - 1 >= specBlocks.length) break;
                        let specNum = specBlocks[s-1];
                        let allocations = specNum >> 4;
                        let treeID = specNum & 15;
                        let treeName = null;

                        if (s === 1) {
                            treeName = plainTextBuild.stats.primary;
                        } else {
                            if (treeID > 0 && dataSpecializationTree[treeID + 8]) {
                                treeName = cleanText(dataSpecializationTree[treeID + 8].desc);
                            } else if (treeID > 0 && dataSpecializationTree[treeID]) {
                                treeName = cleanText(dataSpecializationTree[treeID].desc);
                            }
                        }

                        if (treeName) {
                            let treeKey = (s === 1) ? 'primary' : (s === 2) ? 'sec1' : 'sec2';
                            plainTextBuild.specs[treeKey] = treeName;

                            let balakTree = null;
                            for (let t = 0; t < dataSpecializationTree.length; t++) {
                                if (dataSpecializationTree[t] && dataSpecializationTree[t].desc && cleanText(dataSpecializationTree[t].desc).toLowerCase() === treeName.toLowerCase()) {
                                    balakTree = dataSpecializationTree[t];
                                    break;
                                }
                            }

                            if (balakTree && balakTree.specializationList) {
                                for (let pIdx = 0; pIdx < 8; pIdx++) {
                                    let pts = (allocations >> (pIdx * 2)) & 3; 
                                    if (pts > 0 && balakTree.specializationList[pIdx]) {
                                        plainTextBuild.specs.perks.push({
                                            treeName: treeName,
                                            perkName: cleanText(balakTree.specializationList[pIdx].desc || balakTree.specializationList[pIdx].name),
                                            points: pts
                                        });
                                    }
                                }
                                
                                let isMasteryHere = (masteryChoice === s);
                                if (isMasteryHere && balakTree.specializationList[8]) {
                                    plainTextBuild.specs.mastery = cleanText(balakTree.specializationList[8].desc || balakTree.specializationList[8].name);
                                }
                            }
                        }
                    }
                }
            }

            console.log("BALAK TRANSLATOR OUTPUT:", plainTextBuild);
            return plainTextBuild;
        }
    };
})();