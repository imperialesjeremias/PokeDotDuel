# Pokemon Font Setup Guide

## Step 1: Download the Font Files

1. Visit: https://www.dafont.com/es/pokemon.font?text=PoK%E9DueL
2. Click the "Download" button
3. Extract the ZIP file to get these font files:
   - `Pokemon Solid.ttf`
   - `Pokemon Hollow.ttf`

## Step 2: Add Font Files to Your Project

1. Copy both `.ttf` files to: `apps/web/public/fonts/`
   - `apps/web/public/fonts/Pokemon Solid.ttf`
   - `apps/web/public/fonts/Pokemon Hollow.ttf`

## Step 3: Font Configuration (Already Done)

✅ Font faces have been added to `globals.css`
✅ Tailwind font families have been configured

## Step 4: Usage Examples

### Using Tailwind Classes:
```jsx
// Pokemon Solid font
<h1 className="font-pokemon-solid text-4xl">PokeDuel</h1>

// Pokemon Hollow font
<h1 className="font-pokemon-hollow text-4xl">PokeDuel</h1>
```

### Using CSS Classes:
```css
.pokemon-title {
  font-family: 'Pokemon Solid', monospace;
}

.pokemon-outline {
  font-family: 'Pokemon Hollow', monospace;
}
```

### Direct CSS Style:
```jsx
<h1 style={{ fontFamily: 'Pokemon Solid' }}>PokeDuel</h1>
```

## Step 5: Replace Current Headings

To use Pokemon font for main headings, you can:

1. **Option A**: Update specific components
```jsx
<h1 className="font-pokemon-solid text-4xl text-orange-600">
  PokeDuel
</h1>
```

2. **Option B**: Update the global heading styles in `globals.css`
```css
h1, h2, h3, h4, h5, h6 {
  font-family: 'Pokemon Solid', monospace;
}
```

## Font Variants:

- **Pokemon Solid**: Filled letters, great for main titles
- **Pokemon Hollow**: Outlined letters, great for subtitles or special effects

## Notes:

- Font files must be placed in the `public/fonts/` directory
- The fonts will be loaded automatically when used
- Both fonts work well with the existing orange color scheme
- Consider using Pokemon Solid for main headings and Pokemon Hollow for decorative text