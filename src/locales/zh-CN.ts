import component from './bn-BD/component';
import globalHeader from './bn-BD/globalHeader';
import menu from './bn-BD/menu';
import pages from './bn-BD/pages';
import pwa from './bn-BD/pwa';
import settingDrawer from './bn-BD/settingDrawer';
import settings from './bn-BD/settings';

export default {
  'navBar.lang': 'Idioma',
  'layout.user.link.help': 'Ayuda',
  'layout.user.link.privacy': 'Privacidad',
  'layout.user.link.terms': 'Términos',
  'app.preview.down.block': 'Descargue esta página en su proyecto local',
  'app.welcome.link.fetch-blocks': 'Obtener todos los bloques',
  'app.welcome.link.block-list': 'Cree rápidamente páginas estándar basadas en el desarrollo de `block`.',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...pages,
};

