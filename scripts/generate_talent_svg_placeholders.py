#!/usr/bin/env python3
"""
Generate SVG placeholder icons for talents.
These provide immediate visual feedback while Gemini-generated assets load.
"""

import os
from pathlib import Path

OUTPUT_DIR = Path("public/assets/talents")

# SVG template with class-specific colors
SVG_TEMPLATE = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="bg_{id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:{color1}"/>
      <stop offset="100%" style="stop-color:{color2}"/>
    </linearGradient>
    <filter id="glow_{id}">
      <feGaussianBlur stdDeviation="2" result="glow"/>
      <feMerge>
        <feMergeNode in="glow"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect x="4" y="4" width="56" height="56" rx="8" fill="url(#bg_{id})" opacity="0.3"/>

  <!-- Border -->
  <rect x="4" y="4" width="56" height="56" rx="8" fill="none" stroke="{color1}" stroke-width="2"/>

  <!-- Icon -->
  <text x="32" y="40" text-anchor="middle" font-size="28" filter="url(#glow_{id})">{icon}</text>

  <!-- Corner accents -->
  <circle cx="8" cy="8" r="3" fill="{color1}" opacity="0.6"/>
  <circle cx="56" cy="8" r="3" fill="{color1}" opacity="0.6"/>
  <circle cx="8" cy="56" r="3" fill="{color1}" opacity="0.6"/>
  <circle cx="56" cy="56" r="3" fill="{color1}" opacity="0.6"/>
</svg>"""

# Class colors and their talents with emoji icons
TALENTS = {
    "mage": {
        "colors": ("#a855f7", "#6b21a8"),  # Purple
        "talents": {
            "arcane_intellect": "🧠",
            "quick_casting": "⚡",
            "spell_focus": "🎯",
            "pyroblast": "🔥",
            "arcane_missiles": "✨",
            "frost_nova": "❄️",
            "presence_of_mind": "💭",
            "arcane_power": "💫",
            "ice_barrier": "🛡️",
            "combustion": "🌋",
            "evocation": "🌀",
            "deep_freeze": "🧊",
            "time_warp": "⏰",
        }
    },
    "guardian": {
        "colors": ("#fbbf24", "#b45309"),  # Gold
        "talents": {
            "divine_shield": "🛡️",
            "vigilance": "👁️",
            "code_armor": "⚔️",
            "consecration": "✝️",
            "blessing_protection": "🙏",
            "righteous_fury": "😤",
            "lay_on_hands": "🤲",
            "aura_devotion": "💛",
            "holy_wrath": "⚡",
            "guardian_spirit": "👼",
            "last_stand": "💪",
            "shield_wall": "🏰",
            "divine_intervention": "🌟",
        }
    },
    "architect": {
        "colors": ("#06b6d4", "#0e7490"),  # Cyan
        "talents": {
            "systems_thinking": "🔗",
            "pattern_recognition": "🔍",
            "structural_analysis": "📐",
            "modular_design": "🧩",
            "dependency_injection": "💉",
            "event_driven": "📡",
            "big_picture": "🦅",
            "scalable_architecture": "📈",
            "load_balancing": "⚖️",
            "microservices": "🌐",
            "caching_mastery": "💾",
            "distributed_systems": "🌍",
            "grand_architect": "👁️‍🗨️",
        }
    },
    "scout": {
        "colors": ("#22c55e", "#15803d"),  # Green
        "talents": {
            "swift_reading": "📖",
            "keen_eye": "👁️",
            "light_footed": "👟",
            "tracking": "🐾",
            "camouflage": "🌿",
            "mark_target": "🎯",
            "rapid_assessment": "⚡",
            "evasion": "💨",
            "critical_strike": "🗡️",
            "shadow_step": "👤",
            "hunters_mark": "🐺",
            "killing_blow": "💀",
            "master_scout": "🏹",
        }
    },
    "artisan": {
        "colors": ("#f97316", "#c2410c"),  # Orange
        "talents": {
            "craftsmanship": "🔨",
            "efficiency": "⚙️",
            "resourcefulness": "♻️",
            "enchanting": "✨",
            "mass_production": "🏭",
            "salvaging": "🔧",
            "masterwork": "💎",
            "assembly_line": "🏭",
            "transmutation": "🔮",
            "legendary_craft": "⚔️",
            "automation": "🤖",
            "philosophers_stone": "🔴",
            "grand_master": "👑",
        }
    }
}


def generate_svg(class_name: str, talent_id: str, icon: str, colors: tuple):
    """Generate an SVG icon for a talent"""
    color1, color2 = colors
    svg_id = f"{class_name}_{talent_id}"

    return SVG_TEMPLATE.format(
        id=svg_id,
        color1=color1,
        color2=color2,
        icon=icon
    )


def main():
    print("Generating SVG talent placeholders...")

    for class_name, class_data in TALENTS.items():
        class_dir = OUTPUT_DIR / class_name
        class_dir.mkdir(parents=True, exist_ok=True)

        colors = class_data["colors"]
        print(f"\n[{class_name.upper()}]")

        for talent_id, icon in class_data["talents"].items():
            svg_content = generate_svg(class_name, talent_id, icon, colors)
            output_path = class_dir / f"{talent_id}.svg"

            with open(output_path, "w") as f:
                f.write(svg_content)

            print(f"  Created: {talent_id}.svg")

    print("\n✓ SVG talent placeholders generated!")
    print(f"  Output: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
