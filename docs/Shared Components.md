# Shared Components Guide

In this guide we will go through all shared components, which are ready for production-use, how they should be used, how to style them, etc.

### Button

Our first component is `<proffeo-button>`, it is fundamental within our app, and should be used always, when we need to add any button/cta.

Related types:

- MaterialSymbol - List of all symbols available for use within icons.

- ButtonType - Type of our button (styling)
  - primary - default type (white)
  - secondary - (secondary color scheme)
  - accent - (accent color scheme)

- IconSize - List of all possible Icon sizes
  - xs - 16px
  - sm - 18px
  - md - 20px
  - base - 24px
  - lg - 28px
  - xl - 32px

- IconType - Type of icon regarding "fill"
  - OUTLINED
  - FILLED

Inputs:

- type (ButtonType)
- cta (Boolean - Determines if button is Cta - small round button with just icon)
- disabled (Boolean - Determines if it should be disabled)
- fontIcon (MaterialSymbol) - Specifies which icon we use.
- iconType (IconType) - Filled/Outlined
- iconSize (IconSize) - Size of icon
- text (i18n string key) - specifies i18n key for translation of button text

##### Example usage:

```
<proffeo-button text="edit-user-title" [type]="ButtonType.ACCENT">
</proffeo-button>

<proffeo-button
  text="edit-user-title"
  fontIcon="add_circle"
  [type]="ButtonType.ACCENT"
  [disabled]="true"
></proffeo-button>


<proffeo-button fontIcon="add" [cta]="true" [type]="ButtonType.ACCENT">
</proffeo-button>
```
