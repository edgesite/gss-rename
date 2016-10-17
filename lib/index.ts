const css = require('css');

const CLASS_REGEXP = /\.([\w][\w\d-_]+)/;

export class GssRename {
  private counter = 0;
  private charactersLen: number;
  constructor(private characters: string,
              public namePartRegistry = {}) {
    this.charactersLen = characters.length;
  }
  getUniqueName() {
    const name = [];
    let n = this.counter++;
    while (1) {
      name.push(this.characters[n % this.charactersLen]);
      n = Math.floor(n / this.charactersLen);
      if (n == 0) break;
    }
    return name.reverse();
  }
  getCssName(cssName) {
    return cssName.split('-').map(name => {
      let alias = this.namePartRegistry[name];
      if (!alias) {
        this.namePartRegistry[name] = alias = this.getUniqueName();
      }
      return alias;
    }).concat('-');
  }
  feed(stylesheet: string): string {
    const ast = css.parse(stylesheet, {});
    for (let rule of ast.stylesheet.rules) {
      rule.selectors = rule.selectors.map(selector =>
        selector.replace(CLASS_REGEXP, (_, className) => {
          return '.' + className
            .split('-')
            .map(part => {
              let alias = this.namePartRegistry[part];
              if (!alias) {
                this.namePartRegistry[part] = alias = this.getUniqueName();
              }
              return alias;
            })
            .join('-');
        }));
    }
    return css.stringify(ast, { compress: true });
  }
}
