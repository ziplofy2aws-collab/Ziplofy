/** Shopify Dawn / Horizon accordion row icon presets (collapsible tab icons). */
export const FAQ_ACCORDION_ROW_ICON_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'apple', label: 'Apple' },
  { value: 'arrow', label: 'Arrow' },
  { value: 'banana', label: 'Banana' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'box', label: 'Box' },
  { value: 'carrot', label: 'Carrot' },
  { value: 'chat_bubble', label: 'Chat bubble' },
  { value: 'check_mark', label: 'Check box' },
  { value: 'clipboard', label: 'Clipboard' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'dairy_free', label: 'Dairy free' },
  { value: 'dryer', label: 'Dryer' },
  { value: 'eye', label: 'Eye' },
  { value: 'fire', label: 'Fire' },
  { value: 'gluten_free', label: 'Gluten free' },
  { value: 'heart', label: 'Heart' },
  { value: 'iron', label: 'Iron' },
  { value: 'leaf', label: 'Leaf' },
  { value: 'leather', label: 'Leather' },
  { value: 'lightning_bolt', label: 'Lightning bolt' },
  { value: 'lipstick', label: 'Lipstick' },
  { value: 'lock', label: 'Lock' },
  { value: 'map_pin', label: 'Map pin' },
  { value: 'nut_free', label: 'Nut free' },
  { value: 'pants', label: 'Pants' },
  { value: 'paw_print', label: 'Paw print' },
  { value: 'pepper', label: 'Pepper' },
  { value: 'perfume', label: 'Perfume' },
  { value: 'plane', label: 'Plane' },
  { value: 'plant', label: 'Plant' },
  { value: 'price_tag', label: 'Price tag' },
  { value: 'question_mark', label: 'Question mark' },
  { value: 'recycle', label: 'Recycle' },
  { value: 'return', label: 'Return' },
  { value: 'ruler', label: 'Ruler' },
  { value: 'serving_dish', label: 'Serving dish' },
  { value: 'shirt', label: 'Shirt' },
  { value: 'shoe', label: 'Shoe' },
  { value: 'silhouette', label: 'Silhouette' },
  { value: 'snowflake', label: 'Snowflake' },
  { value: 'star', label: 'Star' },
  { value: 'stopwatch', label: 'Stopwatch' },
  { value: 'truck', label: 'Truck' },
  { value: 'washing', label: 'Washing' },
] as const;

const DAWN_ICON_ASSET_BASE = 'https://cdn.jsdelivr.net/gh/Shopify/dawn@main/assets';

export function faqAccordionRowIconAssetUrl(icon: string): string | null {
  if (!icon || icon === 'none') return null;
  const file = icon.replace(/_/g, '-');
  return `${DAWN_ICON_ASSET_BASE}/icon-${file}.svg`;
}
