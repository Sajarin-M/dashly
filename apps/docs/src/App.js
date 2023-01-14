import { jsx as _jsx } from 'react/jsx-runtime';
import { createAvatarComponent } from '@dashly/core/src';
const Avatar = createAvatarComponent({
  getImageUrl: (name) => name,
});
export default function App() {
  return _jsx(Avatar, { text: 's' });
}
