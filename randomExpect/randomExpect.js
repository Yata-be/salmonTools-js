(() => {
    let weapons = document.getElementById("weapons");
    let waves = document.getElementById("waves");
    const button = document.getElementById("btn");
    let error = document.getElementById("error");
    let print1 = document.getElementById("print1");
    let print2 = document.getElementById("print2");
    let print3 = document.getElementById("print3");
    let overview1 = document.getElementById("overview1");
    let overview2 = document.getElementById("overview2");
    let exp = document.getElementById("exp");

    // クマを除いたブキ種類数が変更されたら更新
    const weaponTypeCount = 55;
    const maxWaves = 700;

    button.addEventListener("click", () => {
        print1.textContent = "";
        print2.textContent = "";
        print3.textContent = "";

        const weaponsCount = Number(weapons.value);
        const wavesCount = Number(waves.value);

        // バリデーション
        if (!Number.isInteger(weaponsCount) || !Number.isInteger(wavesCount)) {
            error.textContent = "ブキ数やWave数は整数値で入力してください。";
            return;
        }
        if (weaponsCount < 0 || weaponsCount > weaponTypeCount) {
            error.textContent = "ブキ数は0以上" + weaponTypeCount + "以下で入力してください。";
            return;
        }
        if (wavesCount < 1 || wavesCount > maxWaves) {
            error.textContent = "Wave数は1以上" + maxWaves + "以下で入力してください。";
            return;
        }
        if (wavesCount < weaponsCount) {
            error.textContent = "Wave数はブキ種類数以上にしてください。";
            return;
        }
        error.textContent = "";

        const table = probTable(weaponTypeCount, maxWaves)[wavesCount];
        const sum = table.reduce((s, e, i) => i >= weaponsCount ? s + e : s, 0);

        if (sum >= 0.5) {
            print1.textContent = "あなたの運は下振れしています。下振れ度：";
            print2.textContent = Math.round((sum - 0.5) * 200).toString();
            print3.textContent = "";
        } else {
            print1.textContent = "あなたの運は上振れしています。上振れ度：";
            print2.textContent = "";
            print3.textContent = Math.round((0.5 - sum) * 200).toString();
        }

        const sumDisplay = Math.round(sum * 100);
        overview1.textContent = wavesCount + " Wavesで "
            + weaponsCount + " 種類以上コンプできる確率は "
            + sumDisplay;
        // TODO: 指数表現実装
        exp.textContent = "";
        overview2.textContent = "% です。";

        // console.log(calcExpectation(weaponTypeCount, weaponsCount, maxWaves));
    })
})();

// 確率テーブルの作成 probTable[i][j] = i回引いたときにj種類になる確率
function probTable(weaponTypeCount, maxWaves) {
    const kumaProb = 0.2;
    const otherProb = 0.8 / weaponTypeCount;

    const coef = new Array(weaponTypeCount + 1).fill(0)
        .map((v, i) => kumaProb + i * otherProb);
    const firstProb = new Array(weaponTypeCount + 1);
    firstProb.fill(0);
    firstProb[0] = 1;
    const probTable = [];
    probTable.push(firstProb);

    for (let i = 0; i < maxWaves; i++) {
        const prevProb = probTable.slice(-1)[0];
        const currentProb = [];

        for (let j = 0; j < weaponTypeCount + 1; j++) {
            currentProb.push(j === 0
                ? prevProb[j] * coef[j]
                : prevProb[j] * coef[j] + prevProb[j - 1] * (1 - coef[j - 1]));
        }

        probTable.push(currentProb);
    }
    return probTable;
}

// startWeapons種類コンプしている状態で、あと何回でコンプできるかの期待値
function calcExpectation(weaponTypeCount, startWeapons) {
    // コーナーケース排除
    if (weaponTypeCount <= 0 || startWeapons < 0) {
        throw new Error("数値が不正です");
    }
    if (weaponTypeCount < startWeapons) {
        throw new Error("現在の種類数が全種類数より多いです");
    }
    if (weaponTypeCount === startWeapons) {
        return 0;
    }

    const maxWaves = 700;
    const otherProb = 0.8 / weaponTypeCount;
    const startProb = 0.2 + startWeapons * otherProb;
    const arrayLength = weaponTypeCount - startWeapons + 1;

    const coef = new Array(arrayLength).fill(0)
        .map((v, i) => startProb + i * otherProb);
    let prob = new Array(arrayLength);
    prob.fill(0);
    prob[0] = 1;

    let sum = 0;
    for (let i = 0; i < maxWaves; i++) {
        const currentProb = [];

        for (let j = 0; j < arrayLength; j++) {
            currentProb.push(j === 0
                ? prob[j] * coef[j]
                : prob[j] * coef[j] + prob[j - 1] * (1 - coef[j - 1]));
            if (j === arrayLength - 1) {
                // 期待値 = (試行回数) * (ちょうどコンプする確率) を加算
                sum += (i + 1) * prob[j - 1] * (1 - coef[j - 1]);
            }
        }

        prob = currentProb;
    }
    return Math.round(sum);
}