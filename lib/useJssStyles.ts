import jss, { Classes, Styles } from 'jss'
import jssPreset from 'jss-preset-default'

const attachedStylesheets = new Map<string,any>();

/// Initialize the JSS library. Should be called once during startup, and never again.
export function initJss() {
  jss.setup(jssPreset());
}

let extractingStyles = false;
class ThrownStyles {
  constructor(name: string, getStyles: ()=>any) {
    this.name = name;
    this.getStyles = getStyles;
  }
  name: string
  getStyles: ()=>any
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
export function useJssStyles<T extends string>(name: string, getStyles: ()=>Styles<T>): Classes<T> {
  if (extractingStyles) {
    throw new ThrownStyles(name, getStyles);
  }
  
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

/// Given a function which maybe calls useJssStyles as the first thing it does,
/// return the arguments that will be given to that call to useJssStyles. Works
/// by setting a flag to make useJssStlyes throw a special exception, and
/// catching it. If the function returns normally, or throws the wrong kind of
/// exception, returns null. Used for static-stylesheet generation. Very
/// hackish, sorry.
///
/// Assumes that the call to useJssStyles is *first* (before any other hooks)
/// so that the function won't have a chance to notice that it has received
/// entirely the wrong props, or to do side effects.
export function getStylesFrom(component: any): {name:string, styles:string}|null {
  extractingStyles = true;
  
  try {
    const body = component.toString();
    if (body.indexOf(useJssStyles.name)===-1) {
      return null;
    }
    component({});
    return null;
  } catch(e) {
    if (e instanceof ThrownStyles) {
      const {name,getStyles} = e;
      const stylesheet = jss.createStyleSheet(getStyles(), {
        generateId: (rule: any) => {
          return `${name}-${rule.key}`;
        }
      })
      const css = stylesheet.toString();
      return {name,styles:css};
    } else {
      return null;
    }
  } finally {
    extractingStyles = false;
  }
}
