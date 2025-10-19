# UI Alignment Examples for Nebula Notes

## 1. Header Navigation Buttons

```jsx
// Current working example from your header
<div className="flex gap-4">
  {" "}
  {/* gap-4 adds consistent spacing */}
  <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
    🏠 Home
  </button>
  <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all">
    ✍️ New Entry
  </button>
  <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
    🌌 Ask Cosmos
  </button>
</div>
```

## 2. Entry Row Alignment (Fixed)

```jsx
// Before (misaligned)
<div className="flex justify-between items-start mb-2">
  <p>Timestamp</p>
  <button>×</button>
</div>

// After (properly aligned)
<div className="flex justify-between items-center mb-2">
  <p>Timestamp</p>
  <button>×</button>
</div>
```

## 3. Button Alignment Patterns

### Centered Buttons

```jsx
<div className="flex justify-center gap-4">
  <button>Button 1</button>
  <button>Button 2</button>
</div>
```

### Right-Aligned Buttons

```jsx
<div className="flex justify-end gap-4">
  <button>Button 1</button>
  <button>Button 2</button>
</div>
```

### Space Between Buttons

```jsx
<div className="flex justify-between">
  <button>Left Button</button>
  <button>Right Button</button>
</div>
```

### Vertical Button Stack

```jsx
<div className="flex flex-col gap-2">
  <button>Button 1</button>
  <button>Button 2</button>
</div>
```

## 4. Grid Layout for Complex Alignments

```jsx
// 3-column grid with equal spacing
<div className="grid grid-cols-3 gap-4">
  <button>Column 1</button>
  <button>Column 2</button>
  <button>Column 3</button>
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <button>Responsive Button</button>
</div>
```

## 5. Tailwind CSS Alignment Classes

### Flexbox

- `flex` - display: flex
- `flex-col` - flex-direction: column
- `flex-row` - flex-direction: row
- `justify-start` - justify-content: flex-start
- `justify-center` - justify-content: center
- `justify-end` - justify-content: flex-end
- `justify-between` - justify-content: space-between
- `justify-around` - justify-content: space-around
- `items-start` - align-items: flex-start
- `items-center` - align-items: center
- `items-end` - align-items: flex-end

### Spacing

- `gap-1` through `gap-8` - gap between items
- `space-x-*` - horizontal spacing between children
- `space-y-*` - vertical spacing between children

### Positioning

- `relative` - position: relative
- `absolute` - position: absolute
- `fixed` - position: fixed
- `top-*`, `bottom-*`, `left-*`, `right-*` - positioning

## 6. Common Alignment Issues & Solutions

### Issue: Buttons not aligned with text

```jsx
// Bad
<div className="flex items-start">
  <p>Long text content that wraps to multiple lines</p>
  <button>Action</button>
</div>

// Good
<div className="flex items-center">
  <p>Long text content that wraps to multiple lines</p>
  <button>Action</button>
</div>
```

### Issue: Inconsistent button heights

```jsx
// Bad
<button className="px-4 py-2">Short</button>
<button className="px-4 py-3">Taller</button>

// Good
<button className="px-4 py-2 h-10">Consistent Height</button>
<button className="px-4 py-2 h-10">Consistent Height</button>
```

### Issue: Buttons too close together

```jsx
// Bad
<div className="flex">
  <button>Button 1</button>
  <button>Button 2</button>
</div>

// Good
<div className="flex gap-4">
  <button>Button 1</button>
  <button>Button 2</button>
</div>
```

## 7. Responsive Alignment

```jsx
// Mobile: stacked, Desktop: side by side
<div className="flex flex-col md:flex-row gap-4 md:gap-6">
  <button>Responsive Button</button>
  <button>Responsive Button</button>
</div>

// Mobile: center, Desktop: left align
<div className="flex justify-center md:justify-start">
  <button>Responsive Button</button>
</div>
```
