// --- SMART ZOOM FIX (NATIVE APP FEEL) ---
// Dynamically scales the entire application to perfectly fit the user's browser window
function applySmartZoom() {
	const targetWidth = 1600;
	const targetHeight = 1050;
	const currentWidth = window.innerWidth;
	const currentHeight = window.innerHeight;
	const widthRatio = currentWidth / targetWidth;
	const heightRatio = currentHeight / targetHeight;
	let finalZoom = Math.min(widthRatio, heightRatio);
	finalZoom = Math.min(finalZoom, 1.0); // User scale preference maintained
	document.body.style.zoom = finalZoom;
}
applySmartZoom();
window.addEventListener('resize', applySmartZoom);

// Dynamically override styles.css to collapse the top nav bar footprint and fix modal overflow
if (!document.getElementById('hud-layout-overrides')) {
	document.head.insertAdjacentHTML('beforeend', `
		<style id="hud-layout-overrides">
			.powerset-nav { padding-bottom: 5px !important; margin-bottom: 5px !important; border-bottom: 1px solid #333 !important; }
			.powerset-tab { padding: 4px 12px !important; height: auto !important; display: flex !important; align-items: center !important; flex-direction: row !important; margin: 0 !important; }
			#perk-allocation-modal { max-height: 85vh !important; flex-direction: column !important; }
			#perk-list-container { overflow-y: auto !important; flex: 1 !important; padding-right: 15px !important; margin-top: 10px !important; }

			/* --- SMART BOUNDARY-AWARE TOOLTIP SYSTEM --- */
            .spec-perk, .active-perk-icon, .power, .slot { overflow: visible !important; position: relative; } 
            .spec-perk-desc { display: none !important; } 
            .spec-perk:hover, .active-perk-icon:hover, .power:hover, .slot:hover { z-index: 100; }
            
            /* Master Baseline Style for all Custom HTML Tooltips */
            .spec-perk-tooltip, .power .tooltip, .slot .power-spec-tooltip {
                visibility: hidden;
                opacity: 0;
                position: absolute;
                bottom: 115%; /* Elevated slightly to clear borders cleanly */
                background: #1a1a1a;
                border: 1px solid #4DA8DA;
                padding: 12px;
                border-radius: 6px;
                width: 280px;
                z-index: 9999;
                box-shadow: 0 5px 15px rgba(0,0,0,0.9);
                font-size: 15px;
                color: #ddd;
                pointer-events: none;
                transition: opacity 0.15s ease-in-out;
                text-align: left;
                line-height: 1.4;
            }
            
            /* Global Hover Trigger */
            .spec-perk:hover .spec-perk-tooltip, 
            .active-perk-icon:hover .spec-perk-tooltip,
            .power:hover .tooltip,
            .slot:hover .power-spec-tooltip {
                visibility: visible;
                opacity: 1;
            }
            
            /* --- VERTICAL BOUNDARY FLIPS FOR TOP-ROW ELEMENTS --- */
            
            /* Top 4 slots in the builder track: Flip to render downward */
            .right-col .slot:nth-child(-n+4) .power-spec-tooltip {
                bottom: auto;
                top: 115%;
                box-shadow: 0 -5px 15px rgba(0,0,0,0.9); /* Invert shadow direction */
            }
            
            /* Top tiers in the power library (Energy Builders & Tier 0/1): Flip to render downward */
            .left-col .tier-section:nth-child(-n+2) .power .tooltip {
                bottom: auto;
                top: 115%;
                box-shadow: 0 -5px 15px rgba(0,0,0,0.9);
            }
            
            /* Specialization HUD Tracks (Lower Right side of pane): Align right, expand safely westward */
            .hud-perks .spec-perk-tooltip,
            .spec-perk .spec-perk-tooltip {
                right: 0;
                left: auto;
                transform: none;
            }

			/* --- POWER LIBRARY & ACTIVE SLOT HOVER TOOLTIPS --- */
				.power, .slot { position: relative; overflow: visible !important; }
				.power .tooltip, .slot .power-spec-tooltip {
					visibility: hidden;
					opacity: 0;
					position: absolute;
					bottom: 110%;
					left: 50%;
					transform: translateX(-50%);
					background: #1a1a1a;
					border: 1px solid #4DA8DA;
					padding: 12px;
					border-radius: 6px;
					width: 280px;
					z-index: 9999;
					box-shadow: 0 5px 15px rgba(0,0,0,0.9);
					font-size: 15px;
					color: #ddd;
					pointer-events: none;
					transition: opacity 0.2s;
					text-align: left;
					line-height: 1.4;
				}
				.power:hover .tooltip, .slot:hover .power-spec-tooltip {
					visibility: visible;
					opacity: 1;
				}

			/* --- INVALID SLOT HIGHLIGHTING & DRAG STYLING --- */
			.slot.invalid-slot { background: rgba(255,0,0,0.1) !important; border: 2px dashed #ff5555 !important; }
			.slot.invalid-slot .slot-name { color: #ff5555 !important; }
			.slot.invalid-slot .slot-tier { color: #ff5555 !important; font-weight: bold; opacity: 1 !important; }
			.slot.drag-over { border-color: #4DA8DA !important; background: rgba(77, 168, 218, 0.2) !important; box-shadow: inset 0 0 10px rgba(77, 168, 218, 0.5); }
		</style>
	`);
}
// ----------------------------------------

// Custom Stat Colors Map
const STAT_COLORS = {
	"Strength": "#ff3333",		 // Red
	"Dexterity": "#ffa500",		 // Orange
	"Constitution": "#4ade80",	 // Green
	"Intelligence": "#7851A9",	 // Royal Purple
	"Ego": "#ffc0cb",			 // Pink
	"Presence": "#ff00ff",		 // Magenta
	"Recovery": "#00ffff",		 // Cyan
	"Endurance": "#add8e6"		 // Light Blue
};

// The Data State Engine
let build = {
	set: "force",
	stats: { primary: null, sec1: null, sec2: null },
	powers: new Array(14).fill(null),
	adv: {},
	specs: { primary: null, sec1: null, sec2: null, mastery: null, points: {} },
	devices: new Array(5).fill(null),
	variants: new Array(5).fill(null),
	talents: new Array(7).fill(null), // Index 0 = Innate (L1), 1-6 = Progressive (L6, 9, 12, 15, 18, 21)
	cams: { polarity: 'Blue', level: 0 }
};

let currentSet = "force";
let activeSlotIndex = 0;
let expandedPowerId = null;
const MAX_POWERS = 14;
const STAT_TREES = ["Strength", "Dexterity", "Constitution", "Intelligence", "Ego", "Presence", "Recovery", "Endurance"];

if(typeof specializations !== 'undefined') {
	specializations.forEach(tree => {
		if (typeof iconPlacements !== 'undefined') {
			tree.perks.forEach(perk => { if(iconPlacements[perk.id]) Object.assign(perk, iconPlacements[perk.id]); });
			if(tree.mastery && iconPlacements[tree.mastery.id]) Object.assign(tree.mastery, iconPlacements[tree.mastery.id]);
		}
	});
}

if (typeof iconPlacements !== 'undefined') {
	powersets.forEach(p => { if (iconPlacements[p.id]) Object.assign(p, iconPlacements[p.id]); });
	powers.forEach(p => { if (iconPlacements[p.id]) Object.assign(p, iconPlacements[p.id]); });
}

// --- CO TALENTS DATABASE ---
const CO_TALENTS = [
    { id: "t_sureshot", name: "Sureshot", type: "innate", stats: "Dex: 12, Int: 12", desc: "Your hand-eye coordination is unmatched.<br />Con: 5, End: 5, Str: 5, Dex: 12, Int: 12, Ego: 5, Pre: 5, Rec: 5" },
    { id: "t_abyssal", name: "Abyssal", type: "innate", stats: "Con: 12, End: 12", desc: "You draw your power from dark places.<br />Con: 12, End: 12, Str: 5, Dex: 5, Int: 5, Ego: 5, Pre: 5, Rec: 5" },
    { id: "t_energized", name: "Energized", type: "innate", stats: "End: 12, Rec: 12", desc: "The power flows through you.<br />Con: 5, End: 12, Str: 5, Dex: 5, Int: 5, Ego: 5, Pre: 5, Rec: 12" },
    { id: "t_incandescent", name: "Incandescent", type: "innate", stats: "Pre: 12, Rec: 12", desc: "A fire burns deep within you.<br />Con: 5, End: 5, Str: 5, Dex: 5, Int: 5, Ego: 5, Pre: 12, Rec: 12" },
    { id: "t_impetus", name: "Impetus", type: "innate", stats: "End: 12, Ego: 12", desc: "Your power is unstoppable.<br />Con: 5, End: 12, Str: 5, Dex: 5, Int: 5, Ego: 12, Pre: 5, Rec: 5" },
    { id: "t_tech_savvy", name: "Tech Savvy", type: "innate", stats: "End: 12, Int: 12", desc: "You know what makes things tick.<br />Con: 5, End: 12, Str: 5, Dex: 5, Int: 12, Ego: 5, Pre: 5, Rec: 5" },
    { id: "t_absolute_zero", name: "Absolute Zero", type: "innate", stats: "Dex: 12, Rec: 12", desc: "You have a cold outlook on life.<br />Con: 5, End: 5, Str: 5, Dex: 12, Int: 5, Ego: 5, Pre: 5, Rec: 12" },
    { id: "t_one_of_mind_and_body", name: "One of Mind and Body", type: "innate", stats: "Str: 12, Dex: 12", desc: "You have achieved the balance.<br />Con: 5, End: 5, Str: 12, Dex: 12, Int: 5, Ego: 5, Pre: 5, Rec: 5" },
    { id: "t_superhuman", name: "Superhuman", type: "innate", stats: "Con: 12, Str: 12", desc: "You have the strength of many.<br />Con: 12, End: 5, Str: 12, Dex: 5, Int: 5, Ego: 5, Pre: 5, Rec: 5" },
    { id: "t_quick_trigger", name: "Quick Trigger", type: "innate", stats: "Dex: 12, Ego: 12", desc: "You are fast on the draw.<br />Con: 5, End: 5, Str: 5, Dex: 12, Int: 5, Ego: 12, Pre: 5, Rec: 5" },
    { id: "t_mechanized", name: "Mechanized", type: "innate", stats: "Str: 12, Int: 12", desc: "You know how to maximize efficiency.<br />Con: 5, End: 5, Str: 12, Dex: 5, Int: 12, Ego: 5, Pre: 5, Rec: 5" },
    { id: "t_arcanus", name: "Arcanus", type: "innate", stats: "Int: 12, Pre: 12", desc: "You have an intuitive grasp of magic.<br />Con: 5, End: 5, Str: 5, Dex: 5, Int: 12, Ego: 5, Pre: 12, Rec: 5" },
    { id: "t_inhuman", name: "Inhuman", type: "innate", stats: "Con: 12, Rec: 12", desc: "You have an unspeakable heritage.<br />Con: 12, End: 5, Str: 5, Dex: 5, Int: 5, Ego: 5, Pre: 5, Rec: 12" },
    { id: "t_matter_manipulator", name: "Matter Manipulator", type: "innate", stats: "Con: 12, Ego: 12", desc: "You know what it takes to get things moving.<br />Con: 12, End: 5, Str: 5, Dex: 5, Int: 5, Ego: 12, Pre: 5, Rec: 5" },
    { id: "t_mind_over_matter", name: "Mind over Matter", type: "innate", stats: "Ego: 12, Pre: 12", desc: "You know what motivates people.<br />Con: 5, End: 5, Str: 5, Dex: 5, Int: 5, Ego: 12, Pre: 12, Rec: 5" },
    { id: "t_the_hero", name: "The Hero", type: "innate", stats: "Con: 8, End: 6, Str: 8, Dex: 8, Int: 8, Ego: 8, Pre: 8, Rec: 6", desc: "The picture of balanced perfection, this character is the Jack-of-All-Trades, master of none, though often better than the master of one.<br />Con: 8, End: 6, Str: 8, Dex: 8, Int: 8, Ego: 8, Pre: 8, Rec: 6" },
    { id: "t_divinity", name: "Divinity", type: "innate", stats: "Con: 12, Pre: 12", desc: "You have been inspired by forces beyond.<br />Con: 12, End: 5, Str: 5, Dex: 5, Int: 5, Ego: 5, Pre: 12, Rec: 5" },
    { id: "t_feral", name: "Feral", type: "innate", stats: "Str: 12, Rec: 12", desc: "Within you beats the heart of an animal.<br />Con: 5, End: 5, Str: 12, Dex: 5, Int: 5, Ego: 5, Pre: 5, Rec: 12" },
    { id: "t_the_inferno", name: "The Inferno", type: "innate", stats: "End: 10, Dex: 10, Ego: 8, Rec: 10", desc: "This is the innate characteristic for The Inferno.<br />Con: 5, End: 10, Str: 5, Dex: 10, Int: 5, Ego: 8, Pre: 5, Rec: 10" },
    { id: "t_the_soldier", name: "The Soldier", type: "innate", stats: "Dex: 10, Int: 8, Ego: 10, Rec: 10", desc: "This is the innate characteristic for The Soldier.<br />Con: 5, End: 5, Str: 5, Dex: 10, Int: 8, Ego: 10, Pre: 5, Rec: 10" },
    { id: "t_the_blade", name: "The Blade", type: "innate", stats: "End: 8, Str: 10, Dex: 10, Rec: 10", desc: "This is the innate characteristic for The Blade.<br />Con: 5, End: 8, Str: 10, Dex: 10, Int: 5, Ego: 5, Pre: 5, Rec: 10" },
    { id: "t_the_savage", name: "The Savage", type: "innate", stats: "Con: 10, Str: 10, Dex: 8, Rec: 10", desc: "This is the innate characteristic for The Brute.<br />Con: 10, End: 5, Str: 10, Dex: 8, Int: 5, Ego: 5, Pre: 5, Rec: 10" },
    { id: "t_the_behemoth", name: "The Behemoth", type: "innate", stats: "Con: 10, End: 8, Str: 10, Rec: 10", desc: "This is the innate characteristic for The Behemoth.<br />Con: 10, End: 8, Str: 10, Dex: 5, Int: 5, Ego: 5, Pre: 5, Rec: 10" },
    { id: "t_the_glacier", name: "The Glacier", type: "innate", stats: "Con: 10, End: 10, Dex: 8, Int: 10", desc: "This is the innate characteristic for The Glacier.<br />Con: 10, End: 10, Str: 5, Dex: 8, Int: 10, Ego: 5, Pre: 5, Rec: 5" },
    { id: "t_the_mind", name: "The Mind", type: "innate", stats: "End: 10, Int: 8, Ego: 10, Pre: 10", desc: "This is the innate characteristic for The Mind.<br />Con: 5, End: 10, Str: 5, Dex: 5, Int: 8, Ego: 10, Pre: 10, Rec: 5" },
    { id: "t_the_grimoire", name: "The Grimoire", type: "innate", stats: "Int: 10, Ego: 10, Pre: 10, Rec: 8", desc: "This is the innate characteristic for The Grimoire.<br />Con: 5, End: 5, Str: 5, Dex: 5, Int: 10, Ego: 10, Pre: 10, Rec: 8" },
    { id: "t_the_assassin", name: "The Assassin", type: "innate", stats: "Str: 10, Dex: 10, Int: 8, Ego: 10", desc: "This is the innate characteristic for The Assassin.<br />Con: 5, End: 5, Str: 10, Dex: 10, Int: 8, Ego: 10, Pre: 5, Rec: 5" },
    { id: "t_the_marksman", name: "The Marksman", type: "innate", stats: "End: 8, Dex: 10, Int: 10, Ego: 10", desc: "This is the innate characteristic for The Marksman.<br />Con: 5, End: 8, Str: 5, Dex: 10, Int: 10, Ego: 10, Pre: 5, Rec: 5" },
    { id: "t_the_void", name: "The Void", type: "innate", stats: "Con: 10, End: 10, Dex: 8, Rec: 10", desc: "This is the innate characteristic for The Void.<br />Con: 10, End: 10, Str: 5, Dex: 8, Int: 5, Ego: 5, Pre: 5, Rec: 10" },
    { id: "t_the_inventor", name: "The Inventor", type: "innate", stats: "End: 8, Int: 10, Pre: 10, Rec: 10", desc: "This is the innate characteristic for The Inventor.<br />Con: 5, End: 8, Str: 5, Dex: 5, Int: 10, Ego: 5, Pre: 10, Rec: 10" },
    { id: "t_the_tempest", name: "The Tempest", type: "innate", stats: "End: 10, Dex: 8, Ego: 10, Rec: 10", desc: "This is the innate characteristic for The Tempest.<br />Con: 5, End: 10, Str: 5, Dex: 8, Int: 5, Ego: 10, Pre: 5, Rec: 10" },
    { id: "t_the_devastator", name: "The Devastator", type: "innate", stats: "Con: 10, End: 8, Str: 10, Rec: 10", desc: "This is the innate characteristic for The Devastator.<br />Con: 10, End: 8, Str: 10, Dex: 5, Int: 5, Ego: 5, Pre: 5, Rec: 10" },
    { id: "t_the_disciple", name: "The Disciple", type: "innate", stats: "Dex: 10, Int: 8, Ego: 10, Rec: 10", desc: "This is the innate characteristic for The Disciple.<br />Con: 5, End: 5, Str: 5, Dex: 10, Int: 8, Ego: 10, Pre: 5, Rec: 10" },
    { id: "t_the_impulse", name: "The Impulse", type: "innate", stats: "End: 10, Int: 10, Ego: 10, Rec: 8", desc: "This is the innate characteristic for The Impulse.<br />Con: 5, End: 10, Str: 5, Dex: 5, Int: 10, Ego: 10, Pre: 5, Rec: 8" },
    { id: "t_the_fist", name: "The Fist", type: "innate", stats: "Str: 10, Dex: 10, Int: 10, Rec: 8", desc: "This is the innate characteristic for The Fist.<br />Con: 5, End: 5, Str: 10, Dex: 10, Int: 10, Ego: 5, Pre: 5, Rec: 8" },
    { id: "t_the_protector", name: "The Protector", type: "innate", stats: "Con: 10, Str: 10, Dex: 10, Rec: 8", desc: "This is the innate characteristic for The Master.<br />Con: 10, End: 5, Str: 10, Dex: 10, Int: 5, Ego: 5, Pre: 5, Rec: 8" },
    { id: "t_the_scourge", name: "The Scourge", type: "innate", stats: "Con: 10, End: 8, Ego: 10, Rec: 10", desc: "This is the innate characteristic for The Scourge and The Cursed.<br />Con: 10, End: 8, Str: 5, Dex: 5, Int: 5, Ego: 10, Pre: 5, Rec: 10" },
    { id: "t_the_squall", name: "The Squall", type: "innate", stats: "End: 10, Dex: 8, Ego: 10, Rec: 10", desc: "This is the innate characteristic for The Squall.<br />Con: 5, End: 10, Str: 5, Dex: 8, Int: 5, Ego: 10, Pre: 5, Rec: 10" },
    { id: "t_the_mountain", name: "The Mountain", type: "innate", stats: "Con: 10, End: 10, Str: 8, Ego: 10", desc: "This is the innate characteristic for The Mountain.<br />Con: 10, End: 10, Str: 8, Dex: 5, Int: 5, Ego: 10, Pre: 5, Rec: 5" },
    { id: "t_the_unleashed", name: "The Unleashed", type: "innate", stats: "Str: 10, Dex: 10, Int: 8, Rec: 10", desc: "This is the innate characteristic for The Unleashed.<br />Con: 5, End: 5, Str: 10, Dex: 10, Int: 8, Ego: 5, Pre: 5, Rec: 10" },
    { id: "t_the_radiant", name: "The Radiant", type: "innate", stats: "Int: 10, Ego: 10, Pre: 10, Rec: 8", desc: "This is the innate characteristic for The Radiant.<br />Con: 5, End: 5, Str: 5, Dex: 5, Int: 10, Ego: 10, Pre: 10, Rec: 8" },
    { id: "t_the_invincible", name: "The Invincible", type: "innate", stats: "Con: 10, End: 10, Int: 10, Ego: 8", desc: "This is the innate characteristic for The Invincible.<br />Con: 10, End: 10, Str: 5, Dex: 5, Int: 10, Ego: 8, Pre: 5, Rec: 5" },
    { id: "t_the_night_avenger", name: "The Night Avenger", type: "innate", stats: "End: 8, Str: 10, Dex: 10, Ego: 10", desc: "This is the innate characteristic for The Night Avenger.<br />Con: 5, End: 8, Str: 10, Dex: 10, Int: 5, Ego: 10, Pre: 5, Rec: 5" },
    { id: "t_the_chiller", name: "The Chiller", type: "innate", stats: "Con: 10, End: 10, Dex: 10, Rec: 8", desc: "This is the innate characteristic for The Chiller.<br />Con: 10, End: 10, Str: 5, Dex: 10, Int: 5, Ego: 5, Pre: 5, Rec: 8" },
    { id: "t_the_rockstar", name: "The Rockstar", type: "innate", stats: "Con: 10, End: 10, Str: 10, Rec: 8", desc: "This is the innate characteristic for The Rockstar.<br />Con: 10, End: 10, Str: 10, Dex: 5, Int: 5, Ego: 5, Pre: 5, Rec: 8" },
    { id: "t_the_predator", name: "The Predator", type: "innate", stats: "Con: 8, Str: 10, Dex: 10, Rec: 10", desc: "This is the innate characteristic for The Predator.<br />Con: 8, End: 5, Str: 10, Dex: 10, Int: 5, Ego: 5, Pre: 5, Rec: 10" },
    { id: "t_the_penitent", name: "The Penitent", type: "innate", stats: "End: 10, Str: 10, Dex: 10, Rec: 8", desc: "This is the innate characteristic for The Penitent.<br />Con: 5, End: 10, Str: 10, Dex: 10, Int: 5, Ego: 5, Pre: 5, Rec: 8" },
    { id: "t_the_hexslinger", name: "The Hexslinger", type: "innate", stats: "Dex: 10, Int: 10, Ego: 10, Pre: 8", desc: "This is the innate characteristic for The Hexslinger.<br />Con: 5, End: 5, Str: 5, Dex: 10, Int: 10, Ego: 10, Pre: 8, Rec: 5" },
    { id: "t_the_witch", name: "The Witch", type: "innate", stats: "Con: 10, Int: 8, Pre: 10, Rec: 10", desc: "This is the innate characteristic for The Witch.<br />Con: 10, End: 5, Str: 5, Dex: 5, Int: 8, Ego: 5, Pre: 10, Rec: 10" },
    { id: "t_the_automaton", name: "The Automaton", type: "innate", stats: "Con: 10, End: 8, Int: 10, Ego: 10", desc: "This is the innate characteristic for The Automaton.<br />Con: 10, End: 8, Str: 5, Dex: 5, Int: 10, Ego: 10, Pre: 5, Rec: 5" },
    { id: "t_the_cybernetic_warrior", name: "The Cybernetic Warrior", type: "innate", stats: "Con: 10, End: 10, Int: 10, Rec: 8", desc: "This is the innate characteristic for The Cybernetic Warrior.<br />Con: 10, End: 10, Str: 5, Dex: 5, Int: 10, Ego: 5, Pre: 5, Rec: 8" },
    { id: "t_the_gunslinger", name: "The Gunslinger", type: "innate", stats: "Con: 10, Dex: 10, Ego: 8, Rec: 10", desc: "This is the innate characteristic for The Gunslinger.<br />Con: 10, End: 5, Str: 5, Dex: 10, Int: 5, Ego: 8, Pre: 5, Rec: 10" },
    { id: "t_the_specialist", name: "The Specialist", type: "innate", stats: "Con: 10, Dex: 10, Int: 8, Rec: 10", desc: "This is the innate characteristic for The Specialist.<br />Con: 10, End: 5, Str: 5, Dex: 10, Int: 8, Ego: 5, Pre: 5, Rec: 10" },
    { id: "t_the_psychokinetic", name: "The Psychokinetic", type: "innate", stats: "End: 8, Dex: 10, Ego: 10, Rec: 10", desc: "This is the innate characteristic for The Psychokinetic.<br />Con: 5, End: 8, Str: 5, Dex: 10, Int: 5, Ego: 10, Pre: 5, Rec: 10" },
    { id: "t_the_blazing", name: "The Blazing", type: "innate", stats: "End: 10, Ego: 8, Pre: 10, Rec: 10", desc: "This is the innate characteristic for The Blazing.<br />Con: 5, End: 10, Str: 5, Dex: 5, Int: 5, Ego: 8, Pre: 10, Rec: 10" },
    { id: "t_the_dragon", name: "The Dragon", type: "innate", stats: "Con: 8, Str: 10, Dex: 10, Rec: 10", desc: "This is the innate characteristic for The Dragon.<br />Con: 8, End: 5, Str: 10, Dex: 10, Int: 5, Ego: 5, Pre: 5, Rec: 10" },
    { id: "t_the_master", name: "The Master", type: "innate", stats: "Con: 10, Str: 8, Dex: 10, Rec: 10", desc: "This is the innate characteristic for The Master.<br />Con: 10, End: 5, Str: 8, Dex: 10, Int: 5, Ego: 5, Pre: 5, Rec: 10" },
    { id: "t_the_samurai", name: "The Samurai", type: "innate", stats: "Con: 10, End: 8, Dex: 10, Rec: 10", desc: "This is the innate characteristic for The Samurai.<br />Con: 10, End: 8, Str: 5, Dex: 10, Int: 5, Ego: 5, Pre: 5, Rec: 10" },
    { id: "t_the_midnight", name: "The Midnight", type: "innate", stats: "Dex: 10, Int: 8, Pre: 10, Rec: 10", desc: "This is the innate characteristic for The Midnight.<br />Con: 5, End: 5, Str: 5, Dex: 10, Int: 8, Ego: 5, Pre: 10, Rec: 10" },
    { id: "t_the_wrecker", name: "The Wrecker", type: "innate", stats: "Con: 10, Str: 10, Dex: 8, Rec: 10", desc: "This is the innate characteristic for The Wrecker.<br />Con: 10, End: 5, Str: 10, Dex: 8, Int: 5, Ego: 5, Pre: 5, Rec: 10" },
    { id: "t_the_tenebrous", name: "The Tenebrous", type: "innate", stats: "Con: 8, Ego: 10, Pre: 10, Rec: 10", desc: "This is the innate characteristic for The Tenebrous.<br />Con: 8, End: 5, Str: 5, Dex: 5, Int: 5, Ego: 10, Pre: 10, Rec: 10" },
    { id: "t_the_combatant", name: "The Combatant", type: "innate", stats: "Str: 10, Dex: 10, Int: 8, Ego: 10", desc: "This is the innate characteristic for The Combatant.<br />Con: 5, End: 5, Str: 10, Dex: 10, Int: 8, Ego: 10, Pre: 5, Rec: 5" },
    { id: "t_the_fissile", name: "The Fissile", type: "innate", stats: "Dex: 10, Int: 10, Ego: 8, Rec: 10", desc: "This is the innate characteristic for The Fissile.<br />Con: 5, End: 5, Str: 5, Dex: 10, Int: 10, Ego: 8, Pre: 5, Rec: 10" },
    { id: "t_the_overseer", name: "The Overseer", type: "innate", stats: "End: 8, Int: 10, Ego: 10, Pre: 10", desc: "This is the innate characteristic for The Overseer.<br />Con: 5, End: 8, Str: 5, Dex: 5, Int: 10, Ego: 10, Pre: 10, Rec: 5" },
    { id: "t_mighty", name: "Mighty", type: "progressive", stats: "Str: 8", desc: "Increases attributes: Str: 8" },
    { id: "t_agile", name: "Agile", type: "progressive", stats: "Dex: 8", desc: "Increases attributes: Dex: 8" },
    { id: "t_enduring", name: "Enduring", type: "progressive", stats: "Con: 8", desc: "Increases attributes: Con: 8" },
    { id: "t_brilliant", name: "Brilliant", type: "progressive", stats: "Int: 8", desc: "Increases attributes: Int: 8" },
    { id: "t_indomitable", name: "Indomitable", type: "progressive", stats: "Ego: 8", desc: "Increases attributes: Ego: 8" },
    { id: "t_intimidating", name: "Intimidating", type: "progressive", stats: "Pre: 8", desc: "Increases attributes: Pre: 8" },
    { id: "t_tireless", name: "Tireless", type: "progressive", stats: "Rec: 8", desc: "Increases attributes: Rec: 8" },
    { id: "t_energetic", name: "Energetic", type: "progressive", stats: "End: 8", desc: "Increases attributes: End: 8" },
    { id: "t_martial_focus", name: "Martial Focus", type: "progressive", stats: "Str: 5, Dex: 5", desc: "Increases attributes: Str: 5, Dex: 5" },
    { id: "t_physical_conditioning", name: "Physical Conditioning", type: "progressive", stats: "Str: 5, Con: 5", desc: "Increases attributes: Str: 5, Con: 5" },
    { id: "t_body_and_mind", name: "Body and Mind", type: "progressive", stats: "Str: 5, Int: 5", desc: "Increases attributes: Str: 5, Int: 5" },
    { id: "t_professional_athlete", name: "Professional Athlete", type: "progressive", stats: "Str: 5, Ego: 5", desc: "Increases attributes: Str: 5, Ego: 5" },
    { id: "t_impressive_physique", name: "Impressive Physique", type: "progressive", stats: "Str: 5, Pre: 5", desc: "Increases attributes: Str: 5, Pre: 5" },
    { id: "t_relentless", name: "Relentless", type: "progressive", stats: "Str: 5, Rec: 5", desc: "Increases attributes: Str: 5, Rec: 5" },
    { id: "t_bodybuilder", name: "Bodybuilder", type: "progressive", stats: "Str: 5, End: 5", desc: "Increases attributes: Str: 5, End: 5" },
    { id: "t_acrobat", name: "Acrobat", type: "progressive", stats: "Dex: 5, Con: 5", desc: "Increases attributes: Dex: 5, Con: 5" },
    { id: "t_coordinated", name: "Coordinated", type: "progressive", stats: "Dex: 5, Int: 5", desc: "Increases attributes: Dex: 5, Int: 5" },
    { id: "t_shooter", name: "Shooter", type: "progressive", stats: "Dex: 5, Ego: 5", desc: "Increases attributes: Dex: 5, Ego: 5" },
    { id: "t_finesse", name: "Finesse", type: "progressive", stats: "Dex: 5, Pre: 5", desc: "Increases attributes: Dex: 5, Pre: 5" },
    { id: "t_impresario", name: "Impresario", type: "progressive", stats: "Dex: 5, Rec: 5", desc: "Increases attributes: Dex: 5, Rec: 5" },
    { id: "t_accurate", name: "Accurate", type: "progressive", stats: "Dex: 5, End: 5", desc: "Increases attributes: Dex: 5, End: 5" },
    { id: "t_healthy_mind", name: "Healthy Mind", type: "progressive", stats: "Con: 5, Int: 5", desc: "Increases attributes: Con: 5, Int: 5" },
    { id: "t_ascetic", name: "Ascetic", type: "progressive", stats: "Con: 5, Ego: 5", desc: "Increases attributes: Con: 5, Ego: 5" },
    { id: "t_shrug_it_off", name: "Shrug It Off", type: "progressive", stats: "Con: 5, Pre: 5", desc: "Increases attributes: Con: 5, Pre: 5" },
    { id: "t_quick_recovery", name: "Quick Recovery", type: "progressive", stats: "Con: 5, Rec: 5", desc: "Increases attributes: Con: 5, Rec: 5" },
    { id: "t_boundless_reserves", name: "Boundless Reserves", type: "progressive", stats: "Con: 5, End: 5", desc: "Increases attributes: Con: 5, End: 5" },
    { id: "t_academics", name: "Academics", type: "progressive", stats: "Int: 5, Ego: 5", desc: "Increases attributes: Int: 5, Ego: 5" },
    { id: "t_diplomatic", name: "Diplomatic", type: "progressive", stats: "Int: 5, Pre: 5", desc: "Increases attributes: Int: 5, Pre: 5" },
    { id: "t_negotiator", name: "Negotiator", type: "progressive", stats: "Int: 5, Rec: 5", desc: "Increases attributes: Int: 5, Rec: 5" },
    { id: "t_investigator", name: "Investigator", type: "progressive", stats: "Int: 5, End: 5", desc: "Increases attributes: Int: 5, End: 5" },
    { id: "t_showmanship", name: "Showmanship", type: "progressive", stats: "Ego: 5, Pre: 5", desc: "Increases attributes: Ego: 5, Pre: 5" },
    { id: "t_worldly", name: "Worldly", type: "progressive", stats: "Ego: 5, Rec: 5", desc: "Increases attributes: Ego: 5, Rec: 5" },
    { id: "t_daredevil", name: "Daredevil", type: "progressive", stats: "Ego: 5, End: 5", desc: "Increases attributes: Ego: 5, End: 5" },
    { id: "t_lasting_impression", name: "Lasting Impression", type: "progressive", stats: "Pre: 5, Rec: 5", desc: "Increases attributes: Pre: 5, Rec: 5" },
    { id: "t_prodigy", name: "Prodigy", type: "progressive", stats: "Pre: 5, End: 5", desc: "Increases attributes: Pre: 5, End: 5" },
    { id: "t_amazing_stamina", name: "Amazing Stamina", type: "progressive", stats: "Rec: 5, End: 5", desc: "Increases attributes: Rec: 5, End: 5" },
    { id: "t_covert_ops_training", name: "Covert Ops Training", type: "progressive", stats: "Con: 3, Str: 3, Dex: 3, Int: 3", desc: "Increases attributes: Con: 3, Str: 3, Dex: 3, Int: 3" },
    { id: "t_martial_training", name: "Martial Training", type: "progressive", stats: "Str: 3, Dex: 3, Ego: 3, Rec: 3", desc: "Increases attributes: Str: 3, Dex: 3, Ego: 3, Rec: 3" },
    { id: "t_paramilitary_training", name: "Paramilitary Training", type: "progressive", stats: "Con: 3, End: 3, Str: 3, Rec: 3", desc: "Increases attributes: Con: 3, End: 3, Str: 3, Rec: 3" },
    { id: "t_discipline_training", name: "Discipline Training", type: "progressive", stats: "End: 3, Str: 3, Int: 3, Pre: 3", desc: "Increases attributes: End: 3, Str: 3, Int: 3, Pre: 3" },
    { id: "t_sniper_training", name: "Sniper Training", type: "progressive", stats: "End: 3, Dex: 3, Ego: 3, Pre: 3", desc: "Increases attributes: End: 3, Dex: 3, Ego: 3, Pre: 3" },
    { id: "t_command_training", name: "Command Training", type: "progressive", stats: "Int: 3, Ego: 3, Pre: 3, Rec: 3", desc: "Increases attributes: Int: 3, Ego: 3, Pre: 3, Rec: 3" },
    { id: "t_survival_training", name: "Survival Training", type: "progressive", stats: "Con: 3, End: 2, Dex: 3, Pre: 3, Rec: 2", desc: "Increases attributes: Con: 3, End: 2, Dex: 3, Pre: 3, Rec: 2" },
    { id: "t_field_ops_training", name: "Field Ops Training", type: "progressive", stats: "Con: 3, End: 2, Int: 3, Ego: 3, Rec: 2", desc: "Increases attributes: Con: 3, End: 2, Int: 3, Ego: 3, Rec: 2" },
    { id: "t_jack_of_all_trades", name: "Jack of All Trades", type: "progressive", stats: "All: 2", desc: "Increases attributes: All: 2" }
];

let currentTalentSlot = null;

if (!document.getElementById('talent-selection-modal')) {
    let tModalHtml = `
    <div id="talent-selection-modal" class="floating-window" style="display:none; width: 900px; max-height: 80vh; overflow-y: auto; padding: 0;">
        <div class="modal-header" style="position: sticky; top: 0; background: #1e1e1e; z-index: 100; padding: 20px 25px; border-bottom: 2px solid #333; margin: 0; box-shadow: 0 4px 6px rgba(0,0,0,0.5);">
            <h3 style="margin: 0; font-size: 36px; color:#4DA8DA;">Select Character Talent</h3>
            <span class="close-btn" onclick="closeTalentSelectionModal()" style="font-size: 40px; line-height: 1;">&times;</span>
        </div>
        <div id="talent-selection-content" style="padding: 25px;"></div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', tModalHtml);
}

window.openTalentSelectionModal = function(slotIndex) {
    currentTalentSlot = slotIndex;
    document.getElementById('talent-selection-modal').style.display = 'block';
    renderTalentSelectionModal();
}

window.closeTalentSelectionModal = function() {
    currentTalentSlot = null;
    document.getElementById('talent-selection-modal').style.display = 'none';
    render();
}

window.setTalentForSlot = function(talentId) {
    if (currentTalentSlot !== null) {
        if (!build.talents) build.talents = new Array(7).fill(null);
        build.talents[currentTalentSlot] = talentId === 'none' ? null : talentId;
        closeTalentSelectionModal();
    }
}

function renderTalentSelectionModal() {
    let content = document.getElementById('talent-selection-content');
    let html = `<div style="margin-bottom: 20px;"><button class="big-tree-btn" style="color:white; border-color:#ff5555; font-size: 20px;" onclick="setTalentForSlot('none')">Clear Slot</button></div>`;
    
    html += `<div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); align-items: start; gap: 15px;">`;
    
    // Rule Enforcement: Enforce Innate on level 1 slot, Progressive on levels 6-21 tracks
    let targetType = (currentTalentSlot === 0) ? "innate" : "progressive";
    
    CO_TALENTS.forEach(t => {
        if (t.type !== targetType) return; // Drop everything else out of view
        
        let isSelected = build.talents && build.talents.includes(t.id);
        let selectedStyle = isSelected ? `border-color: #4DA8DA; background: rgba(77, 168, 218, 0.1);` : ``;
        
        // Formats tooltips cleanly, substituting old source <br /> breaks with newline spaces
        let plainTooltipDesc = t.desc.replace(/<br\s*\/?>/gi, '\n');
        
        // REDUCED: Dropped padding from 15px to 6px/10px, min-height from 75px to 46px
        html += `
        <div class="power" style="${selectedStyle} padding: 6px 10px; text-align: center; display: flex; flex-direction: column; justify-content: center; min-height: 46px; border-radius: 4px; cursor: pointer;" onclick="setTalentForSlot('${t.id}')" title="${plainTooltipDesc}">
            <div class="name" style="font-size: 14px; font-weight: bold; color: #4DA8DA; text-shadow: 1px 1px 2px #000; line-height: 1.2;">${t.name}</div>
            <div style="font-size: 11px; color: #888; margin-top: 2px; font-family: monospace;">${t.stats}</div>
        </div>`;
    });
    
    html += `</div>`;
    content.innerHTML = html;
}


// --- POWER VARIANTS DATABASE ---
const powerVariants = [
	{ id: "v_havoc_hammer", name: "Havoc Hammer" },
	{ id: "v_electric_vengeance", name: "Electric Vengeance" },
	{ id: "v_brilliant_cleave", name: "Brilliant Cleave" },
	{ id: "v_frost_ice_rifle", name: "Frost Ice Rifle" },
	{ id: "v_cauldron_fire", name: "Cauldron Fire" },
	{ id: "v_laser_shotgun", name: "Laser Shotgun" },
	{ id: "v_qularr_toxic_rifle", name: "Qularr Toxic Rifle" },
	{ id: "v_pulp_fiction_ray_gun", name: "Pulp Fiction Ray Gun" },
	{ id: "v_umd_ghosthunter_phase_rifle", name: "U-MD Ghosthunter Phase Rifle" },
	{ id: "v_lightning_bolter", name: "Lightning Bolter" },
	{ id: "v_flaming_pumpkin", name: "Flaming Pumpkin" },
	{ id: "v_power_cycle", name: "Power Cycle" },
	{ id: "v_denial_of_service", name: "Denial Of Service" },
	{ id: "v_shadow_shred", name: "Shadow Shred" },
	{ id: "v_blade_bomb", name: "Blade Bomb" },
	{ id: "v_blade_barrage", name: "Blade Barrage" },
	{ id: "v_virulent_shot", name: "Virulent Shot" },
	{ id: "v_toxic_blades", name: "Venom Shock" },
	{ id: "v_venom_shock", name: "Venom Shock" },
	{ id: "v_blight_touch", name: "Blight Touch" },
	{ id: "v_icefall", name: "Icefall" },
	{ id: "v_thundering_claws", name: "Thundering Claws" },
	{ id: "v_qularr_toxic_barrage", name: "Qularr Toxic Barrage" },
	{ id: "v_pulp_fiction_rifle", name: "Pulp Fiction Rifle" },
	{ id: "v_scorching_claw", name: "Scorching Claw" },
	{ id: "v_flaming_frenzy", name: "Flaming Frenzy" },
	{ id: "v_fiery_spirit", name: "Fiery Spirit" },
	{ id: "v_searing_carnage", name: "Searing Carnage" },
	{ id: "v_fire_fangs", name: "Fire Fangs" },
	{ id: "v_haunted_blades", name: "Haunted Blades" },
	{ id: "v_callous_cleaver", name: "Callous Cleaver" },
	{ id: "v_glacial_rend", name: "Glacial Rend" },
	{ id: "v_ice_breaker", name: "Ice Breaker" },
	{ id: "v_frozen_lance", name: "Frozen Lance" },
	{ id: "v_bitter_storm", name: "Bitter Storm" },
	{ id: "v_shocking_strikes", name: "Shocking Strikes" },
	{ id: "v_bolting_fervor", name: "Bolting Fervor" },
	{ id: "v_ray_tracer", name: "Ray Tracer" },
	{ id: "v_hellrend", name: "Tendrils of Anguish" },
	{ id: "v_tendrils_of_anguish", name: "Tendrils of Anguish" },
	{ id: "v_cryoclysm", name: "Cryoclysm" },
	{ id: "v_stormpiercer", name: "Stormpiercer" },
	{ id: "v_burning_blades", name: "Burning Blades" },
	{ id: "v_heat_vortex", name: "Heat Vortex" }
];

// --- DEVICES EXTRACTION ENGINE ---
const devices = [];
if (typeof HCData !== 'undefined' && HCData.device && typeof spriteData !== 'undefined') {
	HCData.device.forEach((d, index) => {
		if (!d || !d.name) return;

		let possibleKeys = [];
		if (d.icon) possibleKeys.push(d.icon.toLowerCase());
		if (d.powers && Array.isArray(d.powers) && d.powers.length > 0 && d.powers[0].icon) {
			possibleKeys.push(d.powers[0].icon.toLowerCase());
		} else if (d.powers && d.powers.icon) {
			possibleKeys.push(d.powers.icon.toLowerCase());
		}

		let pNameSprite = d.name.replace(/[^a-zA-Z0-9]/g, "");
		possibleKeys.push(("Device_" + pNameSprite).toLowerCase());
		possibleKeys.push(("Inventory_" + pNameSprite).toLowerCase());
		possibleKeys.push(pNameSprite.toLowerCase());

		let actualKey = Object.keys(spriteData.frames).find(k => possibleKeys.includes(k.toLowerCase()));

		let frame = { x: 0, y: 0, w: 24, h: 32 };
		if (actualKey && spriteData.frames[actualKey]) {
			frame = spriteData.frames[actualKey].frame;
		} else if (spriteData.frames["Any_Generic"]) {
			frame = spriteData.frames["Any_Generic"].frame;
		}

		let desc = d.toolTip || "";
		if (d.powers && d.powers.toolTip) {
			desc += (desc ? "<br><br>" : "") + d.powers.toolTip;
		} else if (d.powers && Array.isArray(d.powers) && d.powers.length > 0 && d.powers[0].toolTip) {
			desc += (desc ? "<br><br>" : "") + d.powers[0].toolTip;
		}
		desc = desc.replace(/"/g, '&quot;').replace(/\n/g, '<br>');

		devices.push({
			id: d.id !== undefined ? d.id : index,
			type: d.type || 0,
			name: d.name,
			desc: desc,
			spriteX: frame.x,
			spriteY: frame.y,
			width: frame.w,
			height: frame.h,
			renderScale: 1.0,
			image: "spritesheet.png"
		});
	});
}

function buildSpriteHTML(item, globalScale = 1.0) {
	let x = item.spriteX || 0, y = item.spriteY || 0, w = item.width || 42, h = item.height || 42, scale = (item.renderScale || 1.0) * globalScale;
	let imgSrc = item.image || "sprites.png";

	if (w === 0 || h === 0) return `<div style="width: ${42 * globalScale}px; height: ${42 * globalScale}px; background: transparent; border-radius: 4px;"></div>`;
	return `<div style="width: ${w * scale}px; height: ${h * scale}px; overflow: hidden; position: relative; border-radius: 4px; flex-shrink: 0; background: transparent;"><div style="width: ${w}px; height: ${h}px; transform: scale(${scale}); transform-origin: top left; position: absolute; top: 0; left: 0; background: transparent;"><img src="${imgSrc}" style="position: absolute; left: -${x}px; top: -${y}px; image-rendering: -moz-crisp-edges; image-rendering: -webkit-optimize-contrast; image-rendering: crisp-edges; image-rendering: pixelated; max-width: none;"></div></div>`;
}

// Global Advantage Tracker
function getTotalAdvantagePoints() {
	let total = 0;
	for (let pId in build.adv) {
		let pAdvs = build.adv[pId];
		let pObj = powers.find(p => p.id === pId);
		if (pObj && pObj.adv && pAdvs.length > 0) {
			pAdvs.forEach(aName => {
				if (pObj.isEnergyUnlock && (aName === "Rank 2" || aName === "Rank 3")) return;

				let aObj = pObj.adv.find(a => a.name === aName);
				if (aObj && !aObj.isHidden) total += aObj.cost;
			});
		}
	}
	return total;
}

// --- POWER VALIDATION ENGINE ---
function checkUnlockForSlot(power, slotIndex, simulatedBuild) {
	if (power.tier === "EB" || power.tier === 0 || power.tier === 4) return true;
	let nonEbTotal = 0, powerSetCount = 0;

	let powerSets = [power.set];
	if (power.sharedWith) powerSets = powerSets.concat(power.sharedWith);

	for(let i = 0; i < slotIndex; i++) {
		let id = simulatedBuild[i];
		if(id) {
			let p = powers.find(x => x.id === id);
			if(p) {
				if(p.tier !== "EB") nonEbTotal++;

				let pSets = [p.set];
				if (p.sharedWith) pSets = pSets.concat(p.sharedWith);
				if (pSets.some(s => powerSets.includes(s))) powerSetCount++;
			}
		}
	}

	if (power.tier == 1) return powerSetCount >= 1 || nonEbTotal >= 2;
	if (power.tier == 2) return powerSetCount >= 3 || nonEbTotal >= 4;
	if (power.tier == 3) return powerSetCount >= 5 || nonEbTotal >= 6;
	return false;
}

// --- POWER UI INTERACTION ---
function selectSlot(index) {
	let nextEmpty = build.powers.indexOf(null);
	if(nextEmpty === -1) nextEmpty = 13;
	if(index <= nextEmpty) { activeSlotIndex = index; render(); }
}

function removePowerFromSlot(index, e) {
	e.stopPropagation();
	let pwrId = build.powers[index];
	if(pwrId) delete build.adv[pwrId];
	if(pwrId === expandedPowerId) expandedPowerId = null;

	let simBuild = [...build.powers];
	simBuild.splice(index, 1);
	simBuild.push(null);

	build.powers = simBuild;
	let nextEmpty = build.powers.indexOf(null);
	activeSlotIndex = nextEmpty !== -1 ? nextEmpty : 13;
	render();
}

window.jumpToPower = function(id, e) {
	e.stopPropagation();
	let pwr = powers.find(p => p.id === id);
	if (pwr) {
		currentSet = pwr.set;
		expandedPowerId = id;
		render();
		setTimeout(() => {
			let el = document.getElementById('lib-power-' + id);
			if(el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}, 50);
	}
};

function togglePower(id) {
	let pwr = powers.find(p => p.id === id);

	let existingIndex = build.powers.indexOf(id);
	if(existingIndex !== -1) {
		expandedPowerId = (expandedPowerId === id) ? null : id;
		render();
		return;
	}

	let isEB = (pwr.tier === "EB");

	// Hard Limit: EBs must be in Slot 0
	if (isEB) {
		activeSlotIndex = 0;
	} else {
		if (activeSlotIndex === 0) {
			let nextNonEBSlot = -1;
			for (let i = 1; i < MAX_POWERS; i++) {
				if (build.powers[i] === null) {
					nextNonEBSlot = i;
					break;
				}
			}
			if (nextNonEBSlot !== -1) {
				activeSlotIndex = nextNonEBSlot;
			} else {
				return showMessage("No empty slots available for non-Energy Builder powers.", "error");
			}
		}
	}

	if (activeSlotIndex === 0 && !isEB) return showMessage("Only Energy Builders can be placed in the first slot.", "error");
	if (activeSlotIndex > 0 && isEB) return showMessage("Energy Builders can only be placed in the first slot.", "error");

	if (!checkUnlockForSlot(pwr, activeSlotIndex, build.powers)) {
		return showMessage("Tier prerequisites not met for this slot position.", "error");
	}

	let simBuild = [...build.powers];
	let oldPower = simBuild[activeSlotIndex];
	simBuild[activeSlotIndex] = id;

	// Hard Limit: Only One Ultimate Allowed
	if (pwr.tier == 4) {
		let ultCount = simBuild.filter(pid => pid && powers.find(x => x.id === pid)?.tier == 4).length;
		if (ultCount > 1) return showMessage("You can only have one Ultimate (Tier 4) power.", "error");
	}

	// Hard Limit: Only One Energy Unlock Allowed
	if (pwr.isEnergyUnlock) {
		let unlockCount = simBuild.filter(pid => pid && powers.find(x => x.id === pid)?.isEnergyUnlock).length;
		if (unlockCount > 1) return showMessage("You can only have one Energy Unlock power.", "error");
	}

	if(oldPower && oldPower !== id) {
		delete build.adv[oldPower];
		if(oldPower === expandedPowerId) expandedPowerId = null;
	}

	build.powers = simBuild;
	if(!build.adv[id]) build.adv[id] = [];
	expandedPowerId = id;

	let nextEmpty = build.powers.indexOf(null);
	activeSlotIndex = nextEmpty !== -1 ? nextEmpty : 13;
	render();
}

// --- DRAG AND DROP ENGINE ---
let draggedSlotIndex = null;

window.dragStart = function(e, index) {
	if (index === 0 || build.powers[index] === null) {
		e.preventDefault();
		return;
	}
	draggedSlotIndex = index;
	e.dataTransfer.effectAllowed = 'move';
	e.dataTransfer.setData('text/plain', index);

	// THE FIX: Provide a clean text-based ghost image to bypass the HTML5 Sprite clipping bug
	let detailsNode = e.currentTarget.querySelector('.slot-details');
	if (detailsNode) {
		e.dataTransfer.setDragImage(detailsNode, 0, 10);
	}
};

window.dragOver = function(e, index) {
	if (index === 0) return;
	e.preventDefault();
	e.dataTransfer.dropEffect = 'move';
	e.currentTarget.classList.add('drag-over');
};

window.dragLeave = function(e) {
	e.currentTarget.classList.remove('drag-over');
};

window.dropSlot = function(e, targetIndex) {
	e.preventDefault();
	e.currentTarget.classList.remove('drag-over');

	if (draggedSlotIndex === null || draggedSlotIndex === targetIndex || targetIndex === 0) {
		draggedSlotIndex = null;
		return;
	}

	// Safely Swap Powers, Variants, and Devices
	let tempPower = build.powers[targetIndex];
	build.powers[targetIndex] = build.powers[draggedSlotIndex];
	build.powers[draggedSlotIndex] = tempPower;

	let tempVar = build.variants[targetIndex];
	build.variants[targetIndex] = build.variants[draggedSlotIndex];
	build.variants[draggedSlotIndex] = tempVar;

	let tempDev = build.devices[targetIndex];
	build.devices[targetIndex] = build.devices[draggedSlotIndex];
	build.devices[draggedSlotIndex] = tempDev;

	draggedSlotIndex = null;
	render();
};

// Update Advantage Logic
window.toggleAdvantage = function(powerId, advName, cost) {
	let maxAdvPoints = 36 + (build.cams ? build.cams.level : 0);
	let selectedAdvs = build.adv[powerId] || [];

	if (selectedAdvs.includes(advName)) {
		if (advName === "Rank 2" && selectedAdvs.includes("Rank 3")) {
			return showMessage("You must remove Rank 3 before taking off Rank 2.", "error");
		}
		build.adv[powerId] = selectedAdvs.filter(a => a !== advName);
	} else {
		if (advName === "Rank 3" && !selectedAdvs.includes("Rank 2")) {
			return showMessage("You must select Rank 2 before adding Rank 3.", "error");
		}

		let currentPoints = 0;
		selectedAdvs.forEach(aName => {
			let advData = powers.find(p => p.id === powerId).adv.find(a => a.name === aName);
			if (advData && !advData.isHidden) currentPoints += advData.cost;
		});

		if (currentPoints + cost > 5) return showMessage("Maximum 5 Advantage Points per power!", "error");
		if (getTotalAdvantagePoints() + cost > maxAdvPoints) return showMessage("Maximum " + maxAdvPoints + " Advantage Points allowed for the entire build!", "error");

		build.adv[powerId].push(advName);
	}
	render();
}

window.updateCams = function(key, val) {
	if (!build.cams) build.cams = { polarity: 'Blue', level: 0 };
	if (key === 'level') build.cams.level = parseInt(val);
	if (key === 'polarity') build.cams.polarity = val;
	render();
};

function setPowerset(setId) { currentSet = setId; render(); }

// --- VARIANT SELECTION ENGINE ---
let currentVariantSlot = null;

if (!document.getElementById('variant-selection-modal')) {
	let vModalHtml = `
	<div id="variant-selection-modal" class="floating-window" style="display:none; width: 900px; max-height: 80vh; overflow-y: auto; padding: 0;">
		<div class="modal-header" style="position: sticky; top: 0; background: #1e1e1e; z-index: 100; padding: 20px 25px; border-bottom: 2px solid #333; margin: 0; box-shadow: 0 4px 6px rgba(0,0,0,0.5);">
			<h3 style="margin: 0; font-size: 36px; color:#4DA8DA;">Select Power Variant</h3>
			<span class="close-btn" onclick="closeVariantSelectionModal()" style="font-size: 40px; line-height: 1;">&times;</span>
		</div>
		<div id="variant-selection-content" style="padding: 25px;"></div>
	</div>`;
	document.body.insertAdjacentHTML('beforeend', vModalHtml);
}

window.openVariantSelectionModal = function(slotIndex) {
	currentVariantSlot = slotIndex;
	document.getElementById('variant-selection-modal').style.display = 'block';
	renderVariantSelectionModal();
}

window.closeVariantSelectionModal = function() {
	currentVariantSlot = null;
	document.getElementById('variant-selection-modal').style.display = 'none';
	render();
}

window.setVariantForSlot = function(variantId) {
	if (currentVariantSlot !== null) {
		build.variants[currentVariantSlot] = variantId === 'none' ? null : variantId;
		closeVariantSelectionModal();
	}
}

function renderVariantSelectionModal() {
	let content = document.getElementById('variant-selection-content');
	let html = `<div style="margin-bottom: 20px;"><button class="big-tree-btn" style="color:white; border-color:#ff5555; font-size: 20px;" onclick="setVariantForSlot('none')">Clear Slot</button></div>`;

	html += `<div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); align-items: start; gap: 15px;">`;

	powerVariants.forEach(v => {
		let isSelected = build.variants.includes(v.id);
		let selectedStyle = isSelected ? `border-color: #4DA8DA; background: rgba(77, 168, 218, 0.1);` : ``;

		html += `
		<div class="power" style="${selectedStyle} padding: 15px; text-align: center;" onclick="setVariantForSlot('${v.id}')">
			<div class="name" style="font-size: 16px;">${v.name}</div>
		</div>`;
	});

	html += `</div>`;
	content.innerHTML = html;
}

// --- DEVICE SELECTION ENGINE ---
let currentDeviceSlot = null;

if (!document.getElementById('device-selection-modal')) {
	let modalHtml = `
	<div id="device-selection-modal" class="floating-window" style="display:none; width: 900px; max-height: 80vh; overflow-y: auto; padding: 0;">
		<div class="modal-header" style="position: sticky; top: 0; background: #1e1e1e; z-index: 100; padding: 20px 25px; border-bottom: 2px solid #333; margin: 0; box-shadow: 0 4px 6px rgba(0,0,0,0.5);">
			<h3 id="device-selector-title" style="margin: 0; font-size: 36px;">Select Device</h3>
			<span class="close-btn" onclick="closeDeviceSelectionModal()" style="font-size: 40px; line-height: 1;">&times;</span>
		</div>
		<div id="device-selection-content" style="padding: 25px;"></div>
	</div>`;
	document.body.insertAdjacentHTML('beforeend', modalHtml);
}

window.openDeviceSelectionModal = function(slotIndex) {
	currentDeviceSlot = slotIndex;
	document.getElementById('device-selection-modal').style.display = 'block';
	renderDeviceSelectionModal();
}

window.closeDeviceSelectionModal = function() {
	currentDeviceSlot = null;
	document.getElementById('device-selection-modal').style.display = 'none';
	render();
}

window.setDeviceForSlot = function(deviceId) {
	if (currentDeviceSlot !== null) {
		build.devices[currentDeviceSlot] = deviceId === 'none' ? null : parseInt(deviceId);
		closeDeviceSelectionModal();
	}
}

window.toggleDeviceCategory = function(catId) {
	let el = document.getElementById(catId);
	let btn = document.getElementById(catId + '-btn');
	if (el.style.display === 'none') {
		el.style.display = 'grid';
		btn.innerText = '[-]';
	} else {
		el.style.display = 'none';
		btn.innerText = '[+]';
	}
}

function renderDeviceSelectionModal() {
	let content = document.getElementById('device-selection-content');
	let html = `<div style="margin-bottom: 20px;"><button class="big-tree-btn" style="color:white; border-color:#ff5555; font-size: 20px;" onclick="setDeviceForSlot('none')">Clear Slot</button></div>`;

	let deviceGroups = {};
	devices.forEach(d => {
		let typeName = (typeof HCData !== 'undefined' && HCData.deviceType && HCData.deviceType[d.type])
			? HCData.deviceType[d.type].name
			: "General";
		if (!deviceGroups[typeName]) deviceGroups[typeName] = [];
		deviceGroups[typeName].push(d);
	});

	let catIndex = 0;
	for (let category in deviceGroups) {
		let safeCatId = 'dev-cat-' + catIndex;

		html += `
		<h3 style="color: #4DA8DA; border-bottom: 1px solid #333; padding-bottom: 5px; margin-top: 25px; font-size: 26px; cursor: pointer; user-select: none;" onclick="toggleDeviceCategory('${safeCatId}')">
			<span id="${safeCatId}-btn" style="display: inline-block; width: 30px; color: #ffeb3b;">[+]</span> ${category}
		</h3>`;

		html += `<div id="${safeCatId}" class="grid" style="display: none; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); align-items: start; margin-bottom: 30px; gap: 15px;">`;

		deviceGroups[category].forEach(d => {
			let isSelected = build.devices.includes(d.id);
			let selectedStyle = isSelected ? `border-color: #4DA8DA; background: rgba(77, 168, 218, 0.1);` : ``;

			let plainDesc = d.desc.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

			html += `
			<div class="power" style="${selectedStyle} padding: 12px; text-align: center;" onclick="setDeviceForSlot('${d.id}')" title="${plainDesc}">
				<div class="name" style="font-size: 16px;">${d.name}</div>
			</div>`;
		});
		html += `</div>`;
		catIndex++;
	}

	content.innerHTML = html;
}

// --- STAT SELECTION ENGINE ---
let currentStatSlot = null;

function openStatSelectionModal(slotKey) {
	currentStatSlot = slotKey;
	document.getElementById('stat-selection-modal').style.display = 'block';

	let title = "Select Primary Stat";
	if (slotKey === 'sec1') title = "Select Secondary Stat 1";
	if (slotKey === 'sec2') title = "Select Secondary Stat 2";
	document.getElementById('stat-selector-title').innerText = title;

	renderStatSelectionModal();
}

function closeStatSelectionModal() {
	currentStatSlot = null;
	document.getElementById('stat-selection-modal').style.display = 'none';
	render();
}

function setStatCategory(val) {
	if (!currentStatSlot) return;

	let oldVal = build.stats[currentStatSlot];
	let finalVal = val === "none" ? null : val;

	build.stats[currentStatSlot] = finalVal;

	if (currentStatSlot === "primary" && oldVal !== finalVal) {
		if (build.specs.primary !== null) {
			let oldTree = specializations.find(t => t.id.toString() === build.specs.primary.toString());
			if (oldTree) oldTree.perks.forEach(p => delete build.specs.points[p.id]);
		}

		if (finalVal) {
			let statTree = specializations.find(t => t.name === finalVal);
			build.specs.primary = statTree ? statTree.id : null;
		} else {
			build.specs.primary = null;
		}

		if(build.specs.mastery !== null) {
			let masteryTree = specializations.find(t => t.mastery && t.mastery.id.toString() === build.specs.mastery.toString());
			if(!masteryTree || (
				(build.specs.primary === null || build.specs.primary.toString() !== masteryTree.id.toString()) &&
				(build.specs.sec1 === null || build.specs.sec1.toString() !== masteryTree.id.toString()) &&
				(build.specs.sec2 === null || build.specs.sec2.toString() !== masteryTree.id.toString())
			)) {
				build.specs.mastery = null;
			}
		}
	}

	closeStatSelectionModal();
}

function renderStatSelectionModal() {
	let content = document.getElementById('stat-selection-content');
	let html = `<div class="big-tree-grid">`;
	html += `<button class="big-tree-btn" style="color:white; border-color:#ff5555;" onclick="setStatCategory('none')">Clear Selection</button>`;

	STAT_TREES.forEach(stat => {
		let isUsedElsewhere = (
			(currentStatSlot !== 'primary' && build.stats.primary === stat) ||
			(currentStatSlot !== 'sec1' && build.stats.sec1 === stat) ||
			(currentStatSlot !== 'sec2' && build.stats.sec2 === stat)
		);
		if (isUsedElsewhere) return;

		let sColor = STAT_COLORS[stat] || '#4DA8DA';
		html += `<button class="big-tree-btn" onclick="setStatCategory('${stat}')" style="color: ${sColor}; border-color: ${sColor};">${stat}</button>`;
	});

	html += `</div>`;
	content.innerHTML = html;
}

// --- SPECIALIZATION ENGINE ---
let currentSpecSlot = null;

function getSpecTreePoints(treeId) {
	if(treeId === null || !build.specs.points) return 0;
	let treeObj = specializations.find(t => t.id.toString() === treeId.toString());
	if(!treeObj) return 0;
	let count = 0;
	treeObj.perks.forEach(p => { if(build.specs.points[p.id]) count += build.specs.points[p.id]; });
	return count;
}

function getTotalSpecPoints() {
	let count = 0;
	for(let k in build.specs.points) count += build.specs.points[k];
	if (build.specs.mastery) count += 1;
	return count;
}

function openTreeSelectionModal(slotKey) {
	if(typeof specializations === 'undefined' || specializations.length === 0) return alert("ERROR: Specialization data missing!");
	if(slotKey === 'primary') return;

	currentSpecSlot = slotKey;
	document.getElementById('tree-selection-modal').style.display = 'block';

	let title = "Select Tree";
	if (slotKey === 'sec1') title = "Select Secondary Tree 1";
	if (slotKey === 'sec2') title = "Select Secondary Tree 2";
	if (slotKey === 'mastery') title = "Select Mastery";
	document.getElementById('tree-selector-title').innerText = title;

	renderTreeSelectionModal();
}

function closeTreeSelectionModal() {
	currentSpecSlot = null;
	document.getElementById('tree-selection-modal').style.display = 'none';
	render();
}

function setSpecCategory(val) {
	if (!currentSpecSlot) return;

	if (currentSpecSlot === 'mastery') {
		build.specs.mastery = (val === 'none') ? null : val;
		closeTreeSelectionModal();
		return;
	}

	let oldVal = build.specs[currentSpecSlot];
	let finalVal = null;
	if (val !== "none") {
		let matchedTree = specializations.find(t => t.id.toString() === val.toString());
		if (matchedTree) finalVal = matchedTree.id;
	}

	build.specs[currentSpecSlot] = finalVal;

	if(oldVal !== null && oldVal !== finalVal) {
		let treeObj = specializations.find(t => t.id.toString() === oldVal.toString());
		if(treeObj) { treeObj.perks.forEach(p => { delete build.specs.points[p.id]; }); }
	}

	if(build.specs.mastery !== null) {
		let masteryTree = specializations.find(t => t.mastery && t.mastery.id.toString() === build.specs.mastery.toString());
		if(!masteryTree || (
			(build.specs.primary === null || build.specs.primary.toString() !== masteryTree.id.toString()) &&
			(build.specs.sec1 === null || build.specs.sec1.toString() !== masteryTree.id.toString()) &&
			(build.specs.sec2 === null || build.specs.sec2.toString() !== masteryTree.id.toString())
		)) {
			build.specs.mastery = null;
		}
	}

	closeTreeSelectionModal();
	if (finalVal !== null) {
		openPerkModal(finalVal, currentSpecSlot);
	}
}

function renderTreeSelectionModal() {
	let content = document.getElementById('tree-selection-content');
	let html = `<div class="big-tree-grid">`;

	if (currentSpecSlot === 'mastery') {
		html += `<button class="big-tree-btn" style="color:white; border-color:#ff5555;" onclick="setSpecCategory('none')">Clear Mastery</button>`;
		let activeTrees = [build.specs.primary, build.specs.sec1, build.specs.sec2].filter(x => x !== null);
		activeTrees.forEach(tId => {
			let tObj = specializations.find(t => t.id.toString() === tId.toString());
			if(tObj && tObj.mastery) {
				let sColor = STAT_COLORS[tObj.name] || '#4DA8DA';
				html += `<button class="big-tree-btn" onclick="setSpecCategory('${tObj.mastery.id}')" style="color: ${sColor}; border-color: ${sColor};">[${tObj.name}] ${tObj.mastery.name}</button>`;
			}
		});
	} else {
		html += `<button class="big-tree-btn" style="color:white; border-color:#ff5555;" onclick="setSpecCategory('none')">Clear Selection</button>`;
		specializations.forEach(t => {
			if (STAT_TREES.includes(t.name)) return;

			let isUsedElsewhere = (
				(currentSpecSlot !== 'primary' && build.specs.primary !== null && build.specs.primary.toString() === t.id.toString()) ||
				(currentSpecSlot !== 'sec1' && build.specs.sec1 !== null && build.specs.sec1.toString() === t.id.toString()) ||
				(currentSpecSlot !== 'sec2' && build.specs.sec2 !== null && build.specs.sec2.toString() === t.id.toString())
			);
			if (isUsedElsewhere) return;

			html += `<button class="big-tree-btn" onclick="setSpecCategory('${t.id}')">${t.name}</button>`;
		});
	}
	html += `</div>`;
	content.innerHTML = html;
}

let activePerkModalTree = null;
function openPerkModal(treeId, slotKey) {
	if(!treeId) return;
	currentSpecSlot = slotKey;
	activePerkModalTree = treeId;
	document.getElementById('perk-allocation-modal').style.display = 'flex';

	let changeBtn = document.getElementById('change-tree-btn');
	if (slotKey === 'primary') {
		changeBtn.innerText = "Change Stat";
		changeBtn.onclick = () => { closePerkModal(); openStatSelectionModal('primary'); };
	} else {
		changeBtn.innerText = "Change Tree";
		changeBtn.onclick = () => { closePerkModal(); openTreeSelectionModal(currentSpecSlot); };
	}

	renderPerkModal();
}

function closePerkModal() {
	activePerkModalTree = null;
	document.getElementById('perk-allocation-modal').style.display = 'none';
	render();
}

function adjustPerkPoints(perkId, amount) {
	if(!activePerkModalTree) return;
	let treeObj = specializations.find(t => t.id.toString() === activePerkModalTree.toString());
	let perkObj = treeObj.perks.find(p => p.id === perkId);
	if(!perkObj) return;

	let currentPts = build.specs.points[perkId] || 0;
	let newPts = currentPts + amount;

	if(newPts < 0) return;
	if(newPts > perkObj.maxPoints) return;

	let treeTotal = getSpecTreePoints(activePerkModalTree);

	if(amount > 0) {
		if(getTotalSpecPoints() >= 30) return showMessage("You have reached the maximum 30 Specialization points!");
		if(treeTotal >= 10) return showMessage("You cannot spend more than 10 points in a single tree.");
		if(perkObj.tier === 2 && treeTotal < 5) return showMessage("You must spend at least 5 points in this tree to unlock Tier 2.");
	} else if (amount < 0) {
		if(perkObj.tier === 1 && treeTotal <= 5) {
			let tier2Points = 0;
			treeObj.perks.forEach(p => { if (p.tier === 2 && build.specs.points[p.id]) tier2Points += build.specs.points[p.id]; });
			if(tier2Points > 0) return showMessage("Cannot remove: You must keep at least 5 points to support your Tier 2 perks.");
		}
	}

	if(newPts === 0) delete build.specs.points[perkId];
	else build.specs.points[perkId] = newPts;
	renderPerkModal();
}

function renderPerkModal() {
	if(!activePerkModalTree) return;
	let treeObj = specializations.find(t => t.id.toString() === activePerkModalTree.toString());
	let treeTotal = getSpecTreePoints(treeObj.id);

	document.getElementById('perk-modal-title').innerText = treeObj.name;
	document.getElementById('modal-tree-spent').innerText = treeTotal;

	let container = document.getElementById('perk-list-container');
	container.innerHTML = "";

	[1, 2].forEach(tierNum => {
		let tierPerks = treeObj.perks.filter(p => p.tier === tierNum);
		if(tierPerks.length === 0) return;

		let tierHeader = document.createElement('h3');
		tierHeader.style.color = "#4DA8DA";
		tierHeader.style.width = "100%";
		tierHeader.style.borderBottom = "1px solid #333";
		tierHeader.style.paddingBottom = "5px";
		tierHeader.style.fontSize = "26px";
		tierHeader.innerText = `Tier ${tierNum}` + (tierNum === 2 ? ` (Requires 5 Points)` : "");
		container.appendChild(tierHeader);

		let grid = document.createElement('div');
		grid.className = "spec-perk-grid";
		grid.style.width = "100%";

		let isTierLocked = (tierNum === 2 && treeTotal < 5);

		tierPerks.forEach(perk => {
			let pts = build.specs.points[perk.id] || 0;
			let isMax = pts >= perk.maxPoints;
			let color = pts > 0 ? "#4DA8DA" : "#fff";
			let boxColor = isMax ? "border-color: #ffeb3b;" : (pts > 0 ? "border-color: #4DA8DA;" : "");

			let div = document.createElement('div');
			div.className = "spec-perk";
			div.style = boxColor;
			if (isTierLocked && pts === 0) div.style.opacity = "0.4";

			div.innerHTML = `
				${buildSpriteHTML(perk, 1.4)}
				<div class="spec-perk-info" style="flex-grow: 1;">
					<div class="spec-perk-name" style="color: ${color}; font-weight: bold; font-size: 20px;">${perk.name}</div>
				</div>
				<div class="point-controls">
					<button class="point-btn" onclick="adjustPerkPoints('${perk.id}', -1)">-</button>
					<div class="point-display">${pts}/${perk.maxPoints}</div>
					<button class="point-btn" onclick="adjustPerkPoints('${perk.id}', 1)">+</button>
				</div>
				<div class="spec-perk-tooltip"><strong style="color:#4DA8DA; font-size:17px;">${perk.name}</strong><br><br>${perk.desc}</div>
			`;
			grid.appendChild(div);
		});
		container.appendChild(grid);
	});
}

function renderSpecsHUD() {
    let hud = document.getElementById('active-specs-hud');
    if (!hud) return;
    
    hud.style.position = 'relative'; 

    // --- ATTRIBUTES RENDER ---
    let statHtml = '';
    let statCats = [
        { key: "primary", label: "Primary Stat" },
        { key: "sec1", label: "Secondary Stat 1" },
        { key: "sec2", label: "Secondary Stat 2" }
    ];
    
    statCats.forEach(cat => {
        let sVal = build.stats[cat.key];
        if (sVal) {
            let colorHex = STAT_COLORS[sVal] || '#ffeb3b';
            statHtml += `<div class="hud-row" style="margin-bottom:8px; white-space: nowrap;"><div class="hud-stat" onclick="openStatSelectionModal('${cat.key}')" style="color: ${colorHex}; text-shadow: 2px 2px 4px #000; cursor: pointer; font-size: 20px; font-weight: bold; white-space: nowrap;">${cat.label}: ${sVal}</div></div>`;
        } else {
            statHtml += `<div class="hud-row" style="margin-bottom:8px; white-space: nowrap;"><div class="hud-stat empty" onclick="openStatSelectionModal('${cat.key}')" style="color: #666; cursor: pointer; font-size: 20px; font-style: italic; white-space: nowrap;">${cat.label}</div></div>`;
        }
    });

    // --- CO INNATE & PROGRESSIVE TALENTS RENDER ---
    let talentsLabels = ["Innate (L1)", "Talent (L6)", "Talent (L9)", "Talent (L12)", "Talent (L15)", "Talent (L18)", "Talent (L21)"];
    let talentsHtml = `<div style="display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 165px; padding-right: 5px;">`;

    for(let i = 0; i < 7; i++) {
        let tId = build.talents ? build.talents[i] : null;
        if (tId !== null) {
            let tObj = CO_TALENTS.find(t => t.id === tId);
            if (tObj) {
                let plainTooltipDesc = tObj.desc.replace(/<br\s*\/?>/gi, '\n');
                talentsHtml += `
                <div class="hud-row" style="display: flex; align-items: center; justify-content: center; cursor: pointer; background: rgba(0,0,0,0.3); padding: 6px; border-radius: 4px; border: 1px solid #444; transition: 0.2s; width: 100%; box-sizing: border-box;" onmouseenter="this.style.background='rgba(77,168,218,0.1)'; this.style.borderColor='#4DA8DA'" onmouseleave="this.style.background='rgba(0,0,0,0.3)'; this.style.borderColor='#444'" onclick="openTalentSelectionModal(${i})" title="${plainTooltipDesc}">
                    <span style="color: #4DA8DA; font-weight: bold; font-size: 14px; text-shadow: 1px 1px 2px #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px; display: inline-block;">${tObj.name}</span>
                </div>`;
            }
        } else {
            talentsHtml += `
            <div class="hud-row" style="display: flex; align-items: center; justify-content: center; cursor: pointer; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; border: 1px dashed #555; transition: 0.2s; width: 100%; box-sizing: border-box;" onmouseenter="this.style.background='rgba(255,255,255,0.05)'" onmouseleave="this.style.background='rgba(0,0,0,0.2)'" onclick="openTalentSelectionModal(${i})">
                <span style="color: #666; font-style: italic; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px; display: inline-block;">${talentsLabels[i]}</span>
            </div>`;
        }
    }
    talentsHtml += `</div>`;

    // --- POWER VARIANTS RENDER ---
    let variantsHtml = `<div style="display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 165px; padding-right: 5px;">`;
    for(let i=0; i<5; i++) {
        let vId = build.variants[i];
        if (vId !== null) {
            let vObj = powerVariants.find(v => v.id === vId);
            if (vObj) {
                variantsHtml += `
                <div class="hud-row" style="display: flex; align-items: center; justify-content: center; cursor: pointer; background: rgba(0,0,0,0.3); padding: 6px; border-radius: 4px; border: 1px solid #444; transition: 0.2s; width: 100%; box-sizing: border-box;" onmouseenter="this.style.background='rgba(77,168,218,0.1)'; this.style.borderColor='#4DA8DA'" onmouseleave="this.style.background='rgba(0,0,0,0.3)'; this.style.borderColor='#444'" onclick="openVariantSelectionModal(${i})">
                    <span style="color: #4DA8DA; font-weight: bold; font-size: 14px; text-shadow: 1px 1px 2px #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px; display: inline-block;" title="${vObj.name}">${vObj.name}</span>
                </div>`;
            }
        } else {
            variantsHtml += `
            <div class="hud-row" style="display: flex; align-items: center; justify-content: center; cursor: pointer; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; border: 1px dashed #555; transition: 0.2s; width: 100%; box-sizing: border-box;" onmouseenter="this.style.background='rgba(255,255,255,0.05)'" onmouseleave="this.style.background='rgba(0,0,0,0.2)'" onclick="openVariantSelectionModal(${i})">
                <span style="color: #666; font-style: italic; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px; display: inline-block;">Empty Variant</span>
            </div>`;
        }
    }
    variantsHtml += `</div>`;

    // --- DEVICES RENDER ---
    let deviceHtml = `<div style="display: flex; flex-direction: column; gap: 4px; overflow-y: auto; max-height: 165px; padding-right: 5px;">`;
    for(let i=0; i<5; i++) {
        let dId = build.devices[i];
        if (dId !== null) {
            let dObj = devices.find(d => d.id === dId);
            if (dObj) {
                deviceHtml += `
                <div class="hud-row" style="display: flex; align-items: center; justify-content: center; cursor: pointer; background: rgba(0,0,0,0.3); padding: 6px; border-radius: 4px; border: 1px solid #444; transition: 0.2s; width: 100%; box-sizing: border-box;" onmouseenter="this.style.background='rgba(77,168,218,0.1)'; this.style.borderColor='#4DA8DA'" onmouseleave="this.style.background='rgba(0,0,0,0.3)'; this.style.borderColor='#444'" onclick="openDeviceSelectionModal(${i})">
                    <span style="color: #4DA8DA; font-weight: bold; font-size: 14px; text-shadow: 1px 1px 2px #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px; display: inline-block;" title="${dObj.name}">${dObj.name}</span>
                </div>`;
            }
        } else {
            deviceHtml += `
            <div class="hud-row" style="display: flex; align-items: center; justify-content: center; cursor: pointer; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; border: 1px dashed #555; transition: 0.2s; width: 100%; box-sizing: border-box;" onmouseenter="this.style.background='rgba(255,255,255,0.05)'" onmouseleave="this.style.background='rgba(0,0,0,0.2)'" onclick="openDeviceSelectionModal(${i})">
                <span style="color: #666; font-style: italic; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px; display: inline-block;">Empty Device</span>
            </div>`;
        }
    }
    deviceHtml += `</div>`;

    // --- C.A.M.S. & ADVANTAGES RADAR RENDER ---
    let globalAdvPoints = getTotalAdvantagePoints();
    let maxAdv = 36 + (build.cams ? build.cams.level : 0);
    let counterLabelColor = globalAdvPoints === maxAdv ? "#ff5555" : "rgba(255,255,255,0.4)";
    let counterValueColor = globalAdvPoints === maxAdv ? "#ff5555" : "rgba(255,255,255,0.8)";

    let camsPolarity = build.cams ? build.cams.polarity : 'Blue';
    let camsLevel = build.cams ? build.cams.level : 0;
    let camsColor = camsPolarity === 'Blue' ? '#4DA8DA' : '#4CAF50';

    let unifiedSystemsHtml = `
    <div style="display: flex; flex-direction: column; gap: 2px; flex-shrink: 0; background: rgba(0,0,0,0.5); padding: 4px 8px; border-radius: 6px; border: 1px solid #555; min-width: 200px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <div style="color: rgba(255,255,255,0.4); font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-right: 6px;">C.A.M.S.</div>
            <div style="display: flex; gap: 4px;">
                <select onchange="updateCams('polarity', this.value)" style="background: #111; color: ${camsColor}; border: 1px solid #444; border-radius: 4px; padding: 0px 4px; font-weight: bold; font-size: 12px; cursor: pointer; outline: none;">
                    <option value="Blue" ${camsPolarity === 'Blue' ? 'selected' : ''} style="color: #4DA8DA;">Blue</option>
                    <option value="Green" ${camsPolarity === 'Green' ? 'selected' : ''} style="color: #4CAF50;">Green</option>
                </select>
                <select onchange="updateCams('level', this.value)" style="background: #111; color: #fff; border: 1px solid #444; border-radius: 4px; padding: 0px 4px; font-weight: bold; font-size: 12px; cursor: pointer; outline: none;">
                    <option value="0" ${camsLevel == 0 ? 'selected' : ''}>Level 0</option>
                    <option value="1" ${camsLevel == 1 ? 'selected' : ''}>Level 1</option>
                    <option value="2" ${camsLevel == 2 ? 'selected' : ''}>Level 2</option>
                    <option value="3" ${camsLevel == 3 ? 'selected' : ''}>Level 3</option>
                    <option value="4" ${camsLevel == 4 ? 'selected' : ''}>Level 4</option>
                    <option value="5" ${camsLevel == 5 ? 'selected' : ''}>Level 5</option>
                </select>
            </div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px dashed #444; padding-top: 2px; width: 100%;">
            <div style="color: ${counterLabelColor}; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Adv. Points</div>
            <div style="color: ${counterValueColor}; font-size: 18px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); line-height: 1;">${globalAdvPoints} / ${maxAdv}</div>
        </div>
    </div>`;

    // --- MASTERY TRACK RENDER ---
    let masteryHtml = '';
    if (build.specs.mastery !== null) {
        let masterNode = null;
        specializations.forEach(t => { if(t.mastery && t.mastery.id.toString() === build.specs.mastery.toString()) masterNode = t.mastery; });
        if (masterNode) {
            masteryHtml = `
            <div style="background: rgba(255,0,0,0.1); border: 1px solid rgba(255,85,85,0.5); border-radius: 6px; padding: 6px 12px; flex-shrink: 0; box-shadow: inset 0 0 10px rgba(0,0,0,0.5); cursor: pointer; display: flex; align-items: center; justify-content: center; min-width: 176px;" onclick="openTreeSelectionModal('mastery')">
                <div style="color: #ff5555; font-size: 16px; font-weight: bold; text-shadow: 2px 2px 4px #000; letter-spacing: 0.5px;">MASTERY: ${masterNode.name}</div>
            </div>`;
        }
    } else {
        masteryHtml = `
        <div style="background: rgba(0,0,0,0.3); border: 1px dashed #555; border-radius: 6px; padding: 6px 12px; flex-shrink: 0; cursor: pointer; display: flex; align-items: center; justify-content: center; min-width: 176px;" onclick="openTreeSelectionModal('mastery')">
            <div style="color: #666; font-size: 14px; font-style: italic; font-weight: bold; letter-spacing: 0.5px;">MASTERY: NONE</div>
        </div>`;
    }

    // --- SPECIALIZATIONS RENDER ---
    let specHtml = '';
    let specCats = [
        { key: "primary", label: "Primary Tree" },
        { key: "sec1", label: "Secondary Tree 1" },
        { key: "sec2", label: "Secondary Tree 2" }
    ];

    specCats.forEach((cat, index) => {
        let tId = build.specs[cat.key];
        
        let rightSideInjection = '';
        if (cat.key === "primary") rightSideInjection = unifiedSystemsHtml; 
        if (cat.key === "sec1") rightSideInjection = masteryHtml; 

        let isLast = index === specCats.length - 1;
        let borderStyle = isLast ? '' : 'border-bottom: 1px solid rgba(255,255,255,0.05);';

        if (tId !== null) {
            let tObj = specializations.find(t => t.id.toString() === tId.toString());
            if (tObj) {
                let pts = getSpecTreePoints(tId);
                let activePerks = tObj.perks.filter(p => build.specs.points[p.id] > 0);
                
                let perksHtml = '';
                activePerks.forEach(p => {
                    perksHtml += `
                        <div class="active-perk-icon" style="position: relative; margin-bottom: 4px; cursor: help;">
                            ${buildSpriteHTML(p, 1.15)}
                            <div class="active-perk-badge" style="position: absolute; bottom: -5px; right: -5px; background: #000; color: #fff; font-size: 12px; font-weight: bold; width: 20px; height: 20px; line-height: 16px; text-align: center; border-radius: 50%; border: 2px solid #444;">${build.specs.points[p.id]}</div>
                            <div class="spec-perk-tooltip"><strong style="color:#4DA8DA; font-size:17px;">${p.name}</strong><br><br>${p.desc}</div>
                        </div>`;
                });

                let sColor = STAT_COLORS[tObj.name] || '#4DA8DA';
                specHtml += `
                    <div class="hud-row" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; padding-bottom: 4px; ${borderStyle} width: 100%;">
                        <div style="display: flex; align-items: flex-start; gap: 10px; flex: 1;">
                            <div class="hud-tree" onclick="openPerkModal('${tId}', '${cat.key}')" style="color: ${sColor}; text-shadow: 2px 2px 5px #000; cursor: pointer; font-size: 20px; font-weight: bold; min-width: 150px; padding-top: 3px;">${tObj.name} (${pts}/10)</div>
                            <div class="hud-perks" style="display: flex; flex-wrap: wrap; gap: 8px; width: 100%;">${perksHtml}</div>
                        </div>
                        ${rightSideInjection}
                    </div>`;
            }
        } else {
            let emptyText = cat.key === "primary" ? "Primary Tree" : `${cat.label}`;
            specHtml += `
                <div class="hud-row" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2px; padding-bottom: 4px; ${borderStyle} width: 100%;">
                    <div class="hud-tree empty" onclick="openTreeSelectionModal('${cat.key}')" style="color: #666; cursor: pointer; font-size: 18px; font-style: italic;">${emptyText}</div>
                    ${rightSideInjection}
                </div>`;
        }
    });

    // --- SHARE PANEL BUILDER ---
    let shareHtml = `
    <div class="share-container" style="display: flex; gap: 12px; align-items: center; justify-content: flex-start;">
        <div class="share-box" style="display: flex; gap: 6px; align-items: center;">
            <button onclick="exportCode()" style="background: #4DA8DA; color: #000; border: none; padding: 6px 12px; font-weight: bold; cursor: pointer; border-radius: 4px; font-size: 14px;">COPY BUILD</button>
            <input type="text" id="export-link" readonly placeholder="Output" style="background: #000; color: #0f0; border: 1px solid #444; padding: 6px; border-radius: 4px; width: 140px; font-size: 12px; font-family: monospace;">
        </div>
        <div class="share-box" style="display: flex; gap: 6px; align-items: center;">
            <input type="text" id="import-code" placeholder="Paste Code" style="background: #000; color: #0f0; border: 1px solid #444; padding: 6px; border-radius: 4px; width: 140px; font-size: 12px; font-family: monospace;">
            <button onclick="importCode()" style="background: #4DA8DA; color: #000; border: none; padding: 6px 12px; font-weight: bold; cursor: pointer; border-radius: 4px; font-size: 14px;">LOAD BUILD</button>
        </div>
    </div>`;

    // --- EXECUTE MASTER LAYOUT INJECTION ---
    hud.innerHTML = `
    <div style="display: flex; width: 100%; height: 100%; justify-content: space-between; overflow: visible;">
        
        <div style="display: flex; flex-direction: column; justify-content: space-between; flex-shrink: 0; padding-right: 20px; border-right: 1px dashed #444;">
            
            <div style="display: flex; gap: 15px;">
                <div style="width: 260px; flex-shrink: 0; display: flex; flex-direction: column; justify-content: flex-start;">
                    <h3 style="margin-top: 0; margin-bottom: 15px; color: #888; font-size: 26px;">Attributes</h3>
                    ${statHtml}
                </div>
                <div style="width: 190px; flex-shrink: 0; display: flex; flex-direction: column; justify-content: flex-start;">
                    <h3 style="margin-top: 0; margin-bottom: 15px; color: #888; font-size: 26px;">Talents</h3>
                    ${talentsHtml}
                </div>
                <div style="width: 190px; flex-shrink: 0; display: flex; flex-direction: column; justify-content: flex-start;">
                    <h3 style="margin-top: 0; margin-bottom: 15px; color: #888; font-size: 26px;">Power Variants</h3>
                    ${variantsHtml}
                </div>
                <div style="width: 190px; flex-shrink: 0; display: flex; flex-direction: column; justify-content: flex-start;">
                    <h3 style="margin-top: 0; margin-bottom: 15px; color: #888; font-size: 26px;">Devices</h3>
                    ${deviceHtml}
                </div>
            </div>

            <div style="margin-top: auto; padding-top: 20px; padding-bottom: 5px; align-self: flex-start; margin-left: -25px">
                ${shareHtml}
            </div>

        </div>
        
        <div style="flex: 1; display: flex; flex-direction: column; padding-left: 20px; min-height: 0;">
            <div style="display: flex; justify-content: flex-start; align-items: flex-end; margin-bottom: 8px; border-bottom: 1px solid #333; padding-bottom: 6px; flex-shrink: 0;">
                <h3 style="margin: 0; color: #888; font-size: 26px;">Specializations</h3>
            </div>
            
            <div style="flex: 1; display: flex; flex-direction: column;">
                <div style="background: rgba(0,0,0,0.3); border: 1px solid #444; border-radius: 6px; padding: 10px 15px; display: flex; flex-direction: column; flex-shrink: 0;">
                    <div style="display: flex; flex-direction: column; flex-shrink: 0;">
                        ${specHtml}
                    </div>
                </div>
            </div>
        </div>
        
    </div>`;
}

// --- MAIN RENDER ENGINE ---
function render() {
	let nav = document.getElementById('powerset-tabs');
	nav.innerHTML = '';
	powersets.forEach(pset => {
		let div = document.createElement('div');
		div.className = `powerset-tab ${currentSet === pset.id ? 'active' : ''}`;
		div.onclick = () => setPowerset(pset.id);
		div.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; gap: 6px;">${buildSpriteHTML(pset, 0.35)}<span style="font-size: 15px; font-weight: bold;">${pset.name}</span></div>`;
		nav.appendChild(div);
	});

	let slotsHtml = '';
	let nextEmpty = build.powers.indexOf(null);
	if(nextEmpty === -1) nextEmpty = 13;

	for (let i = 0; i < MAX_POWERS; i++) {
        let pId = build.powers[i];
        let isActive = (i === activeSlotIndex);
        let activeClass = isActive ? 'active-slot' : '';
        let isSelectable = (i <= nextEmpty) ? 'selectable' : 'locked-slot';

        let isInvalid = false;
        let invalidMsg = "";

        // Enable dragging for everything except Slot 0
        let dragAttrs = i > 0 ? `draggable="true" ondragstart="dragStart(event, ${i})" ondragover="dragOver(event, ${i})" ondragleave="dragLeave(event)" ondrop="dropSlot(event, ${i})"` : ``;

        if (pId) {
            let p = powers.find(x => x.id === pId);
            
            let ultCountBefore = 0;
            for(let j = 0; j < i; j++) {
                if(build.powers[j] && powers.find(x => x.id === build.powers[j])?.tier == 4) ultCountBefore++;
            }
            if (p.tier == 4 && ultCountBefore > 0) {
                isInvalid = true;
                invalidMsg = "Multiple Ultimates not allowed";
            } else if (!checkUnlockForSlot(p, i, build.powers)) {
                isInvalid = true;
                invalidMsg = "Tier prerequisites not met";
            }

            let activeAdvs = build.adv[pId] || [];
            let visibleAdvs = activeAdvs.filter(aName => {
                if (p.isEnergyUnlock && (aName === "Rank 2" || aName === "Rank 3")) return false;
                
                let aObj = p.adv ? p.adv.find(a => a.name === aName) : null;
                return aObj && !aObj.isHidden;
            });
            let advHtml = visibleAdvs.length > 0 ? `<div class="slot-advs" style="font-size: 13px; color: #bbb; margin-top: 4px;">${visibleAdvs.join(' &bull; ')}</div>` : '';

            let jumpBtnHtml = `<button class="jump-btn" style="position: absolute; left: -34px; top: 50%; transform: translateY(-50%); background: #ffeb3b; color: #000; border: 2px solid #222; border-radius: 50%; width: 34px; height: 34px; cursor: pointer; z-index: 10; font-size: 16px; font-weight: bold; display: none; align-items: center; justify-content: center; box-shadow: 0 3px 6px rgba(0,0,0,0.8);" onclick="jumpToPower('${pId}', event)" title="Locate in Library">&#9664;</button>`;
            let tooltipHtml = isInvalid ? `<div class="invalid-tooltip" style="position: absolute; right: 35px; top: -10px; background: #ff5555; color: #fff; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; pointer-events: none; z-index: 20;">! ${invalidMsg}</div>` : '';
            
            let powerDescTooltip = `<div class="power-spec-tooltip"><strong style="color:#4DA8DA; font-size:17px;">${p.name}</strong><br><br>${p.desc}</div>`;

            let slotStyle = `position: relative; box-sizing: border-box; width: 100%; margin: 0; background: transparent !important; border: 2px solid transparent !important; border-radius: 4px; padding: 2px 10px; display: flex; align-items: center; gap: 15px; flex: 1; min-height: 0;`;
            let finalSlotClass = `slot filled ${activeClass} ${isSelectable} ${isInvalid ? 'invalid-slot' : ''}`;

            slotsHtml += `
            <div class="${finalSlotClass}" style="${slotStyle}" ${dragAttrs} onclick="selectSlot(${i})" onmouseenter="this.querySelector('.jump-btn').style.display='flex'" onmouseleave="this.querySelector('.jump-btn').style.display='none'">
                ${tooltipHtml}
                ${powerDescTooltip}
                ${jumpBtnHtml}
                <div class="slot-icon" style="box-sizing: border-box; border: ${isActive ? (isInvalid ? '2px dashed #ff5555' : '2px dashed #4DA8DA') : '2px solid transparent'}; border-radius: 4px; padding: 2px;">${buildSpriteHTML(p, 1.2)}</div>
                <div class="slot-details" style="display: flex; flex-direction: column; justify-content: center; flex: 1; padding-right: 40px; box-sizing: border-box;">
                    <div class="slot-header" style="display: flex; justify-content: space-between; align-items: baseline; width: 100%;">
                        <span class="slot-name" style="font-size: 20px; text-shadow: 2px 2px 4px #000; font-weight: bold; letter-spacing: 0.5px; color: ${isInvalid ? '#ff5555' : 'inherit'};">${p.name}</span>
                        <span class="slot-tier" style="font-size: 13px; opacity: 0.7; color: ${isInvalid ? '#ff5555' : 'inherit'};">Tier ${p.tier}</span>
                    </div>
                    ${advHtml}
                </div>
                <button class="remove-btn" style="position: absolute; right: 5px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: #ff5555; font-size: 20px; font-weight: bold; cursor: pointer; opacity: 0.6;" onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0.6" onclick="removePowerFromSlot(${i}, event)">X</button>
            </div>`;
        } else {
            let label = i === 0 ? "Energy Builder" : "Select Power...";
            let slotStyle = `position: relative; box-sizing: border-box; width: 100%; margin: 0; background: transparent !important; border: 2px solid transparent !important; border-radius: 4px; padding: 2px 10px; display: flex; align-items: center; gap: 15px; flex: 1; min-height: 0;`;

            slotsHtml += `
            <div class="slot empty ${activeClass} ${isSelectable}" style="${slotStyle}" ${dragAttrs} onclick="selectSlot(${i})">
                <div class="slot-icon"><div style="box-sizing: border-box; width: 50px; height: 50px; border: ${isActive ? '2px dashed #4DA8DA' : '2px dashed rgba(255,255,255,0.2)'}; border-radius: 4px;"></div></div>
                <div class="slot-details" style="display: flex; flex-direction: column; justify-content: center; flex: 1;">
                    <div class="slot-header" style="display: flex; justify-content: space-between; align-items: baseline; width: 100%;">
                        <span class="slot-name" style="color: rgba(255,255,255,0.4); font-size: 20px; font-style: italic;">${label}</span>
                    </div>
                </div>
            </div>`;
        }
    }

	document.getElementById('selected-slots').innerHTML = slotsHtml;

	renderSpecsHUD();

	let library = document.getElementById('power-library');
	library.innerHTML = '';

	["EB", 0, 1, 2, 3, 4].forEach(tierLabel => {
		let seenNames = new Set();

		let tierPowers = powers.filter(p => {
			let isValid = (p.set === currentSet || (p.sharedWith && p.sharedWith.includes(currentSet))) && p.tier === tierLabel;
			if (isValid && !seenNames.has(p.name)) {
				seenNames.add(p.name);
				return true;
			}
			return false;
		});

		if (tierPowers.length === 0) return;

		let section = document.createElement('div');
		section.className = 'tier-section';
		section.innerHTML = `<h3>Tier ${tierLabel}</h3><div class="grid"></div>`;
		let grid = section.querySelector('.grid');

	   tierPowers.forEach(power => {
			let isSelected = build.powers.includes(power.id);
			let isExpanded = (expandedPowerId === power.id);

			let isLocked = false;

			// Hard Limit: Only One Ultimate Allowed
			if (!isSelected && power.tier == 4) {
				let hasUlt = build.powers.some(pid => pid && powers.find(x => x.id === pid)?.tier == 4);
				if (hasUlt) isLocked = true;
			}

			// Hard Limit: Only One Energy Unlock Allowed
			if (!isSelected && power.isEnergyUnlock) {
				let hasUnlock = build.powers.some(pid => pid && powers.find(x => x.id === pid)?.isEnergyUnlock);
				if (hasUnlock) isLocked = true;
			}

			// Can this power legally go into the currently active slot?
			if (!isSelected && !isLocked) {
				if (!checkUnlockForSlot(power, activeSlotIndex, build.powers)) {
					isLocked = true;
				}
			}

			let div = document.createElement('div');
			div.id = 'lib-power-' + power.id;
			div.className = `power ${isLocked ? 'locked' : ''} ${isSelected ? 'selected' : ''} ${isExpanded ? 'expanded' : ''}`;

			let header = document.createElement('div');
			header.className = 'power-header';
			header.innerHTML = `
				${buildSpriteHTML(power, 1.2)}
				<div>
					<div class="name" style="font-size: 18px;">${power.name}</div>
					<div class="tier-label" style="font-size: 12px;">Tier ${power.tier}</div>
				</div>
				<div class="tooltip">${power.desc}</div>
			`;
			div.appendChild(header);
			div.onclick = () => togglePower(power.id);

			if (isSelected && isExpanded) {
				let currentPoints = 0;
				let activeAdvs = build.adv[power.id] || [];
				activeAdvs.forEach(aName => {
					if (power.isEnergyUnlock && (aName === "Rank 2" || aName === "Rank 3")) return;

					let advObj = power.adv.find(a => a.name === aName);
					if(advObj && !advObj.isHidden) currentPoints += advObj.cost;
				});

				let advContainer = document.createElement('div');
				advContainer.className = 'adv-container';
				advContainer.innerHTML = `<div class="adv-points-label">Advantage Points: ${currentPoints}/5</div>`;

				power.adv.forEach(a => {
					if (a.isHidden) return;

					if (power.isEnergyUnlock && (a.name === "Rank 2" || a.name === "Rank 3")) return;

					let isActive = activeAdvs.includes(a.name);
					let isLockedAdv = (a.name === "Rank 3" && !activeAdvs.includes("Rank 2"));

					let btn = document.createElement('div');
					btn.className = `adv-btn ${isActive ? 'active' : ''} ${isLockedAdv ? 'locked' : ''}`;
					btn.innerText = `${a.name} (${a.cost})`;
					btn.onclick = (e) => {
						e.stopPropagation();
						if (!isLockedAdv) window.toggleAdvantage(power.id, a.name, a.cost);
					};
					advContainer.appendChild(btn);
				});
				div.appendChild(advContainer);
			}
			grid.appendChild(div);
		});
		library.appendChild(section);
	});
}

function showMessage(msg, type = "info") {
	let el = document.getElementById('system-message');
	el.innerText = msg;
	el.style.color = type === "error" ? "#ff5555" : (type === "success" ? "#4CAF50" : "#e0e0e0");
	setTimeout(() => { el.innerText = ''; }, 3000);
}

// --- NEW V3 BASE36 EXPORT ENGINE ---
function exportCode() {
	if (build.powers.every(p => p === null)) return showMessage("Your build is empty!", "error");

	let toB36 = (num) => (num === "" || num === null || num === undefined) ? "" : Number(num).toString(36);

	let setIdx = toB36(powersets.findIndex(p => p.id === build.set));

	let pParts = build.powers.map(pid => {
		if (pid === null) return "";
		let pIdx = powers.findIndex(p => p.id === pid);
		if (pIdx === -1) return "";
		let pObj = powers[pIdx];
		let advIndices = (build.adv[pid] || []).map(aName => pObj.adv.findIndex(a => a.name === aName)).filter(i => i !== -1);
		let pStr = toB36(pIdx);
		if (advIndices.length > 0) pStr += "_" + advIndices.map(toB36).join('_');
		return pStr;
	});
	let powerString = pParts.join('.');

	let getTreeIdx = (tid) => tid ? specializations.findIndex(t => t.id.toString() === tid.toString()) : "";
	let getMasteryIdx = (tid) => tid ? specializations.findIndex(t => t.mastery && t.mastery.id.toString() === tid.toString()) : "";

	let tParams = [getTreeIdx(build.specs.primary), getTreeIdx(build.specs.sec1), getTreeIdx(build.specs.sec2), getMasteryIdx(build.specs.mastery)].map(toB36);

	let allPerks = [];
	specializations.forEach(t => allPerks = allPerks.concat(t.perks));
	let pParams = Object.keys(build.specs.points).map(k => {
		let pIdx = allPerks.findIndex(p => p.id === k);
		return pIdx !== -1 ? `${toB36(pIdx)}_${toB36(build.specs.points[k])}` : null;
	}).filter(x => x !== null);
	let specString = tParams.join('.') + "~" + pParams.join('.');

	let getStatIdx = (s) => s ? STAT_TREES.indexOf(s) : "";
	let statString = [getStatIdx(build.stats.primary), getStatIdx(build.stats.sec1), getStatIdx(build.stats.sec2)].map(toB36).join('.');

	let dParams = build.devices.map(d => d !== null ? toB36(devices.findIndex(x => x.id === d)) : "").join('.');

	let cPolarity = build.cams && build.cams.polarity === 'Green' ? 1 : 0;
	let cLevel = build.cams ? build.cams.level : 0;
	let cParams = `${toB36(cPolarity)}.${toB36(cLevel)}`;

	let vParams = build.variants.map(v => v !== null ? toB36(powerVariants.findIndex(x => x.id === v)) : "").join('.');

	// --- ENCODE TALENTS ROW ---
    let talentParams = build.talents ? build.talents.map(t => t !== null ? toB36(CO_TALENTS.findIndex(x => x.id === t)) : "").join('.') : "......";

	// Appended talentParams as the 8th block parameter
    const finalCode = `${setIdx}-${powerString}-${specString}-${statString}-${dParams}-${cParams}-${vParams}-${talentParams}`;
    const currentUrl = window.location.origin + window.location.pathname; 
    const fullExportLink = `${currentUrl}?b=${finalCode}`;
    
    const exportInput = document.getElementById('export-link');
    exportInput.value = fullExportLink;
    
    navigator.clipboard.writeText(fullExportLink).then(() => showMessage("Build link copied to clipboard!", "success")).catch(() => {
        exportInput.select(); document.execCommand('copy'); showMessage("Link generated! Please copy manually.", "success");
    });
}

// --- IMPORT SORTING ENGINE (GREEDY METHOD) ---
function greedySortPowers(powerIds) {
	let sorted = new Array(14).fill(null);
	let pool = powerIds.filter(id => id !== null);

	// 1. Force the Energy Builder to slot 0 if one exists
	let ebIndex = pool.findIndex(id => powers.find(x => x.id === id)?.tier === "EB");
	if (ebIndex !== -1) {
		sorted[0] = pool[ebIndex];
		pool.splice(ebIndex, 1);
	}

	// 2. Begin slotting general powers at slot 1
	let nextSlot = 1;
	let changed = true;

	// Loop until we can no longer find a legally permitted placement
	while (changed && pool.length > 0) {
		changed = false;
		for (let i = 0; i < pool.length; i++) {
			let p = powers.find(x => x.id === pool[i]);
			if (p && checkUnlockForSlot(p, nextSlot, sorted)) {
				sorted[nextSlot] = pool[i];
				pool.splice(i, 1);
				nextSlot++;
				changed = true;
				break;
			}
		}
	}

	// 3. Dump whatever rules-breaking powers are left over into the remaining slots
	while (pool.length > 0 && nextSlot < 14) {
		if (nextSlot === 0) nextSlot = 1;
		sorted[nextSlot] = pool.shift();
		nextSlot++;
	}

	return sorted;
}

// --- HYBRID UNIVERSAL IMPORT ENGINE ---
function importCode(providedCode = null) {
	let inputStr = providedCode;

	if (!inputStr) {
		let importElement = document.getElementById('import-code');
		if (!importElement) return;
		inputStr = importElement.value.trim();
		importElement.value = '';
	}

	if (!inputStr) return;

	if (inputStr.includes('?b=')) {
		inputStr = inputStr.split('?b=')[1].split('&')[0];
	} else if (inputStr.includes('?build=')) {
		inputStr = inputStr.split('?build=')[1].split('&')[0];
	}

	if (inputStr.includes("http") && (inputStr.includes("v=") || inputStr.includes("d="))) {
		let plainTextData = null;

		// --- THE SIMPLE ROUTER (Restored for Balak links!) ---
		if (inputStr.toLowerCase().includes("balak")) {
			if (typeof window.BalakTranslator === 'undefined') return typeof showMessage === "function" ? showMessage("Balak Translator module missing!", "error") : alert("Translator missing!");
			plainTextData = window.BalakTranslator.decode(inputStr);
		} else {
			if (typeof window.AesicaTranslator === 'undefined') return typeof showMessage === "function" ? showMessage("Aesica Translator module missing!", "error") : alert("Translator missing!");
			plainTextData = window.AesicaTranslator.decode(inputStr);
		}
		// ----------------------------------------------------

		if (!plainTextData) {
			return typeof showMessage === "function" ? showMessage("Failed to decode link.", "error") : alert("Failed to decode.");
		}

		let newBuild = {
			set: null,
			stats: { primary: plainTextData.stats.primary, sec1: plainTextData.stats.sec1, sec2: plainTextData.stats.sec2 },
			powers: new Array(14).fill(null),
			adv: {},
			specs: { primary: null, sec1: null, sec2: null, mastery: null, points: {} },
			devices: new Array(5).fill(null),
			variants: new Array(5).fill(null),
			talents: plainTextData.talents || new Array(7).fill(null),
			cams: { polarity: 'Blue', level: 0 }
		};

		for (let p = 0; p < plainTextData.powers.length && p < 14; p++) {
			let pData = plainTextData.powers[p];
			let ourPower = powers.find(x => x.name.trim().toLowerCase() === pData.name.trim().toLowerCase());

			if (ourPower) {
				newBuild.powers[p] = ourPower.id;
				if (p === 0 || !newBuild.set) newBuild.set = ourPower.set;
				newBuild.adv[ourPower.id] = [];

				pData.advantages.forEach(advName => {
					let ourAdv = ourPower.adv.find(a => a.name.trim().toLowerCase() === advName.trim().toLowerCase());
					if (ourAdv && !newBuild.adv[ourPower.id].includes(ourAdv.name)) {
						newBuild.adv[ourPower.id].push(ourAdv.name);
					}
				});
			}
		}

		let mapTree = (treeName, slotKey) => {
			if (!treeName) return;
			let ourTree = specializations.find(t => t.name.trim().toLowerCase() === treeName.trim().toLowerCase());
			if (ourTree) newBuild.specs[slotKey] = ourTree.id;
		};

		mapTree(plainTextData.specs.primary, 'primary');
		mapTree(plainTextData.specs.sec1, 'sec1');
		mapTree(plainTextData.specs.sec2, 'sec2');

		if (plainTextData.specs.mastery) {
			let masterTree = specializations.find(t => t.mastery && t.mastery.name.trim().toLowerCase() === plainTextData.specs.mastery.trim().toLowerCase());
			if (masterTree) newBuild.specs.mastery = masterTree.mastery.id;
		}

		plainTextData.specs.perks.forEach(perkInfo => {
			let ourTree = specializations.find(t => t.name.trim().toLowerCase() === perkInfo.treeName.trim().toLowerCase());
			if (ourTree) {
				let ourPerk = ourTree.perks.find(p => p.name.trim().toLowerCase() === perkInfo.perkName.trim().toLowerCase());
				if (ourPerk) {
					newBuild.specs.points[ourPerk.id] = perkInfo.points;
				}
			}
		});

		if (plainTextData.devices) {
			for(let i=0; i<5; i++) {
				if (plainTextData.devices[i]) {
					let searchName = plainTextData.devices[i].toLowerCase().replace(/[^a-z0-9]/g, '');
					let matchedLocalDevice = devices.find(localDev =>
						localDev.name && localDev.name.toLowerCase().replace(/[^a-z0-9]/g, '') === searchName
					);
					if (matchedLocalDevice) newBuild.devices[i] = parseInt(matchedLocalDevice.id);
				}
			}
		}

		if (newBuild.powers.some(p => p !== null)) {
			newBuild.powers = greedySortPowers(newBuild.powers);
			build = newBuild;
			if (powersets.find(pset => pset.id === build.set)) currentSet = build.set;
			expandedPowerId = null;
			let nextEmpty = build.powers.indexOf(null);
			activeSlotIndex = nextEmpty !== -1 ? nextEmpty : 13;
			if(typeof render === "function") render();
			if(typeof showMessage === "function") showMessage("External build translated & sorted!", "success");
		} else {
			if(typeof showMessage === "function") showMessage("Could not map any powers to your database.", "error");
		}
		return;

	} else if (inputStr.includes('-') && !inputStr.includes('http')) {
		// --- NEW V3 BASE36 FORMAT ---
		let blocks = inputStr.split('-');
		let fromB36 = (str) => (str === "" || str === undefined) ? null : parseInt(str, 36);

		let setIdx = fromB36(blocks[0]);
		let loadedSet = (setIdx !== null && powersets[setIdx]) ? powersets[setIdx].id : null;
		if(!loadedSet) return showMessage("Invalid build code.", "error");

		let newBuild = {
			set: loadedSet, stats: { primary: null, sec1: null, sec2: null },
			powers: new Array(14).fill(null), adv: {},
			specs: { primary: null, sec1: null, sec2: null, mastery: null, points: {} },
			devices: new Array(5).fill(null), variants: new Array(5).fill(null),
			talents: new Array(7).fill(null),
			cams: { polarity: 'Blue', level: 0 }
		};

		if (blocks[1]) {
			let pwrSections = blocks[1].split('.');
			for(let i = 0; i < 14 && i < pwrSections.length; i++) {
				if(pwrSections[i] === "") continue;
				let parts = pwrSections[i].split('_');
				let pIdx = fromB36(parts[0]);
				if (pIdx !== null && powers[pIdx]) {
					let pId = powers[pIdx].id;
					newBuild.powers[i] = pId;
					newBuild.adv[pId] = [];
					for(let j = 1; j < parts.length; j++) {
						let aIdx = fromB36(parts[j]);
						if (aIdx !== null && powers[pIdx].adv && powers[pIdx].adv[aIdx]) {
							newBuild.adv[pId].push(powers[pIdx].adv[aIdx].name);
						}
					}
				}
			}
		}

		if (blocks[2]) {
			let specHalves = blocks[2].split('~');
			if (specHalves[0]) {
				let tData = specHalves[0].split('.');
				let getTree = (idx) => (idx !== null && specializations[idx]) ? specializations[idx].id : null;
				newBuild.specs.primary = getTree(fromB36(tData[0]));
				newBuild.specs.sec1 = getTree(fromB36(tData[1]));
				newBuild.specs.sec2 = getTree(fromB36(tData[2]));

				let masterIdx = fromB36(tData[3]);
				if (masterIdx !== null && specializations[masterIdx] && specializations[masterIdx].mastery) {
					newBuild.specs.mastery = specializations[masterIdx].mastery.id;
				}
			}
			if (specHalves[1]) {
				let allPerks = []; specializations.forEach(t => allPerks = allPerks.concat(t.perks));
				let pData = specHalves[1].split('.');
				pData.forEach(pChunk => {
					if(!pChunk) return;
					let [pIdxStr, ptsStr] = pChunk.split('_');
					let pIdx = fromB36(pIdxStr);
					let pts = fromB36(ptsStr);
					if (pIdx !== null && pts !== null && allPerks[pIdx]) {
						newBuild.specs.points[allPerks[pIdx].id] = pts;
					}
				});
			}
		}

		if (blocks[3]) {
			let sData = blocks[3].split('.');
			let getStat = (idx) => (idx !== null && STAT_TREES[idx]) ? STAT_TREES[idx] : null;
			newBuild.stats.primary = getStat(fromB36(sData[0]));
			newBuild.stats.sec1 = getStat(fromB36(sData[1]));
			newBuild.stats.sec2 = getStat(fromB36(sData[2]));
		}

		if (blocks[4]) {
			let dData = blocks[4].split('.');
			for(let i=0; i<5 && i<dData.length; i++) {
				let dIdx = fromB36(dData[i]);
				if(dIdx !== null && devices[dIdx]) newBuild.devices[i] = devices[dIdx].id;
			}
		}

		if (blocks[5]) {
			let cData = blocks[5].split('.');
			let cPol = fromB36(cData[0]);
			let cLev = fromB36(cData[1]);
			if (cPol !== null && cLev !== null) {
				newBuild.cams = { polarity: cPol === 1 ? 'Green' : 'Blue', level: cLev };
			}
		}

		if (blocks[6]) {
			let vData = blocks[6].split('.');
			for(let i=0; i<5 && i<vData.length; i++) {
				let vIdx = fromB36(vData[i]);
				if(vIdx !== null && powerVariants[vIdx]) newBuild.variants[i] = powerVariants[vIdx].id;
			}
		}
		
		// --- DECODE TALENTS ROW ---
        if (blocks[7]) {
            let talentData = blocks[7].split('.');
            for(let i = 0; i < 7 && i < talentData.length; i++) {
                let tIdx = fromB36(talentData[i]);
                if(tIdx !== null && CO_TALENTS[tIdx]) {
                    newBuild.talents[i] = CO_TALENTS[tIdx].id;
                }
            }
        }

		if (newBuild.powers.some(p => p !== null)) {
			newBuild.powers = greedySortPowers(newBuild.powers);
			build = newBuild;
			if (powersets.find(pset => pset.id === loadedSet)) currentSet = loadedSet;
			expandedPowerId = null;
			let nextEmpty = build.powers.indexOf(null);
			activeSlotIndex = nextEmpty !== -1 ? nextEmpty : 13;
			if(typeof render === "function") render();
			if(typeof showMessage === "function") showMessage("Build loaded successfully!", "success");
		} else {
			if(typeof showMessage === "function") showMessage("Invalid build code.", "error");
		}
	} else {
		// --- V2/V1 BASE64 LEGACY FORMATS ---
		try {
			let raw = atob(inputStr);
			let blocks = raw.includes('*') ? raw.split('*') : [raw.split('|').shift(), raw.split('|').slice(1).join('|'), "|||#", "||", "", "", ""];
			let isLiteFormat = !isNaN(parseInt(blocks[0])) && !isNaN(blocks[0] - 0);

			if (isLiteFormat) {
				let setIdx = parseInt(blocks[0]);
				let loadedSet = powersets[setIdx] ? powersets[setIdx].id : null;
				if(!loadedSet) return showMessage("Invalid build code.", "error");

				let newBuild = {
					set: loadedSet, stats: { primary: null, sec1: null, sec2: null },
					powers: new Array(14).fill(null), adv: {},
					specs: { primary: null, sec1: null, sec2: null, mastery: null, points: {} },
					devices: new Array(5).fill(null), variants: new Array(5).fill(null),
					talents: new Array(7).fill(null),
					cams: { polarity: 'Blue', level: 0 }
				};

				if (blocks[1]) {
					let pwrSections = blocks[1].split('|');
					for(let i = 0; i < 14 && i < pwrSections.length; i++) {
						if(pwrSections[i] === "") continue;
						let [pIdxStr, advString] = pwrSections[i].split(':');
						let pIdx = parseInt(pIdxStr);
						if (!isNaN(pIdx) && powers[pIdx]) {
							let pId = powers[pIdx].id;
							newBuild.powers[i] = pId;
							newBuild.adv[pId] = [];
							if (advString) {
								advString.split(',').forEach(aIdxStr => {
									let aIdx = parseInt(aIdxStr);
									if (!isNaN(aIdx) && powers[pIdx].adv && powers[pIdx].adv[aIdx]) {
										newBuild.adv[pId].push(powers[pIdx].adv[aIdx].name);
									}
								});
							}
						}
					}
				}

				if (blocks[2]) {
					let specHalves = blocks[2].split('#');
					if(specHalves[0]) {
						let tData = specHalves[0].split('|');
						let getTree = (idx) => (idx !== "" && specializations[parseInt(idx)]) ? specializations[parseInt(idx)].id : null;
						newBuild.specs.primary = getTree(tData[0]);
						newBuild.specs.sec1 = getTree(tData[1]);
						newBuild.specs.sec2 = getTree(tData[2]);

						let masterTreeIdx = tData[3];
						if(masterTreeIdx !== "" && specializations[parseInt(masterTreeIdx)] && specializations[parseInt(masterTreeIdx)].mastery) {
							newBuild.specs.mastery = specializations[parseInt(masterTreeIdx)].mastery.id;
						}
					}
					if(specHalves[1]) {
						let allPerks = []; specializations.forEach(t => allPerks = allPerks.concat(t.perks));
						let pData = specHalves[1].split('|');
						pData.forEach(pChunk => {
							let [pIdxStr, pts] = pChunk.split(':');
							if(pIdxStr && pts) {
								let pIdx = parseInt(pIdxStr);
								if(allPerks[pIdx]) newBuild.specs.points[allPerks[pIdx].id] = Number(pts);
							}
						});
					}
				}

				if (blocks[3]) {
					let sData = blocks[3].split('|');
					let getStat = (idx) => (idx !== "" && STAT_TREES[parseInt(idx)]) ? STAT_TREES[parseInt(idx)] : null;
					newBuild.stats.primary = getStat(sData[0]);
					newBuild.stats.sec1 = getStat(sData[1]);
					newBuild.stats.sec2 = getStat(sData[2]);
				}

				if (blocks[4]) {
					let dData = blocks[4].split(',');
					for(let i=0; i<5 && i<dData.length; i++) {
						if(dData[i] !== "") {
							let dIdx = parseInt(dData[i]);
							if(!isNaN(dIdx) && devices[dIdx]) newBuild.devices[i] = devices[dIdx].id;
						}
					}
				}

				if (blocks[5]) {
					let cData = blocks[5].split(',');
					if(cData[0] !== "" && cData[1] !== undefined) {
						newBuild.cams = { polarity: cData[0] == "1" ? 'Green' : 'Blue', level: parseInt(cData[1]) };
					}
				}

				if (blocks[6]) {
					let vData = blocks[6].split(',');
					for(let i=0; i<5 && i<vData.length; i++) {
						if(vData[i] !== "") {
							let vIdx = parseInt(vData[i]);
							if(!isNaN(vIdx) && powerVariants[vIdx]) newBuild.variants[i] = powerVariants[vIdx].id;
						}
					}
				}

				if (newBuild.powers.some(p => p !== null)) {
					newBuild.powers = greedySortPowers(newBuild.powers);
					build = newBuild;
					if (powersets.find(pset => pset.id === loadedSet)) currentSet = loadedSet;
					expandedPowerId = null;
					let nextEmpty = build.powers.indexOf(null);
					activeSlotIndex = nextEmpty !== -1 ? nextEmpty : 13;
					if(typeof render === "function") render();
					if(typeof showMessage === "function") showMessage("Build loaded successfully!", "success");
				} else {
					if(typeof showMessage === "function") showMessage("Invalid build code.", "error");
				}

			} else {
				const loadedSet = blocks[0];
				let newBuild = {
					set: loadedSet, stats: { primary: null, sec1: null, sec2: null },
					powers: new Array(14).fill(null), adv: {},
					specs: { primary: null, sec1: null, sec2: null, mastery: null, points: {} },
					devices: new Array(5).fill(null), variants: new Array(5).fill(null),
					talents: new Array(7).fill(null),
					cams: { polarity: 'Blue', level: 0 }
				};

				let index = 0;
				let pwrSections = blocks[1] ? blocks[1].split('|') : [];
				pwrSections.forEach(sec => {
					let [pid, advString] = sec.split(':');
					if (powers.find(p => p.id === pid)) {
						newBuild.powers[index] = pid;
						newBuild.adv[pid] = advString ? advString.split(',') : [];
						index++;
					}
				});

				if(blocks[2]) {
					let specHalves = blocks[2].split('#');
					let tData = specHalves[0].split('|');
					if(tData[0]) newBuild.specs.primary = tData[0];
					if(tData[1]) newBuild.specs.sec1 = tData[1];
					if(tData[2]) newBuild.specs.sec2 = tData[2];
					if(tData[3]) newBuild.specs.mastery = tData[3];

					if(specHalves[1]) {
						let pData = specHalves[1].split('|');
						pData.forEach(pChunk => {
							let [pid, pts] = pChunk.split(':');
							if(pid && pts) newBuild.specs.points[pid] = Number(pts);
						});
					}
				}

				if(blocks[3]) {
					let sData = blocks[3].split('|');
					if(sData[0]) newBuild.stats.primary = sData[0];
					if(sData[1]) newBuild.stats.sec1 = sData[1];
					if(sData[2]) newBuild.stats.sec2 = sData[2];
				}

				if(blocks[4]) {
					let dData = blocks[4].split(',');
					for(let i=0; i<5 && i<dData.length; i++) {
						if(dData[i] && dData[i] !== "") newBuild.devices[i] = parseInt(dData[i]);
					}
				}

				if(blocks[5]) {
					let cData = blocks[5].split(',');
					if(cData[0] && cData[1] !== undefined) {
						newBuild.cams = { polarity: cData[0], level: parseInt(cData[1]) };
					}
				}

				if(blocks[6]) {
					let vData = blocks[6].split(',');
					for(let i=0; i<5 && i<vData.length; i++) {
						if(vData[i] && vData[i] !== "") newBuild.variants[i] = vData[i];
					}
				}

				if (newBuild.powers.some(p => p !== null)) {
					newBuild.powers = greedySortPowers(newBuild.powers);
					build = newBuild;
					if (powersets.find(pset => pset.id === loadedSet)) currentSet = loadedSet;
					expandedPowerId = null;
					let nextEmpty = build.powers.indexOf(null);
					activeSlotIndex = nextEmpty !== -1 ? nextEmpty : 13;
					if(typeof render === "function") render();
					if(typeof showMessage === "function") showMessage("Legacy build loaded & sorted!", "success");
				} else {
					if(typeof showMessage === "function") showMessage("Invalid build code.", "error");
				}
			}
		} catch (e) {
			if(typeof showMessage === "function") showMessage("Failed to read code.", "error");
		}
	}
}

// --- AUTO-LOAD BUILD FROM URL ---
window.addEventListener('DOMContentLoaded', () => {
	const urlParams = new URLSearchParams(window.location.search);
	const incomingBuildCode = urlParams.get('b') || urlParams.get('build');

	if (incomingBuildCode) {
		setTimeout(() => {
			importCode(incomingBuildCode);
			window.history.replaceState({}, document.title, window.location.pathname);
		}, 100);
	}
});

// INITIALIZE APP
setTimeout(() => {
	// Inject Energy Unlock Flag dynamically during initialization based on HCData
	if (typeof HCData !== 'undefined') {
		powers.forEach(p => {
			let match = HCData.power.find(hp => hp && hp.name && hp.name.toLowerCase() === p.name.toLowerCase());
			if (match && match.range === "Energy Unlock") {
				p.isEnergyUnlock = true;
			}
		});
	}
	render();
}, 200);