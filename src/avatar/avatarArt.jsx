import React from 'react';

// Palette and static drawing parts shared by the talking portrait and its small cameos.
export const C = {
  ink: '#17110f', skin: '#dfa77d', shade: '#b97a55', light: '#f2c79f', hair: '#1d1719', hairHi: '#3f3639',
  tee: '#a8262b', teeShade: '#6d1519', teeHi: '#cf4a44', white: '#f6f0e6', iris: '#3a2116', lip: '#c27a5e', lipShade: '#a5604a',
  mouth: '#3a0d12', teeth: '#f7f2e8', tongue: '#c64f5a',
};
export const line = { stroke: C.ink, strokeWidth: 4, strokeLinejoin: 'round', strokeLinecap: 'round' };

export const HairBack = () => <>
    <path d="M138,228 C122,206 118,170 122,140 C126,100 156,72 200,68 C248,66 284,94 288,134 C292,170 284,204 264,228 Z" fill={C.hair} {...line}/>
</>;
export const EarLeft = () => <>
    <path d="M141,186 C127,176 116,186 119,204 C122,222 131,232 145,229 Z" fill={C.skin} {...line}/>
    <path d="M136,196 C129,199 130,214 138,220" fill="none" stroke={C.shade} strokeWidth="3.5" strokeLinecap="round"/>
</>;
export const EarRight = () => <>
    <path d="M259,186 C273,176 284,186 281,204 C278,222 269,232 255,229 Z" fill={C.skin} {...line}/>
    <path d="M264,196 C271,199 270,214 262,220" fill="none" stroke={C.shade} strokeWidth="3.5" strokeLinecap="round"/>
</>;
export const Nose = () => <>
    <path d="M206,206 Q212,222 214,234 Q209,238 204,239 Z" fill={C.shade}/>
    <path d="M196,214 Q195,222 196,228" fill="none" stroke={C.light} strokeWidth="2.6" strokeLinecap="round"/>
    <path d="M205,205 Q211,222 214,233" fill="none" stroke={C.ink} strokeWidth="3" strokeLinecap="round"/>
    <path d="M188,233 Q190,240 197,240 Q200,242 203,240 Q210,240 213,233" fill="none" stroke={C.ink} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"/>
</>;
export const HairFront = () => <>
    <path d="M141,212 C134,198 130,182 132,168 C126,160 124,148 128,140 C124,126 130,112 140,104 C144,90 158,80 172,76 C182,66 198,62 212,64 C226,58 244,60 256,68 C270,70 284,80 290,94 C297,102 300,116 296,128 C300,140 297,153 291,161 C291,174 287,186 280,194 C278,202 275,207 271,209 L264,205 C268,200 266,186 262,174 C258,182 252,186 246,188 C250,178 248,168 240,162 C234,170 226,174 216,174 C220,166 216,158 208,154 C200,158 190,158 182,154 C184,150 182,146 178,144 C168,148 158,150 152,156 C148,170 146,190 145,206 Z" fill={C.hair} {...line}/>
    <path d="M168,92 C188,78 214,75 238,81 C220,83 196,86 174,98 Z M250,82 C266,87 280,99 286,114 C276,106 263,98 249,92 Z M144,124 C148,113 157,105 168,101 C160,110 154,118 150,128 Z" fill={C.hairHi}/>
    <path d="M178,144 C192,130 212,120 236,118 M208,154 C224,142 244,138 262,142 M240,162 C252,154 264,152 276,156" fill="none" stroke={C.ink} strokeWidth="2.6" strokeLinecap="round"/>
</>;
