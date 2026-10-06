// Mock stand-in for @sketchup/sketchup-shared-ts/lib/Whp/Enums.
//
// The real @sketchup/sketchup-shared-ts package is a private dependency
// declared in sketchup_web/frontend/package.json but not installed in the
// source tree (it's source-of-truth only, never `npm install`'d — see
// p11mock SKILL.md "Important rules"). @/constants/GlobalConstants.ts
// imports BinaryType from it just to build a whitelist array; this stub
// supplies only the enum members that file actually references.
export enum BinaryType {
  Sketchup_2021 = 'Sketchup_2021',
  Sketchup_2020 = 'Sketchup_2020',
  Sketchup_2019 = 'Sketchup_2019',
  Sketchup_2018 = 'Sketchup_2018',
  Sketchup_2017 = 'Sketchup_2017',
  Sketchup_2016 = 'Sketchup_2016',
  Sketchup_2015 = 'Sketchup_2015',
  Sketchup_2014 = 'Sketchup_2014',
  Sketchup_8 = 'Sketchup_8',
  Sketchup_7 = 'Sketchup_7',
  Sketchup_6 = 'Sketchup_6',
  Sketchup_5 = 'Sketchup_5',
}
