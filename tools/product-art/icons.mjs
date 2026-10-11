// Original vector icons (200x200 viewBox). Hand-built for DANI seasonal merchandise; no third-party artwork.
// Each icon takes a palette p = {ink, a1, a2, a3, cream} and returns SVG fragment markup.
export const icons = {
  pumpkin: p => `
    <path d="M100 58 C70 36 18 52 18 112 C18 160 56 184 100 184 C144 184 182 160 182 112 C182 52 130 36 100 58Z" fill="${p.a1}" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M100 60 C84 84 84 160 100 182 M100 60 C116 84 116 160 100 182" fill="none" stroke="${p.ink}" stroke-width="5" opacity=".55"/>
    <path d="M62 66 C40 96 40 148 66 176 M138 66 C160 96 160 148 134 176" fill="none" stroke="${p.ink}" stroke-width="5" opacity=".4"/>
    <path d="M92 60 C94 40 100 28 112 22 L120 32 C110 38 108 48 110 62Z" fill="${p.a3}" stroke="${p.ink}" stroke-width="6" stroke-linejoin="round"/>`,
  ghost: p => `
    <path d="M36 176 L36 88 C36 44 68 20 100 20 C132 20 164 44 164 88 L164 176 L144 158 L122 178 L100 158 L78 178 L56 158Z" fill="${p.cream}" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round"/>
    <ellipse cx="78" cy="88" rx="9" ry="13" fill="${p.ink}"/><ellipse cx="122" cy="88" rx="9" ry="13" fill="${p.ink}"/>
    <path d="M86 118 Q100 134 114 118" fill="none" stroke="${p.ink}" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="64" cy="112" rx="9" ry="6" fill="${p.a1}" opacity=".5"/><ellipse cx="136" cy="112" rx="9" ry="6" fill="${p.a1}" opacity=".5"/>`,
  leaf: p => `
    <path d="M100 18 C132 44 176 52 168 98 C176 116 150 130 148 146 C128 140 112 150 106 170 L106 188 L94 188 L94 170 C88 150 72 140 52 146 C50 130 24 116 32 98 C24 52 68 44 100 18Z" fill="${p.a1}" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M100 40 L100 176 M100 84 L70 62 M100 84 L130 62 M100 116 L66 98 M100 116 L134 98" fill="none" stroke="${p.ink}" stroke-width="5" stroke-linecap="round" opacity=".6"/>`,
  house: p => `
    <path d="M24 98 L100 30 L176 98" fill="none" stroke="${p.ink}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M40 90 L40 172 L160 172 L160 90 L100 40Z" fill="${p.cream}" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round"/>
    <rect x="136" y="38" width="16" height="32" fill="${p.a2}" stroke="${p.ink}" stroke-width="6"/>
    <rect x="82" y="116" width="36" height="56" rx="5" fill="${p.a1}" stroke="${p.ink}" stroke-width="6"/>
    <circle cx="110" cy="146" r="3.5" fill="${p.ink}"/>
    <rect x="52" y="104" width="22" height="22" fill="${p.a3}" stroke="${p.ink}" stroke-width="5"/>
    <rect x="126" y="104" width="22" height="22" fill="${p.a3}" stroke="${p.ink}" stroke-width="5"/>`,
  stamp: p => `
    <rect x="62" y="22" width="76" height="22" rx="10" fill="${p.a2}" stroke="${p.ink}" stroke-width="6"/>
    <path d="M78 44 L78 98 L122 98 L122 44" fill="${p.a1}" stroke="${p.ink}" stroke-width="6" stroke-linejoin="round"/>
    <rect x="38" y="98" width="124" height="30" rx="8" fill="${p.a2}" stroke="${p.ink}" stroke-width="6"/>
    <circle cx="100" cy="158" r="36" fill="${p.cream}" stroke="${p.ink}" stroke-width="6"/>
    <circle cx="100" cy="158" r="26" fill="none" stroke="${p.ink}" stroke-width="3" stroke-dasharray="4 4"/>
    <path d="M100 140 L106 154 L121 154 L109 163 L113 177 L100 169 L87 177 L91 163 L79 154 L94 154Z" fill="${p.a1}" stroke="${p.ink}" stroke-width="3" stroke-linejoin="round"/>`,
  broom: p => `
    <rect x="94" y="8" width="12" height="104" rx="6" fill="${p.a3}" stroke="${p.ink}" stroke-width="6" transform="rotate(14 100 60)"/>
    <path d="M56 118 L144 118 L168 188 L32 188Z" fill="${p.a2}" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round" transform="rotate(14 100 150)"/>
    <path d="M70 128 L58 186 M88 128 L84 186 M106 128 L108 186 M124 128 L134 186" stroke="${p.ink}" stroke-width="4" opacity=".6" transform="rotate(14 100 150)"/>
    <rect x="52" y="108" width="96" height="14" rx="5" fill="${p.a1}" stroke="${p.ink}" stroke-width="6" transform="rotate(14 100 115)"/>`,
  spray: p => `
    <path d="M70 80 L70 176 Q70 186 80 186 L124 186 Q134 186 134 176 L134 80Z" fill="${p.cream}" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round"/>
    <rect x="76" y="110" width="52" height="44" rx="6" fill="${p.a1}" stroke="${p.ink}" stroke-width="5"/>
    <path d="M78 80 L78 58 L112 58 L112 80" fill="${p.a2}" stroke="${p.ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M112 62 L148 54 L150 40 L108 44" fill="${p.a2}" stroke="${p.ink}" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="164" cy="34" r="7" fill="none" stroke="${p.ink}" stroke-width="4"/><circle cx="178" cy="54" r="5" fill="none" stroke="${p.ink}" stroke-width="4"/><circle cx="166" cy="70" r="4" fill="none" stroke="${p.ink}" stroke-width="4"/>`,
  van: p => `
    <path d="M14 150 L14 84 Q14 72 28 72 L120 72 L120 150Z" fill="${p.cream}" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M120 96 L156 96 L186 128 L186 150 L120 150Z" fill="${p.a1}" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M132 106 L152 106 L172 128 L132 128Z" fill="${p.cream}" stroke="${p.ink}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="52" cy="156" r="20" fill="${p.ink}"/><circle cx="52" cy="156" r="8" fill="${p.cream}"/>
    <circle cx="154" cy="156" r="20" fill="${p.ink}"/><circle cx="154" cy="156" r="8" fill="${p.cream}"/>
    <rect x="34" y="92" width="62" height="34" rx="5" fill="${p.a2}" stroke="${p.ink}" stroke-width="5"/>
`,
  box: p => `
    <path d="M100 30 L172 62 L172 140 L100 172 L28 140 L28 62Z" fill="${p.a3}" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M28 62 L100 94 L172 62 M100 94 L100 172" fill="none" stroke="${p.ink}" stroke-width="6" stroke-linejoin="round"/>
    <path d="M64 46 L136 78 L136 100" fill="none" stroke="${p.cream}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/>`,
  mug: p => `
    <path d="M40 66 L40 150 Q40 176 66 176 L114 176 Q140 176 140 150 L140 66Z" fill="${p.cream}" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M140 84 Q184 84 184 118 Q184 150 140 150" fill="none" stroke="${p.ink}" stroke-width="9" stroke-linecap="round"/>
    <rect x="52" y="96" width="76" height="34" rx="6" fill="${p.a1}" opacity=".9"/>
    <path d="M66 50 Q58 38 70 28 Q78 20 70 8 M92 50 Q84 38 96 28 Q104 20 96 8 M118 50 Q110 38 122 28 Q130 20 122 8" fill="none" stroke="${p.ink}" stroke-width="6" stroke-linecap="round"/>`,
  envelope: p => `
    <rect x="22" y="48" width="156" height="110" rx="10" fill="${p.cream}" stroke="${p.ink}" stroke-width="7"/>
    <path d="M26 56 L100 118 L174 56" fill="none" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="160" cy="48" r="22" fill="${p.a1}" stroke="${p.ink}" stroke-width="6"/>
    <path d="M160 36 L160 52 M160 60 L160 62" stroke="${p.cream}" stroke-width="7" stroke-linecap="round"/>`,
  bat: p => `
    <path d="M100 56 C92 36 70 34 46 44 C58 52 56 62 40 66 C60 78 54 90 38 98 C70 94 84 104 100 130 C116 104 130 94 162 98 C146 90 140 78 160 66 C144 62 142 52 154 44 C130 34 108 36 100 56Z" fill="${p.ink}" stroke="${p.ink}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="90" cy="68" r="4" fill="${p.a1}"/><circle cx="110" cy="68" r="4" fill="${p.a1}"/>`,
  key: p => `
    <circle cx="62" cy="76" r="40" fill="${p.a2}" stroke="${p.ink}" stroke-width="8"/>
    <circle cx="62" cy="76" r="14" fill="${p.cream}" stroke="${p.ink}" stroke-width="6"/>
    <path d="M92 104 L172 168 M146 148 L158 134 M160 160 L172 146" fill="none" stroke="${p.ink}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M92 104 L172 168" fill="none" stroke="${p.a2}" stroke-width="5" stroke-linecap="round"/>`,
  tag: p => `
    <path d="M24 92 L98 18 L178 18 L178 98 L104 172 Z" fill="${p.a1}" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round" transform="rotate(0)"/>
    <circle cx="144" cy="52" r="12" fill="${p.cream}" stroke="${p.ink}" stroke-width="5"/>
    <text x="108" y="108" font-family="Alfa Slab One" font-size="36" fill="${p.cream}" text-anchor="middle">SOLD</text>`,
  candycane: p => `
    <path d="M70 186 L70 60 C70 18 142 18 142 62" fill="none" stroke="${p.ink}" stroke-width="40" stroke-linecap="round"/>
    <path d="M70 186 L70 60 C70 18 142 18 142 62" fill="none" stroke="${p.cream}" stroke-width="28" stroke-linecap="round"/>
    <path d="M70 186 L70 60 C70 18 142 18 142 62" fill="none" stroke="${p.a1}" stroke-width="28" stroke-linecap="butt" stroke-dasharray="14 18"/>`,
  ornament: p => `
    <rect x="86" y="14" width="28" height="22" rx="4" fill="${p.a3}" stroke="${p.ink}" stroke-width="6"/>
    <circle cx="100" cy="112" r="68" fill="${p.a1}" stroke="${p.ink}" stroke-width="7"/>
    <path d="M44 96 Q100 132 156 96 M40 126 Q100 164 160 126" fill="none" stroke="${p.a3}" stroke-width="8"/>
    <ellipse cx="74" cy="82" rx="12" ry="20" fill="${p.cream}" opacity=".55" transform="rotate(25 74 82)"/>`,
  bow: p => `
    <path d="M100 100 C70 52 20 56 24 100 C26 140 70 140 100 100Z" fill="${p.a1}" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M100 100 C130 52 180 56 176 100 C174 140 130 140 100 100Z" fill="${p.a1}" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round"/>
    <path d="M96 112 L58 178 L86 168 L100 190 L106 124Z M104 112 L142 178 L114 168 L100 190" fill="${p.a1}" stroke="${p.ink}" stroke-width="6" stroke-linejoin="round"/>
    <circle cx="100" cy="102" r="14" fill="${p.a3}" stroke="${p.ink}" stroke-width="6"/>`,
  santahat: p => `
    <path d="M30 140 C34 60 100 14 150 40 C168 50 172 70 166 86 C176 110 176 126 172 140Z" fill="${p.a1}" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round"/>
    <rect x="22" y="132" width="156" height="36" rx="18" fill="${p.cream}" stroke="${p.ink}" stroke-width="7"/>
    <circle cx="164" cy="82" r="20" fill="${p.cream}" stroke="${p.ink}" stroke-width="7"/>`,
  star: p => `<path d="M100 14 L121 72 L184 76 L135 116 L152 178 L100 143 L48 178 L65 116 L16 76 L79 72Z" fill="${p.a3}" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round"/>`,
  sparkle: p => `<path d="M100 10 C104 70 130 96 190 100 C130 104 104 130 100 190 C96 130 70 104 10 100 C70 96 96 70 100 10Z" fill="${p.a3}" stroke="${p.ink}" stroke-width="6" stroke-linejoin="round"/>`,
  moon: p => `<path d="M128 22 C80 22 40 58 40 106 C40 154 80 188 128 186 C96 168 86 140 90 108 C94 76 108 44 128 22Z" fill="${p.a3}" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round"/>`,
  tree: p => `
    <path d="M100 14 L148 80 L124 80 L162 130 L130 130 L176 178 L24 178 L70 130 L38 130 L76 80 L52 80Z" fill="${p.a2}" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round"/>
    <rect x="88" y="178" width="24" height="18" fill="${p.a3}" stroke="${p.ink}" stroke-width="6"/>
    <circle cx="86" cy="104" r="7" fill="${p.a1}"/><circle cx="120" cy="150" r="7" fill="${p.a1}"/><circle cx="76" cy="156" r="7" fill="${p.a3}"/>`,
};
