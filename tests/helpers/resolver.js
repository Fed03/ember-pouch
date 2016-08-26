import Resolver from '../../resolver';
import config from '../../config/environment';
import './create-raw';
import './find-raw';

const resolver = Resolver.create();

resolver.namespace = {
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix
};

export default resolver;
