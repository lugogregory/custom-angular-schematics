import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
export function ngAdd(): Rule {
  // Add an import `CustomSchematicModule` from `custom-angular-schematic-lib` to the root of the user's project.
  // return addRootImport(
  //   options.project,
  //   ({code, external}) => code`${external('CustomSchematicModule', 'custom-angular-schematic-lib')}`,
  // );
  return (tree: Tree, _context: SchematicContext) => {
    // Here you add logic like modifying angular.json, package.json, etc.
    _context.logger.info('Installing @custom-angular-schematic-lib...');
    return tree;
  };
}
