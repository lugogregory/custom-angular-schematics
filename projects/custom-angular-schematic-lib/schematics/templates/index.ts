import { Path, normalize, strings } from '@angular-devkit/core';
import {
  DirEntry,
  MergeStrategy,
  Rule,
  SchematicContext,
  SchematicsException,
  Source,
  Tree,
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  url
} from '@angular-devkit/schematics';
import { TemplatesSchema } from './schema';
import { PATH_FEATURE, ROUTING_FILE_PATH } from './files/configuration_constants';


export function templateGenerator(options: TemplatesSchema): Rule {
  const patternPath =
    /^(?!.*[\\\/]\s+)(?!(?:.*\s|.*\.|\W+)$)(?:[a-zA-Z]:)?(?:(?:[^<>:"\|\?\*\n])+(?:\/\/|\/|\\\\|\\)?)+$/;

  const path: Path = normalize(`${options.path}`);

  if (path?.length > 0 && !patternPath.test(path)) {
    throw new SchematicsException(`El path ${options.path} no es válido.`);
  }

  if (!options.name || options.name.length < 3) {
    throw new SchematicsException(`Debe introducir un nombre de componente (mínimo 3 caracteres)`);
  }

  if (options.path.startsWith('/')) {
    options.path = options.path.slice(1);
  }

  const templateSource: Source = apply(url(`./files/templates/${options.type}`), [
    applyTemplates({
      classify: strings.classify,
      camelize: strings.camelize,
      dasherize: strings.dasherize,
      capitalize: strings.capitalize,
      name: options.name,
      path: options.path ? options.path : ''
    }),
    move(normalize(`/${PATH_FEATURE}/${options.path}/${strings.dasherize(options.name)}`))
  ]);
  

  return chain([
    checkIfExists(options),
    mergeWith(templateSource, MergeStrategy.Overwrite),
    updateRouting(options)
  ]);
}

function checkIfExists(options: TemplatesSchema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const dirs: DirEntry = tree.getDir(`${PATH_FEATURE}/${options.path}/${options.name}`);
    const files = tree.getDir(`${PATH_FEATURE}/${options.path}/${options.name}`);

    if (dirs?.subdirs.length > 0 || files?.subfiles?.length > 0) {
      return confirmOverride(options).then(shouldOverride => {
        if (!shouldOverride) {
          throw new SchematicsException(`Operación cancelada.`);
        }
      });
    }
    return tree;
  };
}

function confirmOverride(options: TemplatesSchema): Promise<boolean> {
  return new Promise<boolean>((resolve, _reject) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question(
      `El path ${PATH_FEATURE}/${options.path}/${options.name} ya existe. Desea reemplazarlo? (s/n)`,
      (answer: string) => {
        readline.close();
        resolve(answer.toLocaleLowerCase().startsWith('s'));
      }
    );
  });
}

function updateRouting(options: TemplatesSchema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    let routingName: string = '';

    const nameComponent: string = strings.dasherize(options.name);
    const pathComponent: string = strings.dasherize(options.path);

    if (options.path.length > 0) {
      routingName = `${pathComponent}/${nameComponent}`;
    } else {
      routingName = nameComponent;
    }
    const routingClassName: string = strings.classify(options.name);

    if (!tree.exists(ROUTING_FILE_PATH)) {
      _context.logger.warn(`El archivo ${ROUTING_FILE_PATH} no existe.`);
      return tree;
    }

    const fileContent: string = tree.read(ROUTING_FILE_PATH)!.toString('utf-8');

    if (fileContent.indexOf(`path: '${routingName}'`) !== -1) {
      _context.logger.warn(`El path: ${routingName}, ya está creado.`);
      return tree;
    }

    const routesPosition: number = fileContent.indexOf('Routes = [');

    if (routesPosition === -1) {
      _context.logger.warn('El routing no tiene especificado el arreglo de Rutas.');
      return tree;
    }

    const insertPosition: number = fileContent.indexOf(']', routesPosition);

    const routesContent: string = fileContent.substring(routesPosition, insertPosition);

    const lastRoutePosition = routesContent.lastIndexOf('}');
    const lastRoutePositionComma = routesContent.lastIndexOf('},');

    if (insertPosition === -1) {
      _context.logger.warn('No se ha encontrado el Array de rutas, para realizar la inserción.');
      return tree;
    }

    let addComma = '';

    if (lastRoutePosition !== -1) {
      addComma = lastRoutePositionComma !== -1 && lastRoutePosition === lastRoutePositionComma ? '' : ',';
    }

    const newRoute = `\n ${addComma}{path: '${routingName}', loadComponent: () => import('./features/${routingName}/${nameComponent}.component').then((r: any) => r.${routingClassName}Component)},\n`;

    const newContent = `${fileContent.slice(0, insertPosition)}${newRoute}${fileContent.slice(insertPosition)}`;

    tree.overwrite(ROUTING_FILE_PATH, newContent);

    return tree;
  };
}


