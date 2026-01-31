// Data and State Management
    const state = {
        trapActivated: false,
        trapEnabled: true,
        boostActive: false,
        boostSecondsRemaining: 0,
        boostInterval: null,
        currentFilter: 'all',
        searchTerm: '',
        lastStatPerMinute: 0,
        specialsCategory: 'bloodlines',
        questsCategory: 'minato'
    };

    // DOM Elements
    const d = document;
    const s = id => d.getElementById(id);
    const _N = s('clickSound');
    const _B = s('bgMusic');
    const _T = s('trapSound');
    const _I = s('muteIcon');

        // Calculator Data
        const ticksPerStat = { 
            Strength: { AFK: 42, Clicking: 52 }, 
            Durability: { AFK: 32, Clicking: 32 }, 
            Chakra: { AFK: 22, Clicking: 25 }, 
            Sword: { AFK: 42, Clicking: 48 } 
        };

        // Power Data
        const powerData = { 
            Strength: [
                {name: "RAPID PUNCH", val: "Launch a series of continuous punches | 1x/tick (Uncountable) | 20s CD"},
                {name: "SERIOUS PUNCH", val: "Throw an incredibly powerful punch that deals a large amount of damage. | 10x | 25s CD"},
                {name: "TORNADO SMASH", val: "Smash the ground with immense strength, dealing damage to a large area. | 10 | 20s CD"},
                {name: "VIBRATION WAVE", val: "Create an intense vibration that damages anyone in the way. | 13x | 20s CD"}
            ],
            Durability: [
                {name: "KINGS AURA", val: "Cover's player's entire body in a mysterious power which reduces 10% of player damage taken by attacks. | N/A | 10s CD"},
                {name: "SUPER HUMAN", val: "Transform into Super Human mode reducing 15% of all player damage taken. | N/A | 10s CD"},
                {name: "ARMORED COLOSSUS", val: "Transform into an Armored Titan reducing 30% of all player damage taken and 4x punch damage for 30 seconds. | N/A | 60s CD"},
                {name: "STAGE FOUR", val: "Transform into Stage Four which reduces 35% of all player damage taken. By punching, you can activate the forms melee ability.| N/A | 10s CD"},
                {name: "NINE TAILED MODE", val: "Transform into Six Path Sage Mode and endure 40% damage received of all players MOST REQUIRED FOR PVP & PVE. | N/A | 10s CD"}
            ],
            Chakra: [
                {name: "SPIRAL SPHERE", val: "Create a deadly ball of wind that blasts enemies backwards Not required equipping. | 8x | 10s CD"},
                {name: "FIRE FIST", val: "A projectile that tracks down the closest player Required for PVP and PVE. | 10x | 15s CD"},
                {name: "ENERGY BEAM", val: "Generate a deadly beam of energy that deals continuous damage Not required for PVP. Good for PVE| 6x/tick | 20s CD"},
                {name: "SKELETON", val: "Form a large skeleton around your character, reducing 20% of all player damage taken. By punching, you can activate the skeleton's melee ability | N/A | 10s CD"},
                {name: "ICE BLAST", val: "Blast ice in front of you freezing players and dealing damage. Required for PVP due to Stun | 8x scaling | 20s CD"},
                {name: "SPIRIT EXPLOSION", val: "Form a huge energy ball and casting is to long. Not required for PVP | 15x scaling | 9s CD"},
                {name: "SPIRAL SHURIKEN", val: "Form a shuriken deals massive dmg and huge AoE. required for PVP & PVE | 25x scaling | 6-7s CD"},
                {name: "MULTIPLE BOMB SPIRAL SHURIKEN", val: "Form a multiple shuriken deals massive dmg and huge AoE. required for PVP & PVE | 20x scaling | 8s CD"},
                {name: "TAIL MONSTER BOMB", val: "Form a massive bomb deals massive dmg and huge AoE. required for PVP & PVE | 50x scaling | 3-5s CD"}
            ],
            Sword: [
                {name: "FLYING SLASH", val: "Create a powerful slash of wind that flies towards enemies | 10x scaling | 10s CD"},
                {name: "RAPID SLASH", val: "Multiple slashes that deal continuous damage all players within range. | 8x/tick | 20s CD"},
                {name: "DRAGON'S WRATH", val: "A powerful charge attack that can cut through multiple enemies| 15x scaling | 25s CD"}
            ], 
            Speed: [
                {name: "WATER RUNNING", val: "Allows players to walk and run on water. | N/A | N/A"}
            ], 
            Agility: [
                {name: "FLIGHT", val: "Allows players to fly. | N/A | N/A"},
                {name: "FLAME FLIGHT", val: "Generates fire under player's hands that allows faster flight. | N/A"},
                {name: "BLINK", val: "Teleport in any direction within an area. Good for PVE and PVE| N/A | 5s CD"}
            ] 
        };

        // Champions Data
        const championsData = [
            { name: "SANJI", chance: "13.46%", cost: "1000 SHARDS", board: 1, desc: "Auto trains 40% of your Agility multiplier every 4 seconds and buffs Punch damage by 40%" },
            { name: "LEVI", chance: "12.39%", cost: "1250 SHARDS", board: 1, desc: "Auto trains 30% of your sword multiplier every 4 seconds" },
            { name: "KILLUA", chance: "11.75%", cost: "1250 SHARDS", board: 1, desc: "Auto trains 45% of your Speed multiplier every 4 seconds and nerf Strength damage by 10%" },
            { name: "SAKURA", chance: "9.61%", cost: "1500 SHARDS", board: 1, desc: "Auto trains 20% of your Chakra every 4 seconds and heals 3% of your health every 5 seconds" },
            { name: "PICOLLO", chance: "8.54%", cost: "2000 SHARDS", board: 1, desc: "Auto traind 20% of your Durability and Strength multiplier every 4 seconds." },
            { name: "TOJI", chance: "6.41%", cost: "2000 SHARDS", board: 1, desc: "Auto trains 34% of your Strength and Durability multiplier every 4 seconds" },
            { name: "KANEKI", chance: "5.12%", cost: "2250 SHARDS", board: 1, desc: "Auto trains 30% of your Strength multiplier every 4 seconds. Specially buffs Kagune damage by 15% and nerfs incoming Kagune damage by 20%" },
            { name: "LUFFY", chance: "4.7%", cost: "3000 SHARDS", board: 1, desc: "Auto trains 40% of your Agility and 35% Strength multiplier every 4 seconds. Specially buffs Fruit damage by 25% and nerfs incomming Fruit damage by 20%" },
            { name: "ASTA", chance: "4.48%", cost: "7500 SHARDS", board: 1, desc: "Auto trains 45% of your sword multiplier every 4 seconds. Specially buffs Grimoire damage by 25% nerfs incomming Grimoire damage by 20%. Also nerfs and buffs Sword Slash damage by 20%" },		
            { name: "JINWOO", chance: "4.06%", cost: "7500 SHARDS", board: 1, desc: "Auto trains 40% of your strength multiplier every 4 seconds. Specially buffs Quark damage by 25% nerfs incomming Quark damage by 20%" },
            { name: "JOTARO", chance: "3.84%", cost: "7500 SHARDS", board: 1, desc: "Auto trains 45% of your Durability multiplier every $ seconds. Specially buffs stand damage by 20% and nerfs incomming stand damage by 25%" },
            { name: "JIRAIYA", chance: "3.41%", cost: "7500 SHARDS", board: 1, desc: "Auto trains 50% of your Chakra multiplier every 4 seconds. Nerfs chakra damage by 25%" },
            { name: "NARUTO", chance: "3.2%", cost: "7500 SHARDS", board: 1, desc: "Auto trains 55% of your Chakra multiplier every 4 seconds. Nerfs all Chakra damage by 30% and buffs Chakra damage by 20%" },
            { name: "VEGETA", chance: "2.76%", cost: "7500 SHARDS", board: 1, desc: "Auto trains 50% of your Strength multiplier every 4 seconds. Nerfs all Strength damage by 30% and all damage is buffed by 1.6x when health is below 30%" },
            { name: "GENOS", chance: "0.681%", cost: "7500 SHARDS", board: 1, desc: "When the player reaches 20% if his health, all damages are reduced to 30% of their original value. Auto trains 95% of your chakra. Nerfs all player damage by 30% and buffs all damage by 15%" },
            { name: "BOROS", chance: "0.68%", cost: "7500 SHARDS", board: 1, desc: "Auto trains 305 of your Chakra, 50% strength and Durability multiplier ever 4 seconds. Nerfs all damage by 30% and buffs all damage by 20%" },
            { name: "ICHIGO", chance: "0.56%", cost: "7500 SHARDS", board: 1, desc: "Auto trains 30% if your strength, 75% of Sword and 50% of Durability multiplier every 4 seconds. Nerfs all player damage by 10% and buffs all damage by 40%" },
            { name: "RENGOKU", chance: "0.42%", cost: "7500 SHARDS", board: 1, desc: "Auto trains 305 of your chakra, 70% of your Sword multiplier every 4 seconds. Nerfs all Chakra damage by 40% and buffs Chakra damage by 30%" },
            { name: "SASUKE", chance: "0.31%", cost: "7500 SHARDS", board: 1, desc: "Every player kill multiplies damage by 80% for 20 seconds. Trains 80% of Chakra, nerds all damage by 25% and buffs all damage by 50%" },
            { name: "ITACHI", chance: "0.19%", cost: "7500 SHARDS", board: 1, desc: "When the player reaches 105 of his health, he will become immune to all attacks for 8 seconds. Train 80% of Chakra, 20% of Strength and 20% of Durability. He also nerfs all damage by 25% and buffs all damage by 50%" },
            { name: "GOJO", chance: "0.0031%", cost: "7500 SHARDS", board: 1, desc: "Auto trains 125% Durability. Nerfs all player damge by 50% buffs all damge by 25% and increases your Chikara Per Min by x1.5" },
            { name: "LIGHT YAGAMI", chance: "0.003%", cost: "7500 SHARDS", board: 1, desc: "Auto trains 100% of your Chakra. Nerfs all player damge by 50% buffs all damge by 50% and increases your Chikara Per Min by x1.5" },
            { name: "SAITAMA SERIOUS", chance: "0.005%", cost: "7500 SHARDS", board: 1, desc: "Auto trains 150% of your Strength, 150% of your Durability. Nerfs all player damge by 50% buffs all damge by 100% increase your Chikara Per Min by x1.5, increases your Yen per Min by x1.25" },
            { name: "GIOVANNA", chance: "40.37%", cost: "500 SHARDS", board: 2, desc: "Trains 60% Strength & 50% Durability every 4s. Buffs all Stand damage by 20%." },
            { name: "BUU", chance: "29.84%", cost: "500 SHARDS", board: 2, desc: "Trains 70% Strength and 70% Chakra. Buffs all damage by 20%. Nerfs all damage by 10%" },
            { name: "GON", chance: "20.11%", cost: "500 SHARDS", board: 2, desc: "Train 50% Strength 50% Durability and 50% Chakra. He nerfs all incoming damage by 35%." },
            { name: "SHINRA", chance: "4.17%", cost: "1250 SHARDS", board: 2, desc: "Shinra trains 70% of Speed 45% if Durability and 55% of Chakra finally he also doubles all chakra damage" },
            { name: "KRILLIN", chance: "3.12%", cost: "1500 SHARDS", board: 2, desc: "Trains 95% Strength and 85% Durability. Buffs all damage by 30%. Nerfs all Quarks by an additional 50%" },
            { name: "ESCANOR", chance: "1.83%", cost: "2250 SHARDS", board: 2, desc: "Trains 60% Sword 50% Durability and 45% Strength he doubles all your damage and nerf all incomimg damage by 50% when it's day time" },
            { name: "MELIODAS", chance: "0.44%", cost: "3200 SHARDS", board: 2, desc: "A strength oriented Champion by training 90% of Strenght and 80% of Durability Overall he nerfs all damage by 50% and buffs al outgoing damage by 35%" },
            { name: "GOKU", chance: "0.43%", cost: "7500 SHARDS", board: 2, desc: "After every player kill your damage doubles for 10 seconds. Auto trains 95% if your Chakra. Nerfs all player damage by 50% and buffs all damage by 25%." },
            { name: "SAITAMA", chance: "0.12%", cost: "7500 SHARDS", board: 2, desc: "Auto trains 110% of your Strength 110% of your Durability. Nerfs all damage by 50% buffs all Damage by 50% increases your Yen Per Min by x1.1" },
            { name: "CHOPPER", chance: "CHOPPER QUEST", cost: "EVENT ONLY", board: 3, desc: "Auto trains 100% of your Durability 100% of your Sword. Nerfs all damage by 30%. buffs all Damage by 30% and increase your Chikara Per Min by x1.05" },
            { name: "ACE", chance: "CHOPPER QUEST", cost: "EVENT ONLY", board: 3, desc: "Auto trains 100% of your strength 100% of your Chakra. Nerfs all damage by 30% buffs all Damage by 30% increases your Yen Per Min by x1.05 and prevents you from being stunned" },
            { name: "KIRITO", chance: "KIRITO QUEST", cost: "EVENT ONLY", board: 3, desc: "Auto train 125% sword. Nerfs all player damage by 50% buffs all Damage by 25% increases your Yen Per Min by x1.05" },
            { name: "PAIN", chance: "0.005%", cost: "EVENT ONLY", board: 3, desc: "Auto trains 150% of your Strength 140% of your Durabiltity and 40% Sword. Nerfs all player damage y 50% buffs all Damage by 25% and increases your Chikara per min by x1.75" },
            { name: "RIMURU", chance: "0.005%", cost: "EVENT ONLY", board: 3, desc: "Auto trains 200% of your Chakra. Nerfs all player damage by 50% buffs all damage by 50% and increases your Chikara Per Min by x2" },
            { name: "SHANKS", chance: "BATTLE PASS TIER 45", cost: "EVENT ONLY", board: 3, desc: "Auto trains 125% of your Durability, Nerfs all Damage by 35%, increases your Yen Per Min by x1.1" },
            { name: "SIX PATH SAGE MODE NARUTO", chance: "BATTLE PASS TIER 45", cost: "EVENT ONLY", board: 3, desc: "Auto trains 175% of your Durability, Nerfs all player damage by 25%, buffs all Bloodline damage by 55%, increases your Yen Per Min by x1.15" },
            { name: "KAKASHI", chance: "BATTLE PASS TIER 25", cost: "EVENT ONLY", board: 3, desc: "Auto trains 160% of your Strength, Nerfs all player damage by 20%, buffs all Damage by 25%, increases your Yen Per Min by x1.1" },
            { name: "ROCK LEE", chance: "BATTLE PASS TIER 1", cost: "EVENT ONLY", board: 3, desc: "Auto trains 110% of your Strength, 120% of your Durability, 125% of your Agility, Nerfs all player damage by 25%, buffs all damage by 25%, increases your Yen Per Min by x1.05" },
            { name: "MINATO", chance: "0.01% OR MINATO 10TH QUEST", cost: "EVENT ONLY", board: 3, desc: "Auto trains 175% of your Chakra, Buffs Kurama damage by 1.5x and Kurama drop chances by 1.5x increases your Yen Per Min by x1.05." },
        ];  

        // Active Codes
        const activeCodes = ["150KLIKES","KURAMANEXTWEEK","25MVisits","125KLIKES","50KFAVORITES","BUGSPATCH1","BUGSPATCH2","BUGSPATCH3","BUGSPATCH4","UPDATETHISWEEKEND","100KLIKES","NEWCHIKARACODE","75KLIKES","ALMOST100KKLIKES","MOREYEN","MORECHIKARA","HappyNewYear","50kLikes","10MVisits","NewBloodlines","15kLikes","25kLikes","30kLikes","MinorBugs","BadActors","JanuaryIncident","Krampus","SecretCode","ChristmasTime","10kLikes","1MVisits","ChristmasDelay","Gullible67","FreeChikara3","FreeChikara2","FreeChikara","YenCode","WednesdayYenCode","WednesdayBoostsCode","ThursdayYenNewCode","ThursdayBoostsNewCode","KuramaUpdateSoon","NewFridayYenCode","NewFridayBoostsCode","175KLIKES","200KLIKES","SMALLCHIKARACODE","BIGCHIKARACODE","FIGHTINGPASS","KURAMAUPDATE","SATURDAYBUGSPATCH","50KCHIKARACODE"];

        // Specials Data
    const specialsData = {
        bloodlines: [
            {name: "SHARINGAN", abilities: [
                "Z - No Damage, Stuns Players for 5 seconds",
                "X - Based on the move you copy",
                "C - Dodge"
            ]},
            {name: "BYAKUGAN", abilities: [
                "Z - Chakra, 40x Multiplier",
                "X - Strength, 25x Multiplier/7 Ticks",
                "C - Strength, 24x Multiplier/10 Ticks"
            ]},
            {name: "ITACHI'S MANGEKYO SHARINGAN", abilities: [
                "Z - NAN (Can't use it for some reason)",
                "X - No Damage, Stuns Players for 5 Seconds",
                "C - Sword, 40x Multiplier/2 Ticks"
            ]},
            {name: "RINNEGAN", abilities: [
                "Z - No Damage, Pulls towards user",
                "X - Strength, 10x Multiplier",
                "C - Chakra, 55x Multiplier"
            ]}
        ],
        quirks: [
            {name: "BELLY LASER", abilities: [
                "Z - Chakra, 10x Multiplier",
                "X - No Damage? Desc says it does damage but can't get it to deal any",
                "C - Chakra, 25x Multiplier"
            ]},
            {name: "BLUE INFERNO", abilities: [
                "Z - Chakra, 8x Multiplier/5 Ticks",
                "X - Chakra, 4x Multiplier/5 Ticks",
                "C - Chakra, 8x Multiplier/5 Ticks"
            ]},
            {name: "FROSTFIRE RIFT", abilities: [
                "Z - Chakra, 40x Multiplier",
                "X - Chakra, 12x Multiplier/4 Ticks",
                "C - Chakra, 15x Multiplier/6 Ticks, Stuns Players"
            ]},
            {name: "BIO-RECONSTRUCT / OVERHAUL", abilities: [
                "Z - Strength, 30x Multiplier",
                "X - Strength, 35x Multiplier",
                "C - Strength, 40x Multiplier, Holds Players in Place"
            ]},
            {name: "UNITY DRIVE / ONE FOR ALL", abilities: [
                "Z - Strength, 30x Multiplier",
                "X - Strength, 35x Multiplier",
                "C - Strength, 40x Multiplier"
            ]},
            {name: "HELL FLAME / ENDEAVOR QUIRK", abilities: [
                "Z - Chakra, 25x Multiplier",
                "X - Chakra, 35x Multiplier",
                "C - Chakra, 55x Multiplier"
            ]}
        ],
        grimoires: [
            {name: "WATER GRIMOIRE / NOELLE GRIMOIRE", abilities: [
                "Z - Chakra, 25x Multiplier",
                "X - Chakra, 50x Multiplier",
                "C - Chakra, 75x Multiplier"
            ]},
            {name: "WIND GRIMOIRE / YUNO GRIMOIRE", abilities: [
                "Z - Strength, 25x Multiplier",
                "X - Strength, 35x Multiplier",
                "C - Strength, 40x Multiplier"
            ]},
            {name: "DEMON GRIMOIRE / ASTA GRIMOIRE", abilities: [
                "Z - Strength, 20x Multiplier, Blocks Other Player Grimoire Damage",
                "X - Strength, 30x Multiplier",
                "C - Strength, 35x Multiplier, Reflects Other Player Grimoire Damage Back"
            ]},
            {name: "TREE GRIMOIRE / VANGEANCE GRIMOIRE", abilities: [
                "Z - Chakra, 15x Multiplier",
                "X - No Damage, Holds Players in place",
                "C - Chakra, 25x Multiplier"
            ]}
        ],
        stands: [
            {name: "THE ARM", abilities: [
                "Z - Strength, 2x Multiplier/15 Ticks",
                "X - Strength, 8x Multiplier",
                "C - No Damage, Pulls players towards you",
                "V - Chakra, 15x Multiplier"
            ]},
            {name: "HIEROPHANT LIME", abilities: [
                "Z - Strength, 2x Multiplier/15 Ticks",
                "X - Strength, 9x Multiplier",
                "C - Chakra, 8x Multiplier/10 Ticks",
                "V - Chakra, 10x Multiplier/3 Ticks"
            ]},
            {name: "MAGICIAN'S CRIMSON", abilities: [
                "Z - Strength, 3x Multiplier/15 Ticks",
                "X - Strength, 8x Multiplier",
                "C - Chakra, 8x Multiplier/4 Ticks",
                "V - Chakra, 10x Multiplier/4 Ticks"
            ]},
            {name: "PURPLE SMOG", abilities: [
                "Z - Strength, 2x Multiplier/15 Ticks",
                "X - Strength, 10x Multiplier",
                "C - Chakra, 5x Multiplier/5 Ticks",
                "V - Chakra, 7x Multiplier/8 Ticks"
            ]},
            {name: "KILLER KING", abilities: [
                "Z - Strength, 3x Multiplier/15 Ticks",
                "X - Strength, 12x Multiplier",
                "C - Chakra, 35x Multiplier",
                "V - Chakra, 30x Multiplier"
            ]},
            {name: "CELESTIAL DIAMOND", abilities: [
                "Z - Strength, 4x Multiplier/15 Ticks",
                "X - Strength, 15x Multiplier",
                "C - Chakra, 35x Multiplier",
                "V - No Damage, Stuns Players"
            ]},
            {name: "TIME CRUSADER / JOTARO'S STAND", abilities: [
                "Z - Strength, 4x Multiplier/15 Ticks",
                "X - Strength, 15x Multiplier",
                "C - Chakra, 40x Multiplier",
                "V - No Damage, Stuns Players"
            ]},
            {name: "GUARDIAN'S ARM / DIO STAND", abilities: [
                "Z - Strength, 4x Multiplier/15 Ticks",
                "X - Strength, 25x Multiplier",
                "C - Chakra, 5x Multiplier/15 Ticks",
                "V - Chakra, 60x Multiplier"
            ]},
            {name: "CRAFTED IN HEAVEN", abilities: [
                "Z - Strength, 5x Multiplier/15 Ticks",
                "X - Strength, 30x Multiplier",
                "C - Chakra, 70x Multiplier, Teleports to every entity nearby and hits them",
                "V - Chakra, 85x Multiplier"
            ]}
        ],
        kagunes: [
            {name: "EYE PATCH / KANEKI KAGUNE", abilities: [
                "Z - Chakra, 20x Multiplier",
                "X - Chakra, 5x Multiplier/8 Ticks"
            ]},
            {name: "JASON / JASON KAGUNE", abilities: [
                "Z - Chakra, 35x Multiplier",
                "X - Chakra, 45x Multiplier"
            ]},
            {name: "CENTIPEDE / KANEKI KAKUJA", abilities: [
                "Z - Chakra, 6x Multiplier/10 Ticks",
                "X - Chakra, 55x Multiplier"
            ]},
            {name: "ONE EYE / ETO'S KAGUNE", abilities: [
                "Z - Chakra, 5x Multiplier/20 Ticks",
                "X - Chakra, 65x Multiplier"
            ]}
        ]
    };

    // Quests Data
    const questsData = {
        minato: [
            {quest: 1, requirement: "5 boss kills", reward: "6h boost"},
            {quest: 2, requirement: "1qn all stats", reward: "400m yen"},
            {quest: 3, requirement: "5k increments", reward: "25k chikara"},
            {quest: 4, requirement: "10 boss kills", reward: "12h boost"},
            {quest: 5, requirement: "1sx main stats", reward: "12.5b yen"},
            {quest: 6, requirement: "10k increments", reward: "35k chikara"},
            {quest: 7, requirement: "50 boss kills", reward: "1d boost"},
            {quest: 8, requirement: "1sp main stats", reward: "2t yen"},
            {quest: 9, requirement: "15k increments", reward: "50k chikara"},
            {quest: 10, requirement: "100 boss kills", reward: "2d boost, +5 champ slots"}
        ],
        kirito: [
            {quest: 1, requirement: "Increase 1K strength, durability, and sword", reward: "30-Minute Self Boost, 5,000 Yen"},
            {quest: 2, requirement: "Defeat 5,000 NPCs", reward: "5,000 Chikara, 3-Hour Boost"},
            {quest: 3, requirement: "Reach 1B strength, durability, and sword", reward: "720,000 Yen, 5,000 Chikara"},
            {quest: 4, requirement: "Defeat 10,000 NPCs", reward: "15,000 Chikara, 6-Hour Boost"},
            {quest: 5, requirement: "Increase 5K strength, durability, and sword", reward: "1-Hour Self Boost, 2,500,000 Yen"},
            {quest: 6, requirement: "Reach 1T strength, durability, and sword", reward: "7,200,000 Yen, 10,000 Chikara"},
            {quest: 7, requirement: "Increase 10K strength, durability, and sword", reward: "1.5-Hour Self Boost, 12,500,000 Yen"},
            {quest: 8, requirement: "Reach 1QD strength, durability, and sword", reward: "25,000,000 Yen, 15,000 Chikara"},
            {quest: 9, requirement: "Defeat 25,000 NPCs", reward: "50,000 Chikara, 12-Hour Boost"},
            {quest: 10, requirement: "Reach 1QN strength, durability, and sword", reward: "180,000,000 Yen, 100K Chikara, 3-Hour Boost, New Champion, +5 Champion Inventory (F2P)"}
        ],
        booms: [
            {quest: 28, requirement: "Gain 10t Strength, 10t Durability, 10t Chakra", reward: "2m Yen, Spirit Explosion Power"},
            {quest: 29, requirement: "Gain 50t Strength", reward: "3m Yen"},
            {quest: 30, requirement: "Gain 50t Durability, 50t Chakra", reward: "4.5m Yen"},
            {quest: 31, requirement: "Gain 200t Strength", reward: "13.5m Yen"},
            {quest: 32, requirement: "Gain 200t Durability, 200t Chakra", reward: "20.25m Yen"},
            {quest: 33, requirement: "Gain 50qd Strength", reward: "30m Yen"},
            {quest: 34, requirement: "Gain 50qd Durability, 50qd Chakra", reward: "45m Yen"},
            {quest: 35, requirement: "Gain 1qn Strength", reward: "150m Yen"},
            {quest: 36, requirement: "Gain 1qn Durability, 1qn Chakra", reward: "225m Yen"},
            {quest: 37, requirement: "Gain 100qn Strength", reward: "625m Yen"},
            {quest: 38, requirement: "Gain 100qn Durability, 100qn Chakra", reward: "937.5m Yen"},
            {quest: 39, requirement: "Gain 1sx Strength", reward: "5b Yen"},
            {quest: 40, requirement: "Gain 1sx Durability, 1sx Chakra", reward: "7.5b Yen"},
            {quest: 41, requirement: "Gain 100sx Strength", reward: "100b Yen"},
            {quest: 42, requirement: "Gain 100sx Durability, 100sx Chakra", reward: "150b Yen"},
            {quest: 43, requirement: "Gain 1sp Strength", reward: "1.125t Yen"},
            {quest: 44, requirement: "Gain 1sp Durability, 1sp Chakra", reward: "3T Yen"}
        ],
        chopper: [
            {quest: 1, requirement: "1K strength, durability, chakra", reward: "1K Yen, 1K Chikara"},
            {quest: 2, requirement: "Kill 10 players", reward: "1K, 2K Chikara"},
            {quest: 3, requirement: "1M strength, durability, chakra", reward: "5K Yen, 3K Chikara , 3 Christmas Boxes"},
            {quest: 4, requirement: "5K increment of strength, durability and chakra", reward: "10K Yen, 5K Chikara, 30min Self Boost"},
            {quest: 5, requirement: "1B strength, durability, chakra", reward: "25K Yen 10K Chikara"},
            {quest: 6, requirement: "25 Sword kills", reward: "25K Yen, 10K Chikara, Snowflake Aura"},
            {quest: 7, requirement: "1T strength, durability, chakra", reward: "500K Yen, 20K Chikara"},
            {quest: 8, requirement: "10K increment of strength, durability, chakra", reward: "500K Yen, 20K Chikara, 2 Hour Self Boost"},
            {quest: 9, requirement: "1 QD strength, durability, chakra", reward: "5M Yen, 30K Chikara, Chopper Champion"},
            {quest: 10, requirement: "250 kills", reward: "5M Yen, 30K Chikara, 4 Hour Self boost"},
            {quest: 11, requirement: "1 QN strength, durability, chakra", reward: "500M Yen, 40K Chikara"},
            {quest: 12, requirement: "15K increment of strength, durability and chakra", reward: "500M Yen, 40K Chikara, 1 Day Self Boost"},
            {quest: 13, requirement: "1 SX strength, durability, chakra", reward: "50B Yen, 50K Chikara"},
            {quest: 14, requirement: "25K increment of strength, durability and chakra", reward: "50B Yen, 50K Chikara, 1 Day Self Boost"},
            {quest: 15, requirement: "1 SP strength, durability, chakra", reward: "1T Yen, 100K Chikara, Ace Champion"}
        ]
    };


        // Utility Functions
        function parseNum(val) {
            if (!val) return 0;
            val = val.toString().toUpperCase().replace(/,/g, '');
            const map = { K: 1e3, M: 1e6, B: 1e9, T: 1e12, QD: 1e15, QN: 1e18, SX: 1e21, SP: 1e24, Oc: 1e27, N: 1e30, DE: 1e33, UD: 1e36, DD: 1e39 };
            const match = val.match(/([0-9.]+)([A-Z]+)/);
            if (match && map[match[2]]) return parseFloat(match[1]) * map[match[2]];
            return parseFloat(val) || 0;
        }

        function formatNum(num) {
            if (num === 0) return "0";
            const map = [
                { v: 1e39, s: "DD" }, { v: 1e36, s: "UD" }, { v: 1e33, s: "DE" }, { v: 1e30, s: "N" }, { v: 1e27, s: "Oc" }, 
                { v: 1e24, s: "SP" }, { v: 1e21, s: "SX" }, { v: 1e18, s: "QN" }, { v: 1e15, s: "QD" }, { v: 1e12, s: "T" }, 
                { v: 1e9, s: "B" }, { v: 1e6, s: "M" }, { v: 1e3, s: "K" }
            ];
            for (let i = 0; i < map.length; i++) {
                if (num >= map[i].v) return (num / map[i].v).toFixed(2).replace(/\.00$/, '') + map[i].s;
            }
            return num.toFixed(2).replace(/\.00$/, '');
        }

        

        // Trap Logic (Preserved from original)
        (function initTrap() {
            setInterval(() => {
                if (typeof eruda !== 'undefined' || 
                    document.querySelector('[id*="eruda"], script[src*="eruda"]')) {
                    document.body.innerHTML = '<h1 class="text-glow-red">DEBUGGING NOT PERMITTED</h1>';
                    window.location.reload();
                }
            }, 90000);

            // setInterval(() => {
            //     debugger;
            // }, 50000);

            document.addEventListener('keydown', function(e) {
                if (state.trapActivated || !state.trapEnabled) return;
                
                const key = e.key;
                const code = e.keyCode || e.which;
                const ctrl = e.ctrlKey;
                const shift = e.shiftKey;
                const alt = e.altKey;
                
                const isDevToolsShortcut = 
                    (ctrl && shift && (code === 73 || key === 'I')) ||
                    (ctrl && shift && (code === 74 || key === 'J')) ||
                    (ctrl && shift && (code === 67 || key === 'C')) ||
                    (ctrl && shift && (code === 79 || key === 'O')) || 
                    (ctrl && shift && (code === 80 || key === 'P')) ||  
                    (ctrl && shift && (code === 83 || key === 'S')) || 
                    (ctrl && shift && (code === 70 || key === 'F')) || 
                    (ctrl && shift && (code === 82 || key === 'R')) ||  
                    (ctrl && shift && (code === 69 || key === 'E')) ||
                    (ctrl && shift && (code === 77 || key === 'M')) ||
                    (ctrl && alt && (code === 73 || key === 'I')) ||
                    (ctrl && alt && (code === 74 || key === 'J')) ||
                    (ctrl && alt && (code === 67 || key === 'C')) ||
                    (ctrl && shift && (code === 75 || key === 'K')) ||
                    (ctrl && shift && (code === 81 || key === 'Q')) ||
                    (alt && shift && (code === 73 || key === 'I')) ||
                    (ctrl && (code === 192 || key === '`' || key === '~')) ||     
                    (ctrl && (code === 219 || key === '[' || key === '{')) ||    
                    (ctrl && (code === 221 || key === ']' || key === '}')) ||     
                    (ctrl && (code === 187 || key === '=' || key === '+')) ||     
                    (ctrl && (code === 189 || key === '-' || key === '_')) ||     
                    (ctrl && (code === 48 || key === '0')) ||                                                                   
                    (ctrl && shift && alt && (code === 73 || key === 'I')) ||     
                    (ctrl && shift && alt && (code === 74 || key === 'J')) ||     
                    (ctrl && shift && alt && (code === 67 || key === 'C')) ||     
                    (ctrl && shift && code >= 65 && code <= 90) ||                
                    (ctrl && alt && code >= 65 && code <= 90) || 
                    (ctrl && (code === 85 || key === 'U'));
                    
                if (isDevToolsShortcut) {
                    e.preventDefault();
                    e.stopPropagation();
                    triggerTrap();
                }
            });
        })();

        // Update trap function to play sound
function triggerTrap() {
    if (state.trapActivated) return;
    
    state.trapActivated = true;
    
    s('trapScreen').style.display = 'flex';
    
    // Play trap sound
    if (_T) {
        _T.currentTime = 0;
        _T.play().catch(() => {});
        _T.loop = true;
    }
    
    if (_B) _B.pause();
    
    document.querySelectorAll('#mainContent, .tab-bar, #muteBtn').forEach(el => {
        el.style.display = 'none';
    });
    
    let seconds = 10;
    const countdown = setInterval(() => {
        s('trapCountdown').textContent = seconds;
        seconds--;
        
        if (seconds < 0) {
            clearInterval(countdown);
            window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1';
        }
    }, 1000);
}

// UI Functions
    function showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.querySelectorAll('.cyber-tab').forEach(btn => {
            btn.classList.remove('active');
        });

         // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Update URL hash for bookmarking
        window.location.hash = pageId;
    }

     // Activate corresponding tab
    const activeTab = document.querySelector(`[data-page="${pageId}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
        
        s(pageId).classList.add('active');
        document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
        
       if (pageId === 'powersPage') updatePowersDisplay();
       if (pageId === 'championsPage') renderChampions();
       if (pageId === 'codesPage') renderCodes();
       if (pageId === 'specialsPage') updateSpecialsDisplay();
       if (pageId === 'questsPage') updateQuestsDisplay();
       if (pageId === 'gachaPage') initGachaCards();
    }

   // Gacha Card Zoom Functionality - SIMPLIFIED VERSION
// function initGachaCards() {
//     const gachaCards = document.querySelectorAll('.gacha-card');
    
//     gachaCards.forEach(card => {
//         card.addEventListener('click', function(e) {
//             e.stopPropagation();
            
//             // Remove zoom from all cards first
//             gachaCards.forEach(c => {
//                 c.classList.remove('zoomed');
//                 const existingBtn = c.querySelector('.close-zoom-btn');
//                 if (existingBtn) existingBtn.remove();
//             });
            
//             // Add zoom to clicked card
//             this.classList.add('zoomed');
            
//             // Add close button
//             const closeBtn = document.createElement('button');
//             closeBtn.className = 'close-zoom-btn';
//             closeBtn.innerHTML = '×';
//             closeBtn.title = 'Close';
            
//             closeBtn.addEventListener('click', function(e) {
//                 e.stopPropagation();
//                 card.classList.remove('zoomed');
//                 this.remove();
//                 document.body.style.overflow = '';
//             });
            
//             this.appendChild(closeBtn);
            
//             // Let CSS handle scrolling naturally
//             document.body.style.overflow = 'hidden';
//         });
//     });
    
//     // Close zoom with ESC key
//     document.addEventListener('keydown', function(e) {
//         if (e.key === 'Escape') {
//             gachaCards.forEach(card => {
//                 card.classList.remove('zoomed');
//                 const closeBtn = card.querySelector('.close-zoom-btn');
//                 if (closeBtn) closeBtn.remove();
//             });
//             document.body.style.overflow = '';
//         }
//     });
    
//     // Close zoom when clicking outside
//     document.addEventListener('click', function(e) {
//         if (!e.target.closest('.gacha-card.zoomed')) {
//             gachaCards.forEach(card => {
//                 card.classList.remove('zoomed');
//                 const closeBtn = card.querySelector('.close-zoom-btn');
//                 if (closeBtn) closeBtn.remove();
//             });
//             document.body.style.overflow = '';
//         }
//     });
// }

// // Call this in your initialization
// document.addEventListener('DOMContentLoaded', function() {
//     // Initialize gacha cards
//     setTimeout(() => {
//         if (document.getElementById('gachaPage')) {
//             initGachaCards();
//         }
//     }, 100);
// });

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded - initializing...");
    
    // Get elements with better error handling
    const startBtn = s('startBtn');
    const muteBtn = s('muteBtn');
    const bgMusic = s('bgMusic');
    const muteIcon = s('muteIcon');
    
    // Debug logs
    console.log("Start button:", startBtn);
    console.log("Mute button:", muteBtn);
    console.log("BG Music:", bgMusic);
    console.log("Mute icon:", muteIcon);
    
    // Loader
    if (startBtn) {
        startBtn.onclick = () => {
            console.log("Start button clicked");
            s('loader').style.opacity = '0';
            setTimeout(() => { 
                s('loader').style.visibility = 'hidden';
                s('mainContent').classList.remove('hidden');
                if (_B) {
                    _B.play().then(() => {
                        console.log("Music started");
                    }).catch(e => {
                        console.log("Music play error:", e);
                    });
                }
                if (_I) {
                    _I.className = 'bi bi-volume-up-fill';
                    console.log("Icon set to volume-up");
                }
                state.trapEnabled = true;
                
                // Initialize components
                renderCodes();
                renderChampions();
                updatePowersDisplay();
                calculateCoins();
                calculateStats();
                updateSpecialsDisplay();
                updateQuestsDisplay();
            }, 600);
        };
    }
    
    // Mute toggle 
    if (muteBtn && bgMusic) {
        console.log("Setting up mute button...");
        
        // Remove any existing listeners
        muteBtn.onclick = null;
        
        // Add new click handler
        muteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log("Mute button clicked!");
            
            if (state.trapActivated) {
                console.log("Trap activated, ignoring");
                return;
            }
            
            if (bgMusic.paused) {
                console.log("Playing music...");
                bgMusic.play().then(() => {
                    console.log("Music resumed");
                    if (muteIcon) {
                        muteIcon.className = 'bi bi-volume-up-fill';
                    }
                    showToast("> MUSIC UNMUTED", 'info');
                }).catch(error => {
                    console.log("Music play failed:", error);
                });
            } else {
                console.log("Pausing music...");
                bgMusic.pause();
                if (muteIcon) {
                    muteIcon.className = 'bi bi-volume-mute-fill';
                }
                showToast("> MUSIC MUTED", 'info');
            }
        });
        
        // Add visual feedback
        muteBtn.style.cursor = 'pointer';
        console.log("Mute button setup complete");
    } else {
        console.error("Mute button or bgMusic not found!");
    }
    
    // Tab navigation
    document.querySelectorAll('.cyber-tab').forEach(btn => {
        btn.addEventListener('click', function() {
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });
    
    // Quick tool buttons
    document.querySelectorAll('[data-page]').forEach(btn => {
        if (!btn.classList.contains('cyber-tab')) {
            btn.addEventListener('click', function() {
                const pageId = this.getAttribute('data-page');
                showPage(pageId);
            });
        }
    });
    
    // Calculator toggles
    const afk = s("afkSwitch");
    const click = s("clickingSwitch");
    if (afk && click) {
        afk.onclick = () => { click.checked = !afk.checked; calculateStats(); };
        click.onclick = () => { afk.checked = !click.checked; calculateStats(); };
    }
    
    // Block right click
    d.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    console.log("Initialization complete");
});


// Initialize gacha cards when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize gacha cards
    setTimeout(() => {
        if (document.getElementById('gachaPage')) {
            initGachaCards();
        }
    }, 100);
    
    // Check URL hash on page load
    if (window.location.hash) {
        const pageId = window.location.hash.substring(1);
        if (document.getElementById(pageId)) {
            setTimeout(() => {
                showPage(pageId);
            }, 100);
        }
    }
});

        // Calculator Functions
    function toggleStatsMode(mode) {
        const afk = s("afkSwitch");
        const click = s("clickingSwitch");
        
        if (mode === 'AFK' && afk.checked) {
            click.checked = false;
        } else if (mode === 'CLICK' && click.checked) {
            afk.checked = false;
        }
        calculateStats();
    }

        function startBoost() {
            const mins = parseInt(s("boostMinutes").value) || 0;
            state.boostActive = true;
            state.boostSecondsRemaining = mins * 60;
            s("countdownDisplay").style.display = "block";
            
            if (isNaN(mins) || mins <= 0) {
                s("boostMinutes").style.borderColor = "var(--cyber-red)";
                setTimeout(() => s("boostMinutes").style.borderColor = "", 500);
                return;
            }

            if (state.boostInterval) clearInterval(state.boostInterval);
            state.boostInterval = setInterval(() => {
                state.boostSecondsRemaining--;
                if (state.boostSecondsRemaining <= 0) {
                    clearInterval(state.boostInterval);
                    state.boostActive = false;
                    s("countdownDisplay").style.display = "none";
                    calculateStats();
                } else {
                    s("timerText").innerText = `${Math.floor(state.boostSecondsRemaining / 60).toString().padStart(2, '0')}:${(state.boostSecondsRemaining % 60).toString().padStart(2, '0')}`;
                    calculateStats();
                }
            }, 1000);
        }

        function calculateStats() {
            const statName = s("statOption").value;
            const perTick = parseNum(s("statPerTick").value) * (state.boostActive ? 1.5 : 1);
            const tickRate = s("clickingSwitch").checked ? ticksPerStat[statName].Clicking : ticksPerStat[statName].AFK;
            state.lastStatPerMinute = (perTick * tickRate) + (parseNum(s("championTickStat").value) * 15);
            const want = parseNum(s("wantedStats").value);
            const cur = parseNum(s("currentStats").value);
            const mins = (want - cur) / state.lastStatPerMinute;

            s("statGainPerMinute").innerHTML = `${formatNum(state.lastStatPerMinute)} ${state.boostActive ? '<span class="text-glow-green">(x1.5)</span>' : ''}`;
            if (want > cur) {
                const days = Math.floor(mins / 1440);
                const hours = Math.floor((mins % 1440) / 60);
                const minutes = Math.floor(mins % 60);
                s("timeToReach").textContent = `${days}d ${hours}h ${minutes}m`;
            } else {
                s("timeToReach").textContent = `TARGET REACHED`;
            }
        }

        function calculateCoins() {
            const isX2 = s("x2").checked;
            const baseVal = parseNum(s("rank").value) * (isX2 ? 2 : 1);
            const total = baseVal * parseFloat(s("nenMulti").value) * parseFloat(s("heroMulti").value) * parseNum(s("championYenMulti").value);
            s("baseYenDisplay").innerText = formatNum(baseVal);
            s("yenPerMin").textContent = formatNum(total);
            const mins = Math.max(0, (parseNum(s("neededCoins").value) - parseNum(s("currentCoins").value)) / total);
            s("coinsResult").textContent = `${Math.floor(mins / 1440)}d ${Math.floor((mins % 1440) / 60)}h ${Math.floor(mins % 60)}m`;
        }

        // Powers Functions
        function updatePowersDisplay() {
            const stat = s("powersSelect").value;
            const display = s("powersDisplay");
            if (!display) return;
            
            if (powerData[stat]) {
                display.innerHTML = powerData[stat].map(p => `
                    <div class="champion-card">
                        <h3 class="font-bold text-lg mb-2 text-glow-blue">${p.name}</h3>
                        <p class="terminal-text">${p.val}</p>
                    </div>
                `).join('');
            }
        }

        // Champions Functions
        function renderChampions() {
            const display = s("championsDisplay");
            if (!display) return;
            
            let filteredChampions = championsData;
            
            if (state.searchTerm) {
                filteredChampions = filteredChampions.filter(champ => 
                    champ.name.toLowerCase().includes(state.searchTerm.toLowerCase())
                );
            }
            
            if (state.currentFilter !== 'all') {
                filteredChampions = filteredChampions.filter(champ => 
                    state.currentFilter === 3 ? champ.board === 3 : champ.board === state.currentFilter
                );
            }
            
            if (filteredChampions.length === 0) {
                display.innerHTML = '<div class="col-span-3 text-center py-8 terminal-text">> NO CHAMPIONS FOUND</div>';
                return;
            }
            
            display.innerHTML = filteredChampions.map(c => `
                <div class="champion-card">
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="font-bold text-lg text-glow-purple">${c.name}</h3>
                        <span class="cyber-badge ${c.board === 1 ? 'badge-blue' : c.board === 2 ? 'badge-purple' : 'badge-pink'}">
                            ${c.board === 3 ? 'LIMITED' : 'BOARD ' + c.board}
                        </span>
                    </div>
                    <div class="mb-3">
                        <div class="text-sm terminal-text">CHANCES TO OBTAIN</div>
                        <div class="font-medium text-glow-green">${c.chance}</div>
                    </div>
                    <div class="mb-3">
                        <div class="text-sm terminal-text">SELLING COST</div>
                        <div class="font-medium text-glow-blue">${c.cost}</div>
                    </div>
                    <div>
                        <div class="text-sm terminal-text">DESCRIPTION</div>
                        <p class="text-sm">${c.desc}</p>
                    </div>
                </div>
            `).join('');
        }

        function filterChampions() {
            state.searchTerm = s("championSearch").value;
            renderChampions();
        }

        function filterByBoard(board) {
            state.currentFilter = board;
            renderChampions();
        }

        function clearFilters() {
            state.currentFilter = 'all';
            state.searchTerm = '';
            s("championSearch").value = '';
            renderChampions();
        }

        // Codes Functions
        function renderCodes() {
            const grid = s("codesGrid");
            if (!grid) return;
            
            grid.innerHTML = activeCodes.map(code => `
                <div class="code-item cursor-pointer" onclick="copyCode('${code}')">
                    <span class="font-medium text-glow-green">${code}</span>
                    <i class="bi bi-copy terminal-text"></i>
                </div>
            `).join('');
        }

        function copyCode(code) {
            navigator.clipboard.writeText(code);
            if (_N) {
                _N.currentTime = 0;
                _N.play();
            }
            
            showToast(`> COPIED: ${code}`, 'success');
        }

        // Specials Functions
    function updateSpecialsDisplay() {
        const category = s("specialsSelect").value;
        const display = s("specialsDisplay");
        if (!display) return;
        
        if (specialsData[category]) {
            display.innerHTML = specialsData[category].map(item => `
                <div class="champion-card">
                    <h3 class="font-bold text-lg mb-3 text-glow-blue">${item.name}</h3>
                    <div class="space-y-2">
                        ${item.abilities.map(ability => `
                            <div class="flex items-start gap-2">
                                <span class="cyber-badge badge-green mt-1">${ability.split(' - ')[0]}</span>
                                <span class="terminal-text flex-1">${ability.split(' - ').slice(1).join(' - ')}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }
    }

    // Quests Functions
    function updateQuestsDisplay() {
        const line = s("questsSelect").value;
        const display = s("questsDisplay");
        if (!display) return;
        
        if (questsData[line]) {
            display.innerHTML = questsData[line].map(q => `
                <div class="champion-card">
                    <div class="flex justify-between items-start mb-3">
                        <h3 class="font-bold text-lg text-glow-purple">QUEST ${q.quest}</h3>
                        <span class="cyber-badge ${line === 'minato' ? 'badge-blue' : line === 'kirito' ? 'badge-purple' : line === 'booms' ? 'badge-pink' : 'badge-green'}">
                            ${line.toUpperCase()}
                        </span>
                    </div>
                    <div class="mb-3">
                        <div class="text-sm terminal-text">REQUIREMENT</div>
                        <div class="font-medium text-glow-green">${q.requirement}</div>
                    </div>
                    <div>
                        <div class="text-sm terminal-text">REWARD</div>
                        <div class="font-medium text-glow-blue">${q.reward || "Not specified"}</div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Commands Functions
    function copyAllCommands() {
        const commands = [
            "/kick <name> - Kicks a specific player from the server",
            "/kick all - Kicks all players except you",
            "/ban <name> - Bans a specific player and kicks them",
            "/ban all - Bans all players except you and kicks them",
            "/unban <name> - Removes ban from a specific player",
            "/unban all - Removes all bans",
            "/kill <name> - Kills a specific player's character",
            "/kill all - Kills all players except you",
            "/shutdown - Shuts down the server and kicks everyone",
            "/lock - Prevents new players from joining (saves)",
            "/unlock - Allows new players to join again (saves)",
            "/kickondeath - Toggles kicking players when they die (saves)",
            "/pvpon - Enables PVP for all players (current session only)",
            "/pvpoff - Disables PVP for all players (current session only)"
        ].join('\n');
        
        navigator.clipboard.writeText(commands);
        if (_N) {
            _N.currentTime = 0;
            _N.play();
        }
        
        showToast("> ALL COMMANDS COPIED TO CLIPBOARD", 'success');
    }


        // Toast Notification System
        function showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg z-50 ${
                type === 'success' ? 'bg-dark-2 border border-cyber-green' : 
                type === 'error' ? 'bg-dark-2 border border-cyber-red' : 
                'bg-dark-2 border border-cyber-blue'
            }`;
            toast.innerHTML = `<span class="${type === 'success' ? 'text-glow-green' : type === 'error' ? 'text-glow-red' : 'text-glow-blue'} terminal-text">${message}</span>`;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(20px)';
                setTimeout(() => document.body.removeChild(toast), 300);
            }, 3000);
        }

         // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        // Loader
        s('startBtn').onclick = () => {
            s('loader').style.opacity = '0';
            setTimeout(() => { 
                s('loader').style.visibility = 'hidden';
                s('mainContent').classList.remove('hidden');
                if (_B) _B.play(); 
                if (_I) _I.className = 'bi bi-volume-up-fill'; 
                state.trapEnabled = true;
                
                // Initialize components
                renderCodes();
                renderChampions();
                updatePowersDisplay();
                calculateCoins();
                calculateStats();
                updateSpecialsDisplay();
                updateQuestsDisplay();
            }, 600);
        };
            
            // Mute toggle
        s('muteBtn').onclick = () => {
            if (!state.trapActivated) {
                if (_B.paused) {
                    _B.play(); 
                    if (_I) _I.className = 'bi bi-volume-up-fill';
                } else {
                    _B.pause(); 
                    if (_I) _I.className = 'bi bi-volume-mute-fill';
                }
            }
        };
            
            // Tab navigation
            document.querySelectorAll('.cyber-tab').forEach(btn => {
                btn.addEventListener('click', function() {
                    const pageId = this.getAttribute('data-page');
                    showPage(pageId);
                });
            });
            
            // Quick tool buttons
            document.querySelectorAll('[data-page]').forEach(btn => {
                if (!btn.classList.contains('cyber-tab')) {
                    btn.addEventListener('click', function() {
                        const pageId = this.getAttribute('data-page');
                        showPage(pageId);
                    });
                }
            });
            
            // Calculator toggles
            const afk = s("afkSwitch");
            const click = s("clickingSwitch");
            if (afk && click) {
                afk.onclick = () => { click.checked = !afk.checked; calculateStats(); };
                click.onclick = () => { afk.checked = !click.checked; calculateStats(); };
            }
            
            // Block right click
            d.addEventListener('contextmenu', function(e) {
                e.preventDefault();
            });
        });

// Call when DOM is loaded
document.addEventListener('DOMContentLoaded', initMobileFeatures);
    // Mobile-specific improvements
function initMobileFeatures() {
    // Check if mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Add touch-specific classes
        document.body.classList.add('mobile-device');
        
        // Improve button touch targets
        document.querySelectorAll('.cyber-btn, .cyber-tab').forEach(btn => {
            btn.style.minHeight = '44px';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.justifyContent = 'center';
        });
        
        // Disable hover effects on mobile
        const style = document.createElement('style');
        style.textContent = `
            @media (hover: hover) and (pointer: fine) {
                .mobile-device .cyber-btn:hover,
                .mobile-device .cyber-tab:hover,
                .mobile-device .champion-card:hover,
                .mobile-device .code-item:hover {
                    transform: none !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        // Prevent accidental zoom on double-tap
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
}