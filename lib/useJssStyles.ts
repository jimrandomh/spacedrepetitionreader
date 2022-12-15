import React from 'react';
import jss from 'jss'
import jssPreset from 'jss-preset-default'

let attachedStylesheets = new Map<string,any>();

/// Initialize the JSS library. Should be called once during startup, and never again.
export function initJss() {
  jss.setup(jssPreset());
}

/// Attach JSS (CSS-in-JS) styles to the page. NOTE: there are two restrictions
/// on how this function should be used that are not convered by the linter.
/// First, `name` should be unique at each callsite (typically it's the name of
/// the component that's calling it). And second, `getStyles()` should be a
/// pure function, and should be the same pure function every time it's called
/// with that name (ie, it shouldn't capture any non-constant variables.)
///
/// Returns a record from JSS class names to CSS class names.
///
/// An idiomatic use of this looks something like:
///
/// function MyComponent() {
///   const classes = useJssStyles("MyComponent", () => ({
///     foo: {
///       fontSize: 10,
///     }
///   }));
///   return <div className={classes.foo}/>
/// }
export function useJssStyles(name: string, getStyles: ()=>any): any {
  if (attachedStylesheets.has(name)) {
    return attachedStylesheets.get(name);
  } else {
    const stylesheet = jss.createStyleSheet(getStyles(), {
      generateId: (rule) => {
        return `${name}-${rule.key}`;
      }
    })
    const {classes} = stylesheet.attach();
    attachedStylesheets.set(name, classes);
    return classes;
  }
}

