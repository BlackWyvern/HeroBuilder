/* ==============================================================================
 * custom-additions.js
 * ============================================================================== */

const CustomContent = {
    powersets: [],
    powers: [
        { id: "custom_pwr_violent_roar", set: "bestial_supernatural", name: "Violent Roar", tier: 2, desc: "", adv: [ { name: "Blood Roar", cost: 2 }, { name: "Fearsome Howl", cost: 2 } ] },
        { id: "custom_pwr_rock_formation", set: "earth", name: "Rock Formation", tier: 1, desc: "", adv: [ { name: "Suffocating Earth", cost: 2 }, { name: "Expanding Earth", cost: 1 }, { name: "Accelerated Metabolism", cost: 1 }, { name: "Challenge!", cost: 1 } ] },
        { id: "custom_pwr_shadow_scheme", set: "darkness", name: "Shadow Scheme", tier: 2, desc: "", adv: [ { name: "Accelerated Metabolism", cost: 1 } ] },
        { id: "custom_pwr_neuroelectric_pulse", set: "electricity", name: "Neuroelectric Pulse", tier: 2, desc: "", adv: [ { name: "Recharge", cost: 2 }, { name: "Accelerated Metabolism", cost: 1 }, { name: "Challenge!", cost: 1 } ] },
        { id: "custom_pwr_high_voltage", set: "electricity", name: "High Voltage", tier: 3, desc: "", adv: [ { name: "Power Consumption", cost: 2 }, { name: "Accelerated Metabolism", cost: 1 }, { name: "Challenge!", cost: 1 } ] },
        { id: "custom_pwr_impact_force", set: "force", name: "Impact Force", tier: 1, desc: "", adv: [] },
        { id: "custom_pwr_force_control", set: "force", name: "Force Control", tier: 1, desc: "", adv: [] },
        { id: "custom_pwr_vital_shielding", set: "force", name: "Vital Shielding", tier: 1, desc: "", adv: [] },
        { id: "custom_pwr_power_barrier", set: "force", name: "Power Barrier", tier: 2, desc: "", adv: [] },
        { id: "custom_pwr_shield_restoration", set: "force", name: "Shield Restoration", tier: 2, desc: "", adv: [ { name: "Dizzying Impact", cost: 2 }, { name: "Entropy Field", cost: 2 }, { name: "Accelerated Metabolism", cost: 1 } ] },
        { id: "custom_pwr_singularity_bomb", set: "force", name: "Singularity Bomb", tier: 3, desc: "", adv: [ { name: "Overwhelming Force", cost: 2 }, { name: "Accelerated Metabolism", cost: 1 }, { name: "Challenge!", cost: 1 } ] },
        { id: "custom_pwr_winter_gale", set: "ice", name: "Winter Gale", tier: 2, desc: "", adv: [ { name: "Gathering Storm", cost: 2 }, { name: "Hailstorm", cost: 2 }, { name: "Challenge!", cost: 1 }, { name: "Accelerated Metabolism", cost: 1 } ] },
        { id: "custom_pwr_lightwave", set: "laser_sword", name: "Lightwave", tier: 2, desc: "", adv: [ { name: "Illuminate", cost: 2 }, { name: "Bad Footing", cost: 2 }, { name: "Accelerated Metabolism", cost: 1 }, { name: "Challenge!", cost: 1 } ] },
        { id: "custom_pwr_scorpion_sting", set: "fighting_claws", name: "Scorpion Sting", tier: 1, desc: "", adv: [ { name: "Sudden Strike", cost: 2 }, { name: "Trauma", cost: 2 }, { name: "Stop Right There!", cost: 2 }, { name: "Accelerated Metabolism", cost: 1 }, { name: "Break Through", cost: 3 }, { name: "Challenge!", cost: 1 } ] },
        { id: "custom_pwr_spitting_cobra", set: "fighting_claws", name: "Spitting Cobra", tier: 1, desc: "", adv: [ { name: "Pin Down", cost: 2 }, { name: "Sharp Edges", cost: 2 }, { name: "Nailed to the Ground", cost: 2 }, { name: "Accelerated Metabolism", cost: 1 }, { name: "Break Through", cost: 3 }, { name: "Challenge!", cost: 1 } ] },
        { id: "custom_pwr_heel_smash", set: "might", name: "Heel Smash", tier: 1, desc: "", adv: [ { name: "Reckless Endangerment", cost: 2 }, { name: "Sonic Reverberations", cost: 2 }, { name: "Dizzying Impact", cost: 2 }, { name: "Accelerated Metabolism", cost: 1 }, { name: "Challenge!", cost: 1 } ] }
    ],
    existingPowerAdvantages: [
        { powerName: "Desperate Shot", adv: [ { name: "Frail Armor", cost: 2 } ] },
        { powerName: "Shred", adv: [ { name: "Scent of Blood", cost: 2 } ] },
        { powerName: "Feint", adv: [ { name: "Stop Right There!", cost: 2 } ] },
        { powerName: "Barbed Lariat", adv: [ { name: "Nailed to the Ground", cost: 2 } ] },
        { powerName: "Thrash", adv: [ { name: "Vicious", cost: 3 }, { name: "Open Wound", cost: 2 } ] },
        { powerName: "Howl", adv: [ { name: "Wild Strikes", cost: 2 } ] },
        { powerName: "Tear Down", adv: [ { name: "Open Wound", cost: 2 }, { name: "Unrelenting", cost: 2 } ] },
        { powerName: "Brutal Charge", adv: [ { name: "Accelerated Metabolism", cost: 1 }, { name: "Break Through", cost: 3 }, { name: "Challenge!", cost: 1 } ] },
        { powerName: "Rebuke", adv: [ { name: "Challenge!", cost: 1 } ] },
        { powerName: "Shadow Blast", adv: [ { name: "Back to the Darkness", cost: 2 } ] },
        { powerName: "Dimensional Collapse", adv: [ { name: "Envelop in Darkness", cost: 2 } ] },
        { powerName: "Shadow Eruption", adv: [ { name: "Envelop in Shadows", cost: 2 } ] },
        { powerName: "Cave In", adv: [ { name: "Sinkhole", cost: 2 } ] },
        { powerName: "Sparkstorm", adv: [ { name: "Particle Storm", cost: 2 } ] },
        { powerName: "Storm Cloud", adv: [ { name: "Accelerated Metabolism", cost: 1 }, { name: "Challenge!", cost: 1 } ] },
        { powerName: "Fireball", adv: [ { name: "Explosive", cost: 2 } ] },
        { powerName: "Tractor Beam", adv: [ { name: "Accelerated Metabolism", cost: 1 } ] },
        { powerName: "Tanglecoil Launcher", adv: [ { name: "Accelerated Metabolism", cost: 1 } ] },
        { powerName: "Throwing Blades", adv: [ { name: "Accelerated Metabolism", cost: 1 } ] },
        { powerName: "Bolas", adv: [ { name: "Accelerated Metabolism", cost: 1 } ] },
        { powerName: "Electro Magnet", adv: [ { name: "Accelerated Metabolism", cost: 1 } ] },
        { powerName: "Sonic Beam", adv: [ { name: "Accelerated Metabolism", cost: 1 }, { name: "Challenge!", cost: 1 } ] },
        { powerName: "Pulse Beam Rifle", adv: [ { name: "Time Alteration", cost: 2 } ] },
        { powerName: "Plasma Cannon", adv: [ { name: "Accelerated Metabolism", cost: 1 }, { name: "Challenge!", cost: 1 } ] },
        { powerName: "Experimental Blaster", adv: [ { name: "Accelerated Metabolism", cost: 1 } ] },
        { powerName: "Energy Blaster", adv: [ { name: "Accelerated Metabolism", cost: 1 } ] },
        { powerName: "Particle Blaster", adv: [ { name: "Accelerated Metabolism", cost: 1 }, { name: "Challenge!", cost: 1 } ] },
        { powerName: "Entangling Mesh", adv: [ { name: "Accelerated Metabolism", cost: 1 } ] },
        { powerName: "Nanobot Swarm", adv: [ { name: "Rejuvenating Injectors", cost: 2 } ] },
        { powerName: "Plasma Radiation", adv: [ { name: "Accelerated Metabolism", cost: 1 }, { name: "Challenge!", cost: 1 } ] },
        { powerName: "Bludgeon", adv: [ { name: "Fiery Blade", cost: 1 } ] },
        { powerName: "Guard", adv: [ { name: "Weapon Cover", cost: 3 } ] },
        { powerName: "Brute Strike", adv: [ { name: "Stop Right There!", cost: 2 } ] },
        { powerName: "Wrathful Blade", adv: [ { name: "Giant Growth", cost: 0 } ] },
        { powerName: "Skewer", adv: [ { name: "Sharpened Blade", cost: 1 } ] },
        { powerName: "Shatter", adv: [ { name: "Accelerated Metabolism", cost: 1 } ] },
        { powerName: "Ice Cage", adv: [ { name: "Nailed to the Ground", cost: 2 }, { name: "Accelerated Metabolism", cost: 1 } ] },
        { powerName: "Ice Burst", adv: [ { name: "Accelerated Metabolism", cost: 1 } ] },
        { powerName: "Snow Storm", adv: [ { name: "Challenge!", cost: 1 } ] },
        { powerName: "Devour Essence", adv: [ { name: "Devour Soul", cost: 3 }, { name: "Viral", cost: 2 } ] },
        { powerName: "Vile Lariat", adv: [ { name: "Nailed to the Ground", cost: 2 } ] },
        { powerName: "Epidemic", adv: [ { name: "Plague", cost: 2 } ] },
        { powerName: "Curse", adv: [ { name: "Jinx", cost: 2 } ] },
        { powerName: "Defile", adv: [ { name: "Lethal Poison", cost: 2 } ] },
        { powerName: "Eye Lasers", adv: [ { name: "Disintegration Ray", cost: 2 }, { name: "Radioactive Decay", cost: 2 }, { name: "Blinding Shot", cost: 2 }, { name: "Download", cost: 2 }, { name: "Accelerated Metabolism", cost: 1 }, { name: "Challenge!", cost: 1 } ] },
        { powerName: "Particle Smash", adv: [ { name: "Data Leak", cost: 2 } ] },
        { powerName: "Glance", adv: [ { name: "Stop Right There!", cost: 2 } ] },
        { powerName: "Viper's Fangs", adv: [ { name: "Cobra Strike", cost: 2 }, { name: "Penetrating Strikes", cost: 2 }, { name: "Poised To Strike", cost: 1 }, { name: "Deadly Fangs", cost: 2 } ] },
        { powerName: "Leopard’s Leap", adv: [ { name: "Sudden Strike", cost: 2 }, { name: "Nailed to the Ground", cost: 2 }, { name: "Accelerated Metabolism", cost: 1 }, { name: "Break Through", cost: 3 }, { name: "Challenge!", cost: 1 } ] },
        { powerName: "Counterattack", adv: [ { name: "Retribution", cost: 2 } ] },
        { powerName: "Dragon's Claws", adv: [ { name: "Furious Rush", cost: 2 } ] },
        { powerName: "Scarlet Arc", adv: [ { name: "Rending Blades", cost: 2 }, { name: "Head Trauma", cost: 2 }, { name: "Accelerated Metabolism", cost: 1 }, { name: "Challenge!", cost: 1 } ] },
        { powerName: "Rend and Tear", adv: [ { name: "No Code Of Conduct", cost: 2 }, { name: "Shred To Pieces", cost: 2 } ] },
        { powerName: "Eagle’s Grasp", adv: [ { name: "Night Hunt", cost: 2 }, { name: "Silent Predation", cost: 2 }, { name: "Work Up", cost: 2 }, { name: "Accelerated Metabolism", cost: 1 }, { name: "Break Through", cost: 3 }, { name: "Challenge!", cost: 1 } ] },
        { powerName: "Tiger's Bite", adv: [ { name: "Challenge!", cost: 1 } ] },
        { powerName: "Swift Strike", adv: [ { name: "Stop Right There!", cost: 2 } ] },
        { powerName: "Crashing Wave Kick", adv: [ { name: "Stop Right There!", cost: 2 } ] },
        { powerName: "Head Butt", adv: [ { name: "Stop Right There!", cost: 2 } ] },
        { powerName: "Call To Battle", adv: [ { name: "Advance!", cost: 1 } ] },
        { powerName: "Impressive Physique", adv: [ { name: "Superiority Complex", cost: 2 } ] },
        { powerName: "Shockwave", adv: [ { name: "Wreckling Ball", cost: 2 } ] },
        { powerName: "Haymaker", adv: [ { name: "Reckless Strike", cost: 2 } ] },
        { powerName: "Gunslinger", adv: [ { name: "Accelerated Metabolism", cost: 1 } ] },
        { powerName: "Dual Submachinegun", adv: [ { name: "Accelerated Metabolism", cost: 1 }, { name: "Break Through", cost: 3 }, { name: "Challenge!", cost: 1 } ] },
        { powerName: "Gatling Gun", adv: [ { name: "Single Minded", cost: 2 } ] },
        { powerName: "Chest Rocket Assault", adv: [ { name: "Accelerated Metabolism", cost: 1 }, { name: "Challenge!", cost: 1 } ] },
        { powerName: "Mini Gun", adv: [ { name: "Infared Guidance System", cost: 1 } ] },
        { powerName: "Redirected Force", adv: [ { name: "Hold The Line", cost: 1 } ] },
        { powerName: "Shuriken Throw", adv: [ { name: "Slicer", cost: 2 }, { name: "Shadow Attack", cost: 2 } ] },
        { powerName: "Caltrops Tashibishi", adv: [ { name: "Spikes", cost: 2 } ] },
        { powerName: "Shuriken Sweep", adv: [ { name: "Shadow Attack", cost: 2 }, { name: "Accelerated Metabolism", cost: 1 }, { name: "Challenge!", cost: 1 } ] },
        { powerName: "Eldritch Bolts", adv: [ { name: "Wizard's Discretion", cost: 2 } ] },
        { powerName: "Skarn's Bane", adv: [ { name: "Tranced", cost: 2 } ] },
        { powerName: "Banish", adv: [ { name: "Shield Dispersal", cost: 2 } ] },
        { powerName: "Star Barrage", adv: [ { name: "Mystical", cost: 2 } ] },
        { powerName: "Ego Blade Astonish", adv: [ { name: "Stop Right There!", cost: 2 } ] },
        { powerName: "Ego Sprites", adv: [ { name: "Illumination", cost: 2 }, { name: "Psionic Amplification", cost: 2 } ] },
        { powerName: "Shadow of Doubt", adv: [ { name: "Challenge!", cost: 1 } ] },
        { powerName: "Mindful Reinforcement", adv: [ { name: "Breakout", cost: 2 } ] },
        { powerName: "Typhoon", adv: [ { name: "Accelerated Metabolism", cost: 1 } ] },
        { powerName: "Force Eruption", adv: [ { name: "Field Expulsion", cost: 3 } ] },
        { powerName: "Protection Field", adv: [ { name: "Breakout", cost: 1 } ] },
        { powerName: "Force Snap", adv: [ { name: "Accelerated Metabolism", cost: 1 } ] },
        { powerName: "Crushing Wave", adv: [ { name: "Entropy Field", cost: 2 }, { name: "Barrier", cost: 2 } ] },
        { powerName: "Force Bolts", adv: [ { name: "Entropy Blast", cost: 2 } ] },
        { powerName: "Force Blast", adv: [ { name: "Demolishing Blast", cost: 2 }, { name: "Shield Generator", cost: 2 } ] },
        { powerName: "Containment Field", adv: [ { name: "Shield Dispersal", cost: 2 } ] },
        { powerName: "Force Geyser", adv: [ { name: "Entropy Field", cost: 2 }, { name: "Bruiser", cost: 2 } ] },
        { powerName: "Force Cascade", adv: [ { name: "Focus Point", cost: 2 }, { name: "Field Inversion", cost: 2 } ] },
        { powerName: "Force Detonation", adv: [ { name: "Gravitational Pull", cost: 2 }, { name: "Recharge", cost: 2 } ] },
        { powerName: "Gravitic Ripple", adv: [ { name: "Inverse Polarity", cost: 2 }, { name: "Center of Gravity", cost: 2 }, { name: "Accelerated Metabolism", cost: 1 } ] }
    ],
    devices: [],
    variants: []
};

// ⚡ THE MASTER COORDINATE MAP 
const SpriteMap = {
    "Violent Roar": { x: 160, y: 210 }, 
    "Rock Formation": { x: 96, y: 126 },
    "Shadow Scheme": { x: 32, y: 252 },
    "Neuroelectric Pulse": { x: 96, y: 0 },
    "High Voltage": { x: 0, y: 0 }, 
    "Impact Force": { x: 32, y: 84 },
    "Force Control": { x: 0, y: 84 },
    "Vital Shielding": { x: 128, y: 84 },
    "Power Barrier": { x: 64, y: 84 },
    "Shield Restoration": { x: 96, y: 84 },
    "Singularity Bomb": { x: 192, y: 84 },
    "Winter Gale": { x: 0, y: 294 },
    "Lightwave": { x: 0, y: 252 },
    "Scorpion Sting": { x: 128, y: 42 },
    "Spitting Cobra": { x: 224, y: 42 },
    "Heel Smash": { x: 64, y: 210 },
    "Technological Prowess": { x: 160, y: 168 },
    "Technological Advancements": { x: 128, y: 168 },
    "Energy Blaster": { x: 32, y: 126 },
    "Sonic Beam": { x: 64, y: 168 },
    "Particle Blaster": { x: 192, y: 126 },
    "Detonator Switch": { x: 224, y: 84 },
    "Plasma Cannon": { x: 128, y: 126 },
    "Plasma Radiation": { x: 160, y: 126 },
    "Cloaking Device": { x: 160, y: 84 },
    "Electro Magnet": { x: 0, y: 126 },
    "Medical Beam": { x: 64, y: 126 },
    "Radiation Poisoning": { x: 0, y: 168 },
    "Radiation Suit": { x: 224, y: 126 },
    "Radiation Shield": { x: 32, y: 168 },
    "Sound Amplification": { x: 96, y: 168 },
    "Eye Lasers": { x: 0, y: 336 },
    "Shuriken Sweep": { x: 0, y: 462 },
    "Caltrops Tashibishi": { x: 0, y: 420 },
    "Counterattack": { x: 0, y: 42 },
    "Leopard’s Leap": { x: 160, y: 42 },  
    "Eagle’s Grasp": { x: 32, y: 42 },   
    "Scarlet Arc": { x: 96, y: 42 },
    "Wrathful Blade": { x: 192, y: 168 },
    "Tornado": { x: 224, y: 0 },
    "Prismatic Detonation": { x: 192, y: 0 },
    "Shadow Strike": { x: 0, y: 378 },
    "Master of the Mind": { x: 64, y: 378 }, 
    "Endbringer's Grasp": { x: 32, y: 210 }, 
    "Chest Rocket Assault": { x: 96, y: 210 },
    "Dual Submachinegun": { x: 96, y: 336 },
    "Brutal Charge": { x: 64, y: 420 },
    "Concentration": { x: 128, y: 210 },
    "Storm Cloud": { x: 128, y: 0 },
    "Sundering Breath": { x: 160, y: 0 },
    "Cold Shoulder": { x: 224, y: 168 },
    "Pyromancer's Blades": { x: 0, y: 210 }, 
    "Electric Form": { x: 64, y: 0 }
};

// ==============================================================================
// THE INJECTOR ENGINE
// ==============================================================================
function injectCustomContent() {

    if (typeof powers !== 'undefined') {
        CustomContent.powers.forEach(customPower => {
            if (!customPower.adv) customPower.adv = [];
            if (!customPower.adv.some(a => a.name === "Rank 2")) customPower.adv.unshift({ name: "Rank 2", cost: 2 });
            if (!customPower.adv.some(a => a.name === "Rank 3")) customPower.adv.splice(1, 0, { name: "Rank 3", cost: 2 });
            powers.push(customPower);

            if (typeof HCData !== 'undefined' && HCData.power) {
                let nativeAdvList = [{ id: 0, name: null, points: null, dependency: null, toolTip: null }];
                customPower.adv.forEach((adv, index) => {
                    nativeAdvList.push({ id: index + 1, name: adv.name, points: adv.cost, dependency: null, toolTip: "Custom Advantage" });
                });
                let mockHCPower = { id: customPower.id, name: customPower.name, advantageList: nativeAdvList };
                HCData.power[customPower.id] = mockHCPower;
                HCData.power[customPower.id.replace('custom_pwr_', '')] = mockHCPower;
            }
        });

        CustomContent.existingPowerAdvantages.forEach(entry => {
            let searchName = entry.powerName.toLowerCase().replace(/[^a-z0-9]/g, '');
            let legacyPower = powers.find(p => p.name.toLowerCase().replace(/[^a-z0-9]/g, '') === searchName);
            if (legacyPower) {
                if (!legacyPower.adv) legacyPower.adv = [];
                entry.adv.forEach(newAdv => {
                    let exists = legacyPower.adv.some(a => a.name.toLowerCase().replace(/[^a-z0-9]/g, '') === newAdv.name.toLowerCase().replace(/[^a-z0-9]/g, ''));
                    if (!exists) legacyPower.adv.push(newAdv);
                });
            }
        });
    }

    if (typeof powers !== 'undefined') {
        powers.forEach(p => {
            if (SpriteMap[p.name]) {
                p.spriteX = SpriteMap[p.name].x;
                p.spriteY = SpriteMap[p.name].y;
                p.width = 32;
                p.height = 42;
                p.image = "newsprites.png"; 
                p.renderScale = 0.75; 
            }
        });
    }

    if (typeof HCData !== 'undefined' && HCData.power) {
        for (let k in HCData.power) {
            let p = HCData.power[k];
            if (p && SpriteMap[p.name]) {
                p.spriteX = SpriteMap[p.name].x;
                p.spriteY = SpriteMap[p.name].y;
                p.width = 32;
                p.height = 42;
                p.image = "newsprites.png"; 
                p.renderScale = 0.75; 
            }
        }
    }

    const advantagesToHide = {
        "Force Cascade": "Containment Blast",
        "Force Detonation": "Force Spate",
        "Particle Mine": "Ejector Module",
        "Two-Gun Mojo": "Bullet Spray",
        "Rend and Tear": "Drake's Deliverance",
        "Dragon's Claws": "Vertebreak"
    };

    if (typeof HCData !== 'undefined' && HCData.power) {
        for (let key in HCData.power) {
            let pwr = HCData.power[key];
            if (advantagesToHide[pwr.name]) {
                let targetAdvName = advantagesToHide[pwr.name];
                if (pwr.advantageList) {
                    pwr.advantageList.forEach(adv => {
                        if (adv.name === targetAdvName) {
                            adv.isHidden = true; 
                        }
                    });
                }
            }
        }
    }

    if (typeof powers !== 'undefined') {
        powers.forEach(pwr => {
            if (advantagesToHide[pwr.name]) {
                let targetAdvName = advantagesToHide[pwr.name];
                if (pwr.adv) {
                    pwr.adv.forEach(adv => {
                        if (adv.name === targetAdvName) {
                            adv.isHidden = true;
                        }
                    });
                }
            }
        });
    }
    
    // ⚡ 4. MASSIVE PERK HOTFIX (DESCRIPTIONS, POINTS, TIERS, AND CLEANUP)
    const perksToRemove = {
        "Ego": ["Mind over Matter"],
        "Avenger": ["Round 'em Up"],
        "Commander": ["Create An Opening"],
        "Arbiter": ["Arbiter Aura"],
        "Overseer": ["Overseer Aura"]
    };

    const specUpdates = {
        "Strength": {
            "Physical Peak": { desc: "Your Secondary Super Stats now grant a Cost Discount to your Melee powers." },
            "Quick Recovery": { desc: "Your Recovery increases your Health Regeneration. This effect only triggers while in combat.", maxPoints: 2 },
            "Aggression": { desc: "Increases the amount of Offense you receive from items by 10/20%.", maxPoints: 2 },
            "Balance": { desc: "Your Strength now grants Knock bonuses to your Ranged Knock powers, equal to 25% of the bonus it grants your Melee powers. However, this Specialization causes your Ego to no longer affect the Knock strength of your Ranged powers.", maxPoints: 2 },
            "Brutality": { maxPoints: 2 },
            "Strength Mastery": { desc: "You gain 20 Strength and 30 Offense.", maxPoints: 1 }
        },
        "Dexterity": {
            "Combat Training": { desc: "Offense now grants Critical Strike Rating." },
            "Expose Weakness": { desc: "Whenever you Critically Strike a foe, you reduce their Resistance to your attacks by 1/2% for 10 seconds. This effect stacks up to 5 times.", maxPoints: 2 },
            "Brush It Off": { maxPoints: 2 },
            "Power Swell": { maxPoints: 2 },
            "Evasion": { maxPoints: 2 },
            "Dexterity Mastery": { desc: "You gain 20 Dexterity and 10 Critical Severity and Avoidance Rating.", maxPoints: 1 }
        },
        "Constitution": {
            "Unyielding": { desc: "Your Constitution now increases your Hold Resistance.", maxPoints: 2 },
            "Fuel My Fire": { desc: "Taking damage grants you 2/4/6% of your Max Energy. This effect can only occur once per second." },
            "Tough": { desc: "Your Secondary Super Stats now provide an additional +0.25/0.50/0.75 Maximum Health Points." },
            "Quick Healing": { desc: "Your Secondary Super Stats increase your Health Regeneration by +Health Points every 3 sec. This effect only triggers while in combat." },
            "Adrenaline Rush": { desc: "Whenever one of your attacks Critically Hits, you are healed for 1/2% of your Max Health.", maxPoints: 2 },
            "Resilient": { maxPoints: 2 },
            "Armored": { maxPoints: 2 },
            "Constitution Mastery": { maxPoints: 1 }
        },
        "Intelligence": {
            "Preparation": { desc: "Your Secondary Super Stats now grant +Defense.", maxPoints: 2 },
            "Enlightened": { desc: "Your Cooldown Reduction from items now grants +% Bonus Healing.", tier: 2 },
            "Tactician": { desc: "Your Secondary Super Stats now grant +Offense." },
            "Battle of Wits": { desc: "Your Intelligence now grants a +% bonus to Hold Strength." },
            "Revitalize": { desc: "Your Energy Builder reduces the remaining Recharge Time of all your abilities by 3/6%. This effect can only occur once every 6 sec.", tier: 1, maxPoints: 2 },
            "Detect Vulnerability": { desc: "Your damaging attacks now ignore -% damage resistance. This amount scales with your Intelligence." },
            "Expertise": { desc: "Your Secondary Super Stats grant 10/20% more of their default stated bonuses. This does not affect the bonus Damage, Healing, or Threat modifiers granted from your Secondary Super Stats.", maxPoints: 2 },
            "Tinkering": { maxPoints: 2 },
            "Intelligence Mastery": { desc: "You gain 20 Intelligence and 30 Maximum Energy.", maxPoints: 1 }
        },
        "Ego": {
            "Force of Will": { desc: "Your Secondary Super Stats now grant +Defense.", maxPoints: 2 },
            "Exploit Opening": { desc: "Whenever you Critically Strike a foe, your next non-Critical Strike deals additional damage equal to 15/30% of your Critical Severity.", maxPoints: 2 },
            "Aggression": { maxPoints: 2 },
            "Ego Mastery": { maxPoints: 1 }
        },
        "Presence": {
            "Repurpose": { desc: "Your Offense from items now grants +% Bonus Healing." },
            "Brilliance": { desc: "Your Critical Heals now increase the healing you do to that target by 1/2/3% for 10 sec. This effect stacks up to 3 times." },
            "Vulnerability": { desc: "Your Paralyze and Sleep effects reduce the damage resistance of affected targets by 5/10% for 5 sec.", maxPoints: 2 },
            "Selfless Ally": { maxPoints: 2 },
            "Dominion": { maxPoints: 2 },
            "Force of Will": { maxPoints: 2 },
            "Presence Mastery": { maxPoints: 1 }
        },
        "Recovery": {
            "Withstand": { desc: "You gain 1/2 Crowd Control Resistance for every 20 points you have in your Secondary Super Stats.", maxPoints: 2 },
            "Rapid Recovery": { desc: "Your Recovery increases your Health Regeneration by +Health Points. This effect only triggers while in combat." },
            "Well Rounded": { desc: "Your non-Super Stats increase your Max Health by 1/2 and Max Energy by 0.1/0.2.", maxPoints: 2 },
            "Staying Power": { maxPoints: 2 },
            "Second Wind": { maxPoints: 2 },
            "Recovery Mastery": { maxPoints: 1 }
        },
        "Endurance": {
            "Withstand": { desc: "Your Secondary Super Stats increase your Crowd Control Resistance.", maxPoints: 2 },
            "Kickback": { desc: "Your Energy Builder causes your next non-Energy Builder attack to grant 5/10% of your maximum Energy.", maxPoints: 2 },
            "Quick Recovery": { desc: "Your Recovery increases your Health Regeneration by +0.5 Health Points. This effect only triggers while in combat.", tier: 2, maxPoints: 2 },
            "Outburst": { desc: "When your Energy is above 90%, the Damage on your attacks is increased by 5/10/15% base damage.<br /><br />The Healing portions of your powers are increased by 5/10/15%.<br /><br />Your power costs are increased by 5/10/15%." },
            "Hardened": { desc: "Your Endurance now provides an additional +2/4 Maximum Health Points.", maxPoints: 2 },
            "Endurance Mastery": { desc: "You gain 3% of your Maximum Energy when certain criteria are met, dependent on your Role:<br /><br />Tank Role: Whenever you take damage. This effect can only occur once every 3 seconds.<br /><br />Melee Damage or Ranged Roles: Whenever you deal damage. This effect can only occur once every 3 seconds.<br /><br />Support Role: Whenever you Heal a target. This effect can only occur once every 3 seconds.<br /><br />Hybrid Role: Every 5 seconds you are in combat.", maxPoints: 1 }
        },
        "Protector": {
            "Unrelenting": { desc: "Snare will no longer reduce your movement speed, and your Run Speed is increased by 10/20%.", maxPoints: 2 },
            "Bulwark": { desc: "Increases your Maximum Health by 5/10% when not in the Hybrid Role.<br /><br />When in the Hybrid Role, this Specialization instead causes your Super Stats to increase your Threat Generation.", maxPoints: 2 },
            "Debilitating Challenge": { desc: "Your Challenge! now reduces the damage resistance of your primary target by 2/4% for 12 sec.", maxPoints: 2 },
            "Exhausting Strikes": { desc: "Your Energy Builder attacks now reduce your primary target's damage dealt by 5/10% for 10 sec.", maxPoints: 2 },
            "Protector Mastery": { maxPoints: 1 }
        },
        "Brawler": {
            "No Escape": { desc: "Your Energy Builder has a 33/67/100% chance to Daze your target for 4s if they are within 10 feet of you. Dazed characters move 20% slower." },
            "Penetrating Strikes": { desc: "When getting a Critical Hit with a direct melee attack, applies Penetrating Strikes for 5 sec, causing attacks to ignore 5/10% of the target's Resistances.", maxPoints: 2 },
            "Finishing Blow": { desc: "Your Single Target attacks now do an additional 3.3/6.7/10% base damage to targets under 35% health." },
            "Setup": { desc: "Your Melee Combo attacks have an increasing chance to cause your next non-Combo Melee attack to deal an additional 10/20% base damage.", maxPoints: 2 },
            "Brawler Mastery": { desc: "Whenever you Lunge, the base damage of your next Melee attack is increased by 10%. This effect can only occur once every 10 sec.", maxPoints: 1 },
            "Ruthless": { maxPoints: 2 },
            "Offensive Expertise": { maxPoints: 2 }
        },
        "Avenger": {
            "Can't Touch This": { desc: "When your Energy Builder deals damage it has a 33/67/100% chance to Daze your target for 4s if they are more than 10 feet away from you. Dazed characters move 20% slower." },
            "Anguish": { desc: "Whenever you Critically Strike with a Ranged attack, you deal additional Penetrating Damage every 2 sec for 6 sec. (Penetrating Damage is only resisted by Resistance to All damage, and ignores half of that resistance. Penetrating Damage also ignores half of the absorption provided by Shields.)", maxPoints: 2 },
            "Relentless Assault": { desc: "Your Maintained attacks increase your Offense by 10/20/30 for 8 sec. Stacks up to 5 times." },
            "Preemptive Strike": { desc: "Your Ranged Blast attacks cause your next non-Blast Ranged attack to deal an additional 5/10/15% base damage." },
            "Avenger Mastery": { desc: "Whenever you get 2 Critical attacks within 5 sec, your next Blast power has its Charge time reduced by 50%.", maxPoints: 1 },
            "Ruthless": { maxPoints: 2 },
            "Surprise Attack": { maxPoints: 2 },
            "Offensive Expertise": { maxPoints: 2 }
        },
        "Sentinel": {
            "Sentinel Aura": { desc: "You and your Teammates regain Health every 3 sec. This number is based on your level, and is affected by your Bonus Healing.<br /><br />This effect has a range of 100ft and a target cap of 20." },
            "Rejuvenated": { desc: "Your Active Heal Over Time ticks have a 33/67/100% chance to grant you Energy. This amount scales with your Recovery and can occur once every 2 sec." },
            "Wither": { desc: "Your Paralyze, Stun and Sleep effects reduce the damage resistance of affected targets by 5/10%. This effect lasts up to 8 sec depending on the Rank of the target.", maxPoints: 2 },
            "Sentinel Mastery": { desc: "Your Paralyze, Incapacitate, Stun, and Sleep effects cause allies who strike the affected target to be healed for 2% of their maximum health. A target can only be affected by this heal once every second. The duration of this effect lasts up to 8s, but is dependent on the rank of your target.", maxPoints: 1 },
            "Torment": { maxPoints: 2 },
            "Eternal Spring": { maxPoints: 2 },
            "Genesis": { maxPoints: 2 }
        },
        "Commander": {
            "Evasive Action": { desc: "Grants your pet an additional +25/50% resistance to all damage against AoE attacks.", maxPoints: 2 },
            "Multitasker": { desc: "Reduces the Energy Penalty caused by having Pets out by 17/33/50%." },
            "Well Trained": { desc: "The Recharge time of all your Pet's abilities is reduced by 10/20%.", maxPoints: 2 },
            "Durable": { desc: "Your Secondary Stats now further increase the pet health and the amount of healing pets receive." },
            "Relief": { desc: "Your Secondary Stats now further increase the healing done by your pets." },
            "Savage": { desc: "Your Secondary Stats now further increase the damage dealt by your pets." },
            "Rapid Response": { maxPoints: 2 },
            "Commander Mastery": { maxPoints: 1 }
        },
        "Warden": {
            "Reactive Strikes": { desc: "Single Target attacks made against you have a 10% chance to deal 10/20% of that damage back to the attacker as Penetrating Damage. (Penetrating Damage is only resisted by Resistance to All Damage, and ignores half of that resistance. Penetrating Damage also ignores half of the absorption provided by Shields.)", maxPoints: 2 },
            "Tenacious": { desc: "Whenever you take damage, you gain 5/10 Offense. This effect lasts 15s, stacks up to 5 times, and can only occur once per second.", maxPoints: 2 },
            "Upper Hand": { desc: "Increases Melee damage you deal to targets affected by Demolish, Shredded, Disintegrate, No Quarter, Stress and Stagger by 2/4/6%." },
            "The Best Defense": { desc: "You gain 33/67/100% of your Defense from gear as Offense." },
            "Warden Mastery": { desc: "Increases the damage of your Combo powers by 10% and whenever you finish a Combo, you gain a stack of Grit. Grit increases your Damage Resistance by 3%, and stacks up to 3 times.", maxPoints: 1 },
            "Ruthless": { maxPoints: 2 },
            "Elusive": { maxPoints: 2 }
        },
        "Guardian": {
            "Fortified Gear": { desc: "Increases the amount of Defense you receive from items by 10/20%." },
            "Make It Count": { desc: "Increases the Damage and decreases the Cost of your Blast attacks by 2/4/6%." },
            "Retribution": { desc: "Single Target attacks made against you have a 10% chance to trigger Retribution on you for 6s, which grants you +5/10% all damage strength and +30/60 Health Points every 2 sec.", maxPoints: 2 },
            "Tenacious": { desc: "Whenever you take damage, you gain 5/10 Offense. This effect lasts 15s, stacks up to 5 times, and can only occur once per second.", maxPoints: 2 },
            "Find the Mark": { desc: "Your Ranged attacks have a 10/20/30% chance to Expose your target. Expose increases your chance to Critically Strike that target with Ranged attacks by 3% for 10s and stacks up to 3 times." },
            "The Best Defense": { desc: "You gain 33/67/100% of your Defense from gear as Offense." },
            "Locus": { maxPoints: 2 },
            "Ruthless": { maxPoints: 2 },
            "Guardian Mastery": { maxPoints: 1 }
        },
        "Sentry": {
            "Twist Fate": { desc: "Your Energy Builder grants stacks of Twist Fate for 5s. Each stack increases your Dodge and Crit chance by 1.5/3%. Stacks up to 3 times.", maxPoints: 2 },
            "Sentry Aura": { desc: "You and your Teammates gain an additional +2/4/6% resistance to all damage.<br /><br />This effect has a range of 100ft and a target cap of 20." },
            "Fortify": { desc: "Whenever you get a Critical Effect (from Damage or Healing powers) you gain Fortify, which lasts 10s and stacks up to 3 times. Each stack increases your Healing Strength and Damage Resistance by 1/2%.", maxPoints: 2 },
            "Persevere": { desc: "Single Target attacks made against you have a 10% chance to heal you and your nearby teammates for 10/20% of the damage dealt.", maxPoints: 2 },
            "Reinforce": { desc: "Whenever you Critically Heal, your target gains +5/10% resistance to all damage for 5 sec. Whenever you Critically Strike with a Single Target attack, you gain +5/10% resistance to all damage for 5 sec.", maxPoints: 2 },
            "Sentry Mastery": { desc: "Whenever a damaging attack brings you below 50% Health, the attacker is Stunned and you heal nearby allies for 10% of your Maximum Health. This Stun lasts 3s and is twice as powerful as normal Stuns, and can affect enemies that are not normally affected by stuns. This effect can only occur once every 60 seconds.", maxPoints: 1 }
        },
        "Arbiter": {
            "Enforcer": { desc: "The strength of your Combo Attacks, Heals, and Shields is increased by 2/4/6%." },
            "Ruthless": { desc: "Increases your Critical Severity by 5/10/15%.", maxPoints: 3 }, // FIXED: Ruthless to 3 points
            "Rend": { desc: "Whenever you Critically Strike an enemy, you reduce their damage resistance by 2/4% for 5 sec.", maxPoints: 2 },
            "Honor": { desc: "Whenever you directly Heal or Shield an ally, your next attack gains 2.5/5% base damage strength. This effect lasts 10 sec, stacks up to 3 times and expires after using a direct damaging attack.", maxPoints: 2 },
            "Concussion": { desc: "Whenever you Stun a target, you now also reduce the damage the target deals by 5/10/15%. The duration of this effect lasts up to 8s, but is dependent on the Rank of your target." },
            "Arbiter Mastery": { desc: "Your Combo Finishers heal yourself for 1% of your maximum Health, and heals up to 5 allies within 25ft for 3% of their maximum Health.", maxPoints: 1 },
            "Preservation": { maxPoints: 2 }
        },
        "Overseer": {
            "Administer": { desc: "The strength of your Blast Attacks, Heals, and Shields is increased by 3/6/9%." },
            "Ruthless": { desc: "Increases your Critical Severity by 5/10/15%.", maxPoints: 3 }, // FIXED: Ruthless to 3 points
            "Impact": { desc: "Whenever you Critically Strike an enemy, you reduce the Damage they deal by 4/8% for 5 sec.", maxPoints: 2 },
            "Honor": { desc: "Whenever you directly Heal or Shield an ally, your next attack gains 2.5/5% base damage strength. This effect lasts 10 sec, stacks up to 3 times and expires after using a direct damaging attack.", maxPoints: 2 },
            "Trapped": { desc: "Your Paralyze, Incapacitate, and Root effects reduce the damage resistance of affected targets by 3/6/9%. This effect lasts up to 8 sec depending on the Rank of the target." },
            "Conservation": { desc: "Reduces the Energy Cost of your Heals, Paralyzes, Incapacitates, Confuses, Placates, and Ranged attacks by 7.5/15%.", maxPoints: 2 },
            "Overseer Mastery": { desc: "Increases the base damage or healing done to targets at or below 20% Health by 10%.", maxPoints: 1 }
        },
        "Vindicator": {
            "Aggressive Stance": { desc: "You gain 10/20% of your Offense from gear as Defense.<br /><br />Additionally, you gain 10/20% of your Offense from individual powers as Defense.", maxPoints: 2 },
            "Merciless": { desc: "Increases your Critical Severity by 5/10/15%" },
            "Initiative": { desc: "Your Energy Builder attacks now reduce the resistance of affected targets by 2/4% for 12 sec.", maxPoints: 2 },
            "The Rush of Battle": { desc: "When you defeat an enemy, you regain 5/10/15% of your Max Health over the next 5 sec." },
            "Modified Gear": { maxPoints: 2 },
            "Offensive Expertise": { maxPoints: 2 },
            "Vindicator Mastery": { maxPoints: 1 }
        }
    };

    const newPerks = [
        { tree: "Ego", name: "Mind Over Matter", tier: 2, maxPoints: 2, desc: "Your Ego now grants Knock bonuses to your Melee Knock powers, equal to 25/50% the bonus it grants your Ranged powers. However, this Specialization causes your Strength to no longer affect the Knock strength of your Melee powers." },
        { tree: "Avenger", name: "Round 'Em Up", tier: 1, maxPoints: 3, desc: "Your AoE attacks cause your targets to take 1/2/3% more damage from further AoE attacks you make. Stacks up to 3 times and lasts 10s." },
        { tree: "Commander", name: "Create an Opening", tier: 1, maxPoints: 2, desc: "Whenever you Critically Strike, your pets Critical Chance is increased by 10/20% for 5 sec." },
        { tree: "Arbiter", name: "Enhanced Mending", tier: 1, maxPoints: 2, desc: "Directly damaging a foe with a non energy builder Melee attack increases the duration of your active Rune powers by 1/2 sec. The duration cannot exceed the normal duration of the power." },
        { tree: "Overseer", name: "Enhanced Mending", tier: 1, maxPoints: 2, desc: "Directly damaging a foe with a non energy builder Ranged attack increases the duration of your active Rune powers by 1/2 sec. The duration cannot exceed the normal duration of the power." }
    ];

    // Patch Raw HCData
    if (typeof HCData !== 'undefined' && HCData.specializationTree) {
        HCData.specializationTree.forEach(tree => {
            if (specUpdates[tree.name]) {
                tree.specializationList.forEach(perk => {
                    let update = specUpdates[tree.name][perk.name];
                    if (update) {
                        if (update.desc) perk.tip = update.desc;
                        if (update.maxPoints !== undefined) perk.maxRank = update.maxPoints;
                        if (update.tier !== undefined) perk.tier = update.tier;
                    }
                });
            }
            
            // REMOVE OUTDATED/MISMATCHED PERKS
            if (perksToRemove[tree.name]) {
                tree.specializationList = tree.specializationList.filter(p => !perksToRemove[tree.name].includes(p.name));
            }

            newPerks.forEach(newP => {
                if (newP.tree === tree.name) {
                     if (!tree.specializationList.some(p => p.name === newP.name)) {
                         tree.specializationList.push({
                             name: newP.name,
                             tip: newP.desc,
                             maxRank: newP.maxPoints,
                             tier: newP.tier
                         });
                     }
                }
            });
        });
    }

    // Patch Active UI Array
    if (typeof specializations !== 'undefined') {
        specializations.forEach(tree => {
            if (specUpdates[tree.name]) {
                tree.perks.forEach(perk => {
                    let update = specUpdates[tree.name][perk.name];
                    if (update) {
                        if (update.desc) perk.desc = update.desc.replace(/"/g, '&quot;').replace(/\n/g, '<br>');
                        if (update.maxPoints !== undefined) perk.maxPoints = update.maxPoints;
                        if (update.tier !== undefined) perk.tier = update.tier;
                    }
                });
                
                if (tree.mastery) {
                    let mUpdate = specUpdates[tree.name][tree.mastery.name];
                    if (mUpdate) {
                        if (mUpdate.desc) tree.mastery.desc = mUpdate.desc.replace(/"/g, '&quot;').replace(/\n/g, '<br>');
                        if (mUpdate.maxPoints !== undefined) tree.mastery.maxPoints = mUpdate.maxPoints;
                        if (mUpdate.tier !== undefined) tree.mastery.tier = mUpdate.tier;
                    }
                }
            }

            // REMOVE OUTDATED/MISMATCHED PERKS
            if (perksToRemove[tree.name]) {
                tree.perks = tree.perks.filter(p => !perksToRemove[tree.name].includes(p.name));
            }

            newPerks.forEach((newP, index) => {
                if (newP.tree === tree.name) {
                    if (!tree.perks.some(p => p.name === newP.name)) {
                        tree.perks.push({
                            id: "spec_" + tree.name.toLowerCase() + "_new_" + index,
                            name: newP.name,
                            desc: newP.desc.replace(/"/g, '&quot;').replace(/\n/g, '<br>'),
                            maxPoints: newP.maxPoints,
                            tier: newP.tier,
                            spriteX: 58, 
                            spriteY: 350,
                            width: 24,
                            height: 32,
                            renderScale: 1.0,
                            image: "spritesheet.png"
                        });
                    }
                }
            });
        });
    }

    console.log("System Alert: custom-additions.js injected successfully. Ruthless points fixed.");
}

injectCustomContent();