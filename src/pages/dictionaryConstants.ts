import {
  Apple,
  Baby,
  Bird,
  Bone,
  Bug,
  Bus,
  Carrot,
  Cat,
  Cherry,
  Drumstick,
  Egg,
  Fish,
  FishingHook,
  Flower2,
  GraduationCap,
  Guitar,
  Hand,
  HatGlasses,
  Lamp,
  Pencil,
  Shapes,
  Shirt,
  Sofa,
  SportShoe,
  TreePine,
  UtensilsCrossed,
  Volleyball,
} from 'lucide-react'
import { createElement } from 'react'

import type { VerbalOperant, WordDifficulty } from '../types'

function icon(component: React.ElementType) {
  return createElement(component, { 'size': 20, 'aria-hidden': 'true' })
}

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'toys': icon(Baby),
  'shapes': icon(Shapes),
  'fruits': icon(Apple),
  'body-parts': icon(Hand),
  'domestic-animals': icon(Cat),
  'vegetables': icon(Carrot),
  'forest-animals': icon(TreePine),
  'clothing': icon(Shirt),
  'footwear': icon(SportShoe),
  'furniture': icon(Sofa),
  'dishes': icon(UtensilsCrossed),
  'food': icon(Drumstick),
  'transport': icon(Bus),
  'school-supplies': icon(Pencil),
  'appliances': icon(Lamp),
  'sports-equipment': icon(Volleyball),
  'berries': icon(Cherry),
  'domestic-birds': icon(Egg),
  'wild-birds': icon(Bird),
  'fish': icon(FishingHook),
  'trees-flowers': icon(Flower2),
  'headwear': icon(HatGlasses),
  'professions': icon(GraduationCap),
  'musical-instruments': icon(Guitar),
  'insects': icon(Bug),
  'sea-creatures': icon(Fish),
  'dinosaurs': icon(Bone),
}

export const DIFFICULTIES: WordDifficulty[] = ['simple', 'medium', 'complex']

export const DIFFICULTY_KEYS: Record<
  WordDifficulty,
  'difficultySimple' | 'difficultyMedium' | 'difficultyComplex'
> = {
  simple: 'difficultySimple',
  medium: 'difficultyMedium',
  complex: 'difficultyComplex',
}

export const OPERANT_LABEL_KEYS: Record<
  VerbalOperant,
  'operantMand' | 'operantTact' | 'operantListener' | 'operantEchoic'
> = {
  mand: 'operantMand',
  tact: 'operantTact',
  listenerResponding: 'operantListener',
  echoic: 'operantEchoic',
}
