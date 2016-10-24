import Resolver from '../../resolver';
import config from '../../config/environment';
import './put-raw';
import './find-raw';
import './create-query-index';
import './assert-attachments';

const resolver = Resolver.create();

resolver.namespace = {
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix
};

export default resolver;
