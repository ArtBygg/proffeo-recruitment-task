#### File structure

Basically our main input of all the styles is styles.css - inside this file we are importing, anything that our app uses.

Then we have styless/utilities.css - which is for basically utilities classes/default styling of elements.

And that's it.

### Colors

There are 4 main colors used within our frontend, frontend is intended to use 60/30/10 rule, basically it means that the colors should be spread based on this rule so:

- 60% - primary (bg-primary)
- 30% - secondary (bg-secondary)
- 10% - accent (bg-accent)

Colors are defined inside the styles.css, alongside other tailwind config.

**FONT COLOR IS DEFAULT APP-WIDE!**

For the fonts (app-wide) - we should use "color-font". (We can of course modify the opacity of the text if needed).

Additionally we have some utility colors intended to use within those utilities, such as error messages, success messages, warning, info's, etc.

```
--color-error: #cc2727;
--color-warning: #D97706;
--color-success: #15803D;
--color-info: #1D4ED8;
```

Example usage :

`<p class="text-error">Example</p>`

### Breakpoints

In app we have also "custom" breakpoints available, those are not really custom because material-design uses these values, that's why we dont stick to default TW (to be in comply with Angular Material).

```
sm: 600px;  md: 960px;  lg: 1280px;  xl: 1440px;  2xl: 1920px;
```

### Content-Width

We also have custom class for our "content-width", content width is there to make sure, that our content wont extend further that needed, it is very useful in case someone uses for example tv, or 4k display.

This class is:

```
max-w-content
```

And has default value of 1536 px (this value is somehow field-tested).

### Mat-Icon

Material introduced new type of "icons" called "symbols", i applied some custom styles to .mat-icon because i want it to be somewhat consistent.

We can use mat-icon out of the box like this:

```
<mat-icon fontIcon="favorite"></mat-icon>
```

But in case we need the icon to be filled we need to use special class on it called "material-symbols-filled":

```
<mat-icon fontIcon="favorite" class="material-symbols-filled"></mat-icon>
```

Default mat-icon config, has some size, and color, but if we want to change that we can very easily using tailwind classes and "!" important rule with help of mat-icon size utility classess:

Utility classess are:

```
icon-xs
icon-sm
icon-md
icon-base
icon-lg
icon-xl
```

That's how we can change icon color and size:

```
<mat-icon fontIcon="add" class="text-white! icon-sm">
```

### Hover Guide

In terms of hover, i would suggest going always with one of these (cursor-pointer ofc. always):

- hover:opacity-70
- hover:bg-secondary/5 (if elemenet is white/gray)
- hover:ring-1 hover:ring-secondary/20

**==AND ALWAYS REMEMBER TO ADD `cursor-pointer`!==**

### Utility classes:

- .border-default - it applies some default border rules, which are very common thorough the app:

##### Work in progress within utility classess (add here also border-active, etc.)

# Dark Mode

Currently we don't have any dark mode, but it's development can be moved further into future.

Its simple, we just need to add "dark" class to our root html element, and then all the html elements with class "dark:\*" will use this dark styling instead of regular one.

We can do this very easily, if we will stick to what i prepared (utility classes) extend them and use further and further.

# Disclaimer

##### This is just basic setup, created by me - if u have any questions feel free to ask me, we should basically adjust it freely, to our needings, we should also consider expanding it in direction that we consider good for the project.
