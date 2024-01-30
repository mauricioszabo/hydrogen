# Style Customization

By default Hydron leans towards plain styling so that its elements can be customized easily to your liking.

Below are some tips to get started with styling Hydron. If you are unfamiliar with this topic there is more detailed information available in the [Atom Flight Manual](http://flight-manual.atom.io/using-atom/sections/basic-customization/#style-tweaks).

Start out by opening your styles.less file or searching your command palette for "stylesheet", you will see atom's: **Application: Open Your Stylesheet** command.

To follow these examples make sure you have theme variables imported by putting this at the top of your styles.less file.

```less
@import "ui-variables";
@import "syntax-variables";
```

In the example below there are color variables like `@my-color-variable` used. Of course, you can change these as desired.

## Style Examples

### Multiline Result View

Change the result view background color for multi-line output:

In your styles.less:

```less
.hydron {
  .multiline-container {
    .hydron_cell_display {
      background-color: @background-color-highlight;
    }
  }
}
```

Depending on your active theme, this will look like:

![](https://cloud.githubusercontent.com/assets/10860657/26287949/52c75e9c-3e4b-11e7-929b-b155434927b3.png)

Change the icon color when you hover over the toolbar icons:

```less
.hydron {
  .multiline-container {
    .toolbar .icon:hover {
      background-color: @background-color-selected;
    }
  }
}
```

![](https://cloud.githubusercontent.com/assets/10860657/26086644/8dbfd806-39b1-11e7-9149-e4d891d0455b.gif)

### Importing Hydron Style Variables

If you want to use Hydron's style variables you can do so by adding this to your styles.less:

```less
@import "./packages/Hydron/styles/hydron.less";
```

Once you've done this you will have access to any style variables within the Hydron package:

```less
@hydron-light-background @hydron-dark-background
@hydron-inline-background
@hydron-inline-color
@hydron-error-color;
```

Currently these are just colors, but check back in the future to see if we have added some more useful style variables!
