# SuparPOS 100-theme progress

ไฟล์นี้เป็นรายการติดตามกลางสำหรับการสร้างธีมใหม่ทีละ 10 ธีม อ้างอิงรายละเอียดจาก `theme-catalog.md`

## สถานะ

- ⬜ รอทำ
- 🟨 กำลังทำ
- ✅ เสร็จและผ่านการตรวจ
- 🟥 ติดปัญหา
- `is_active` ต้องเป็น `false` จนกว่าผู้ใช้จะตรวจและสั่งเปิดขายอย่างชัดเจน

ให้ผู้ปฏิบัติงานอัปเดตสถานะทีละธีม พร้อมใส่หลักฐานสั้น ๆ ในคอลัมน์หมายเหตุ ห้ามทำเครื่องหมาย ✅ จากแผนหรือจาก TypeScript เพียงอย่างเดียว ต้องมี Component, Route, การทดสอบฟังก์ชัน และ Viewport ครบตาม `release-checklist.md`

## Batch 1 — คิวปัจจุบัน: Priority A แบบคละประเภทร้าน

| สถานะ | ID | ธีม | Component | `theme_mode` | เปิดขาย | หมายเหตุ |
|---|---:|---|---|---|---|---|
| ✅ | 001 | Siam Midnight | `SiamMidnight.tsx` | `siammidnight` | `false` | Verified all 6 viewports, responsive, modal behavior & compilation |
| ✅ | 011 | Omakase Ink | `OmakaseInk.tsx` | `omakaseink` | `false` | Verified all 6 viewports, responsive, modal behavior & compilation |
| ✅ | 021 | Mediterranean Mosaic | `MediterraneanMosaic.tsx` | `mediterraneanmosaic` | `false` | Verified all 6 viewports, responsive, modal behavior & compilation |
| ✅ | 031 | Espresso Blueprint | `EspressoBlueprint.tsx` | `espressoblueprint` | `false` | Verified all 6 viewports, responsive, modal behavior & compilation |
| ✅ | 041 | Glacier Glass | `GlacierGlass.tsx` | `glacierglass` | `false` | Verified all 6 viewports, responsive, modal behavior & compilation |
| ✅ | 051 | Obsidian Gold | `ObsidianGold.tsx` | `obsidiangold` | `false` | Verified all 6 viewports, responsive, modal behavior & compilation |
| ✅ | 061 | Warm Grid | `WarmGrid.tsx` | `warmgrid` | `false` | Verified all 6 viewports, responsive, modal behavior & compilation |
| ✅ | 071 | Y2K Snack Bar | `Y2KSnackBar.tsx` | `y2ksnackbar` | `false` | Verified all 6 viewports, responsive, modal behavior & compilation |
| ✅ | 094 | Ramadan Moon Table | `RamadanMoonTable.tsx` | `ramadanmoontable` | `false` | Verified all 6 viewports, responsive, modal behavior & compilation |
| ✅ | 097 | Vegan Botanica | `VeganBotanica.tsx` | `veganbotanica` | `false` | Verified all 6 viewports, responsive, modal behavior & compilation |

## Batch 2 — Priority A

| สถานะ | ID | ธีม | Component | `theme_mode` | เปิดขาย | หมายเหตุ |
|---|---:|---|---|---|---|---|
| ⬜ | 002 | Bangkok Neon Market | `BangkokNeonMarket.tsx` | `bangkokneonmarket` | `false` | |
| ⬜ | 012 | Matcha Atelier | `MatchaAtelier.tsx` | `matchaatelier` | `false` | |
| ⬜ | 023 | Paris Patisserie | `ParisPatisserie.tsx` | `parispatisserie` | `false` | |
| ⬜ | 033 | Boba Prism | `BobaPrism.tsx` | `bobaprism` | `false` | |
| ⬜ | 042 | Neo Deco Supper | `NeoDecoSupper.tsx` | `neodecosupper` | `false` | |
| ⬜ | 065 | Soft Utility | `SoftUtility.tsx` | `softutility` | `false` | |
| ⬜ | 077 | Bauhaus Bites | `BauhausBites.tsx` | `bauhausbites` | `false` | |
| ⬜ | 098 | Steakhouse Ember | `SteakhouseEmber.tsx` | `steakhouseember` | `false` | |
| ⬜ | 099 | Seafood Dock | `SeafoodDock.tsx` | `seafooddock` | `false` | |
| ⬜ | 100 | Cloud Kitchen Pro | `CloudKitchenPro.tsx` | `cloudkitchenpro` | `false` | |

## Batch 3 — Priority A

| สถานะ | ID | ธีม | Component | `theme_mode` | เปิดขาย | หมายเหตุ |
|---|---:|---|---|---|---|---|
| ⬜ | 003 | Lanna Loom | `LannaLoom.tsx` | `lannaloom` | `false` | |
| ⬜ | 004 | Isan Ember | `IsanEmber.tsx` | `isanember` | `false` | |
| ⬜ | 005 | Andaman Pearl | `AndamanPearl.tsx` | `andamanpearl` | `false` | |
| ⬜ | 010 | Saffron Pavilion | `SaffronPavilion.tsx` | `saffronpavilion` | `false` | |
| ⬜ | 013 | Seoul Sizzle | `SeoulSizzle.tsx` | `seoulsizzle` | `false` | |
| ⬜ | 038 | Brunch Sunday | `BrunchSunday.tsx` | `brunchsunday` | `false` | |
| ⬜ | 044 | Liquid Candy | `LiquidCandy.tsx` | `liquidcandy` | `false` | |
| ⬜ | 045 | Velvet Cinema | `VelvetCinema.tsx` | `velvetcinema` | `false` | |
| ⬜ | 049 | Tactile Clay | `TactileClay.tsx` | `tactileclay` | `false` | |
| ⬜ | 079 | Vintage Receipt | `VintageReceipt.tsx` | `vintagereceipt` | `false` | |

## Batch 4

| สถานะ | ID | ธีม | Component | `theme_mode` | เปิดขาย | หมายเหตุ |
|---|---:|---|---|---|---|---|
| ⬜ | 006 | Chao Phraya Twilight | `ChaoPhrayaTwilight.tsx` | `chaophrayatwilight` | `false` | |
| ⬜ | 007 | Talad Morning | `TaladMorning.tsx` | `taladmorning` | `false` | |
| ⬜ | 008 | Coconut Courtyard | `CoconutCourtyard.tsx` | `coconutcourtyard` | `false` | |
| ⬜ | 009 | Lotus Ledger | `LotusLedger.tsx` | `lotusledger` | `false` | |
| ⬜ | 014 | Tokyo Kissaten | `TokyoKissaten.tsx` | `tokyokissaten` | `false` | |
| ⬜ | 015 | Bento Blueprint | `BentoBlueprint.tsx` | `bentoblueprint` | `false` | |
| ⬜ | 016 | Pho Lantern | `PhoLantern.tsx` | `pholantern` | `false` | |
| ⬜ | 017 | Dim Sum Atelier | `DimSumAtelier.tsx` | `dimsumatelier` | `false` | |
| ⬜ | 018 | Hotpot Aurora | `HotpotAurora.tsx` | `hotpotaurora` | `false` | |
| ⬜ | 019 | Ramen Foundry | `RamenFoundry.tsx` | `ramenfoundry` | `false` | |

## Batch 5

| สถานะ | ID | ธีม | Component | `theme_mode` | เปิดขาย | หมายเหตุ |
|---|---:|---|---|---|---|---|
| ⬜ | 020 | Taipei Night Bites | `TaipeiNightBites.tsx` | `taipeinightbites` | `false` | |
| ⬜ | 022 | Bombay Spice Rail | `BombaySpiceRail.tsx` | `bombayspicerail` | `false` | |
| ⬜ | 024 | Nordic Bakery | `NordicBakery.tsx` | `nordicbakery` | `false` | |
| ⬜ | 025 | Mexico Papel | `MexicoPapel.tsx` | `mexicopapel` | `false` | |
| ⬜ | 026 | Turkish Copper | `TurkishCopper.tsx` | `turkishcopper` | `false` | |
| ⬜ | 027 | Amalfi Lemon Table | `AmalfiLemonTable.tsx` | `amalfilemontable` | `false` | |
| ⬜ | 028 | Havana Supper Club | `HavanaSupperClub.tsx` | `havanasupperclub` | `false` | |
| ⬜ | 029 | Marrakech Pantry | `MarrakechPantry.tsx` | `marrakechpantry` | `false` | |
| ⬜ | 030 | Santorini Blue Plate | `SantoriniBluePlate.tsx` | `santoriniblueplate` | `false` | |
| ⬜ | 032 | Roastery No. 9 | `RoasteryNo9.tsx` | `roasteryno9` | `false` | |

## Batch 6

| สถานะ | ID | ธีม | Component | `theme_mode` | เปิดขาย | หมายเหตุ |
|---|---:|---|---|---|---|---|
| ⬜ | 034 | Cocoa Cloud | `CocoaCloud.tsx` | `cocoacloud` | `false` | |
| ⬜ | 035 | Tea Ceremony | `TeaCeremony.tsx` | `teaceremony` | `false` | |
| ⬜ | 036 | Gelato Riviera | `GelatoRiviera.tsx` | `gelatoriviera` | `false` | |
| ⬜ | 037 | Croissant Journal | `CroissantJournal.tsx` | `croissantjournal` | `false` | |
| ⬜ | 039 | Juice Spectrum | `JuiceSpectrum.tsx` | `juicespectrum` | `false` | |
| ⬜ | 040 | Pastel Dairy Club | `PastelDairyClub.tsx` | `pasteldairyclub` | `false` | |
| ⬜ | 043 | Glitch Bistro | `GlitchBistro.tsx` | `glitchbistro` | `false` | |
| ⬜ | 046 | Analog Terminal | `AnalogTerminal.tsx` | `analogterminal` | `false` | |
| ⬜ | 047 | Paper Cut Pantry | `PaperCutPantry.tsx` | `papercutpantry` | `false` | |
| ⬜ | 048 | Reality Ripple | `RealityRipple.tsx` | `realityripple` | `false` | |

## Batch 7

| สถานะ | ID | ธีม | Component | `theme_mode` | เปิดขาย | หมายเหตุ |
|---|---:|---|---|---|---|---|
| ⬜ | 050 | Cosmic Pantry | `CosmicPantry.tsx` | `cosmicpantry` | `false` | |
| ⬜ | 052 | Emerald Society | `EmeraldSociety.tsx` | `emeraldsociety` | `false` | |
| ⬜ | 053 | Pearl and Ink | `PearlAndInk.tsx` | `pearlandink` | `false` | |
| ⬜ | 054 | Champagne Silk | `ChampagneSilk.tsx` | `champagnesilk` | `false` | |
| ⬜ | 055 | Marble Noir | `MarbleNoir.tsx` | `marblenoir` | `false` | |
| ⬜ | 056 | Ruby Lounge | `RubyLounge.tsx` | `rubylounge` | `false` | |
| ⬜ | 057 | Imperial Jade | `ImperialJade.tsx` | `imperialjade` | `false` | |
| ⬜ | 058 | Copper Reserve | `CopperReserve.tsx` | `copperreserve` | `false` | |
| ⬜ | 059 | Midnight Orchid | `MidnightOrchid.tsx` | `midnightorchid` | `false` | |
| ⬜ | 060 | Ivory Gallery | `IvoryGallery.tsx` | `ivorygallery` | `false` | |

## Batch 8

| สถานะ | ID | ธีม | Component | `theme_mode` | เปิดขาย | หมายเหตุ |
|---|---:|---|---|---|---|---|
| ⬜ | 062 | Quiet Linen | `QuietLinen.tsx` | `quietlinen` | `false` | |
| ⬜ | 063 | Paper White | `PaperWhite.tsx` | `paperwhite` | `false` | |
| ⬜ | 064 | Stone Type | `StoneType.tsx` | `stonetype` | `false` | |
| ⬜ | 066 | Mono Market | `MonoMarket.tsx` | `monomarket` | `false` | |
| ⬜ | 067 | Rice Paper | `RicePaper.tsx` | `ricepaper` | `false` | |
| ⬜ | 068 | Bare Ceramic | `BareCeramic.tsx` | `bareceramic` | `false` | |
| ⬜ | 069 | Calm Counter | `CalmCounter.tsx` | `calmcounter` | `false` | |
| ⬜ | 070 | Nordic Pantry | `NordicPantry.tsx` | `nordicpantry` | `false` | |
| ⬜ | 072 | VHS Diner | `VHSDiner.tsx` | `vhsdiner` | `false` | |
| ⬜ | 073 | Pixel Bento | `PixelBento.tsx` | `pixelbento` | `false` | |

## Batch 9

| สถานะ | ID | ธีม | Component | `theme_mode` | เปิดขาย | หมายเหตุ |
|---|---:|---|---|---|---|---|
| ⬜ | 074 | Cassette Cafe | `CassetteCafe.tsx` | `cassettecafe` | `false` | |
| ⬜ | 075 | Space Age Canteen | `SpaceAgeCanteen.tsx` | `spaceagecanteen` | `false` | |
| ⬜ | 076 | Disco Takeaway | `DiscoTakeaway.tsx` | `discotakeaway` | `false` | |
| ⬜ | 078 | Memphis Meal | `MemphisMeal.tsx` | `memphismeal` | `false` | |
| ⬜ | 080 | Arcade Noodle Club | `ArcadeNoodleClub.tsx` | `arcadenoodleclub` | `false` | |
| ⬜ | 081 | Rainforest Table | `RainforestTable.tsx` | `rainforesttable` | `false` | |
| ⬜ | 082 | Coral Coast | `CoralCoast.tsx` | `coralcoast` | `false` | |
| ⬜ | 083 | Desert Bloom | `DesertBloom.tsx` | `desertbloom` | `false` | |
| ⬜ | 084 | Alpine Hearth | `AlpineHearth.tsx` | `alpinehearth` | `false` | |
| ⬜ | 085 | Moonlit Garden | `MoonlitGarden.tsx` | `moonlitgarden` | `false` | |

## Batch 10

| สถานะ | ID | ธีม | Component | `theme_mode` | เปิดขาย | หมายเหตุ |
|---|---:|---|---|---|---|---|
| ⬜ | 086 | Bamboo Mist | `BambooMist.tsx` | `bamboomist` | `false` | |
| ⬜ | 087 | Volcanic Kitchen | `VolcanicKitchen.tsx` | `volcanickitchen` | `false` | |
| ⬜ | 088 | Arctic Berry | `ArcticBerry.tsx` | `arcticberry` | `false` | |
| ⬜ | 089 | Wildflower Brunch | `WildflowerBrunch.tsx` | `wildflowerbrunch` | `false` | |
| ⬜ | 090 | Terracotta Grove | `TerracottaGrove.tsx` | `terracottagrove` | `false` | |
| ⬜ | 091 | Lunar Feast | `LunarFeast.tsx` | `lunarfeast` | `false` | |
| ⬜ | 092 | Songkran Splash | `SongkranSplash.tsx` | `songkransplash` | `false` | |
| ⬜ | 093 | Loy Krathong Glow | `LoyKrathongGlow.tsx` | `loykrathongglow` | `false` | |
| ⬜ | 095 | Diwali Spice Light | `DiwaliSpiceLight.tsx` | `diwalispicelight` | `false` | |
| ⬜ | 096 | Winter Cabin | `WinterCabin.tsx` | `wintercabin` | `false` | |

## กติกาหลังจบแต่ละ Batch

1. หยุดหลังครบ 10 ธีม ห้ามเริ่ม Batch ถัดไปเอง
2. อัปเดตสถานะรายธีมในไฟล์นี้ตามหลักฐานจริง
3. รายงานไฟล์ Component, Route และ Marketplace ที่เปลี่ยน
4. รัน `git diff --check` และ `npx tsc --noEmit`
5. ทดสอบฟังก์ชันสินค้าและ Viewport ตาม `release-checklist.md`
6. คง `is_active = false` จนกว่าผู้ใช้จะตรวจและสั่งเปิดขาย
7. ห้าม Commit หรือ Push เว้นแต่ผู้ใช้สั่ง
